-- Phase 1 security hardening: close RLS privilege-escalation and content-access holes.
-- Strategy: service-role calls (auth.uid() IS NULL) always pass; guards only constrain
-- non-privileged (student/self) actions. Admin portal uses the service role, so its
-- writes are unaffected.

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Active enrolled-or-staff read gate for a given course.
CREATE OR REPLACE FUNCTION auth_can_read_course(p_course_id UUID)
RETURNS BOOLEAN AS $$
  SELECT
    auth_user_role() IN ('super_admin', 'instructor', 'mentor')
    OR EXISTS (
      SELECT 1
      FROM enrollments e
      JOIN profiles p ON p.id = e.student_id
      WHERE e.student_id = auth.uid()
        AND e.course_id = p_course_id
        AND p.status = 'active'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Any active student (used where content is not course-scoped, e.g. media/sessions).
CREATE OR REPLACE FUNCTION auth_is_active_student()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND status = 'active' AND role = 'student'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.auth_can_read_course(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_is_active_student() TO authenticated;

-- ---------------------------------------------------------------------------
-- 1. Profiles: prevent self privilege/status escalation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION guard_profile_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role (no JWT) and super_admin may change anything.
  IF auth.uid() IS NULL OR auth_user_role() = 'super_admin' THEN
    RETURN NEW;
  END IF;
  -- When a user edits their OWN profile row, lock privileged fields to old values.
  -- (Staff editing OTHER users' rows via user client is still bounded by RLS.)
  IF NEW.id = auth.uid() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.mentor_id := OLD.mentor_id;
    NEW.plan := OLD.plan;
    NEW.level := OLD.level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_guard_self_update ON profiles;
CREATE TRIGGER profiles_guard_self_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION guard_profile_self_update();

-- ---------------------------------------------------------------------------
-- 2. Submissions: students cannot self-approve or jump review states
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION guard_submission_status()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR auth_user_role() IN ('super_admin', 'instructor', 'mentor') THEN
    RETURN NEW;
  END IF;
  -- Non-privileged (student) path: only 'not_started' / 'submitted' are allowed.
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('not_started', 'submitted') THEN
      RAISE EXCEPTION 'Students cannot create a submission with status %', NEW.status;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status NOT IN ('not_started', 'submitted') THEN
      RAISE EXCEPTION 'Students cannot set submission status to %', NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS submissions_guard_status ON submissions;
CREATE TRIGGER submissions_guard_status
  BEFORE INSERT OR UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION guard_submission_status();

-- ---------------------------------------------------------------------------
-- 3. Community posts: authors cannot self-approve past moderation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION guard_community_post_status()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR auth_user_role() IN ('super_admin', 'instructor', 'mentor') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'pending_approval' THEN
      RAISE EXCEPTION 'New posts must start as pending_approval';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Authors cannot change their post moderation status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS community_posts_guard_status ON community_posts;
CREATE TRIGGER community_posts_guard_status
  BEFORE INSERT OR UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION guard_community_post_status();

-- ---------------------------------------------------------------------------
-- 4. Scope lesson / task / session reads to active enrolled users (or staff)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS lessons_read ON lessons;
CREATE POLICY lessons_read ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM modules m
    JOIN milestones ms ON ms.id = m.milestone_id
    WHERE m.id = module_id AND auth_can_read_course(ms.course_id)
  )
);

DROP POLICY IF EXISTS tasks_read ON tasks;
CREATE POLICY tasks_read ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM milestones ms
    WHERE ms.id = milestone_id AND auth_can_read_course(ms.course_id)
  )
);

DROP POLICY IF EXISTS live_sessions_select ON live_sessions;
CREATE POLICY live_sessions_select ON live_sessions FOR SELECT USING (
  auth_user_role() IN ('super_admin', 'instructor', 'mentor')
  OR auth_is_active_student()
);

-- ---------------------------------------------------------------------------
-- 5. Lesson media storage: only active students / staff (bucket is private)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS lesson_media_read ON storage.objects;
CREATE POLICY lesson_media_read ON storage.objects FOR SELECT USING (
  bucket_id = 'lesson-media'
  AND (
    auth_user_role() IN ('super_admin', 'instructor', 'mentor')
    OR auth_is_active_student()
  )
);

-- ---------------------------------------------------------------------------
-- 6. AI grounding RPC must respect enrollment (it is SECURITY DEFINER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_lessons_context(query_text TEXT, result_limit INT DEFAULT 5)
RETURNS TABLE (id UUID, title TEXT, content_text TEXT, rank REAL)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.id, l.title, l.content_text,
    ts_rank(l.search_vector, plainto_tsquery('english', query_text)) AS rank
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  JOIN milestones ms ON ms.id = m.milestone_id
  WHERE l.search_vector @@ plainto_tsquery('english', query_text)
    AND auth_can_read_course(ms.course_id)
  ORDER BY rank DESC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION public.search_lessons_context(TEXT, INT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. Enrollment insert requires an actual paid payment (or admin/service role)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS enrollments_insert_own ON enrollments;
CREATE POLICY enrollments_insert_own ON enrollments FOR INSERT WITH CHECK (
  auth_user_role() = 'super_admin'
  OR (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM payments p
      WHERE p.student_id = auth.uid() AND p.status = 'paid'
    )
  )
);

-- ---------------------------------------------------------------------------
-- 8. Trigger guard functions must not be directly RPC-callable
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.guard_profile_self_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_submission_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_community_post_status() FROM PUBLIC, anon, authenticated;
