-- Phase 2: Tasks, AI, Community, Gamification, Live Sessions

-- Enums
CREATE TYPE submission_status AS ENUM (
  'not_started', 'submitted', 'under_review', 'approved', 'revision_required'
);
CREATE TYPE review_decision AS ENUM ('approved', 'revision_required');
CREATE TYPE community_channel AS ENUM (
  'announcements', 'product_hunting', 'supplier_help', 'ppc_discussion', 'questions', 'student_wins'
);
CREATE TYPE post_status AS ENUM ('pending_approval', 'approved', 'rejected');
CREATE TYPE live_session_type AS ENUM ('batch_class', 'masterclass', 'qa', 'case_study');
CREATE TYPE submission_format AS ENUM ('image', 'excel', 'pdf', 'link', 'text');

-- Tasks (one gating task per milestone)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  accepted_formats submission_format[] NOT NULL DEFAULT '{text,link,pdf,image,excel}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  status submission_status NOT NULL DEFAULT 'not_started',
  ai_score REAL,
  ai_notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, student_id)
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  decision review_decision NOT NULL,
  feedback TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel community_channel NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status post_status NOT NULL DEFAULT 'pending_approval',
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_likes (
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Direct messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Live sessions
CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type live_session_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  host_id UUID NOT NULL REFERENCES profiles(id),
  meeting_url TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_registrations (
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, student_id)
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key, student_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI chat history
CREATE TABLE ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FTS on lessons for AI grounding
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION lessons_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content_text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lessons_search_vector_trigger
  BEFORE INSERT OR UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION lessons_search_vector_update();

UPDATE lessons SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content_text, '')), 'B');

CREATE INDEX lessons_search_idx ON lessons USING GIN (search_vector);

-- Updated_at triggers
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER live_sessions_updated_at BEFORE UPDATE ON live_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ai_chats_updated_at BEFORE UPDATE ON ai_chats FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Helper functions
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('super_admin', 'instructor', 'mentor', 'sales');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mentor_owns_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_student_id AND mentor_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_milestone_unlocked(p_student_id UUID, p_milestone_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_order INT;
  v_prev_milestone_id UUID;
  v_prev_approved BOOLEAN;
BEGIN
  SELECT order_index INTO v_order FROM milestones WHERE id = p_milestone_id;
  IF v_order IS NULL THEN RETURN FALSE; END IF;
  IF v_order = 1 THEN RETURN TRUE; END IF;

  SELECT ms.id INTO v_prev_milestone_id
  FROM milestones ms
  JOIN milestones cur ON cur.course_id = ms.course_id
  WHERE cur.id = p_milestone_id AND ms.order_index = v_order - 1;

  IF v_prev_milestone_id IS NULL THEN RETURN FALSE; END IF;

  SELECT EXISTS (
    SELECT 1 FROM submissions s
    JOIN tasks t ON t.id = s.task_id
    WHERE t.milestone_id = v_prev_milestone_id
      AND s.student_id = p_student_id
      AND s.status = 'approved'
  ) INTO v_prev_approved;

  RETURN v_prev_approved;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Extended completion rollup (lessons + gating task approval)
CREATE OR REPLACE FUNCTION refresh_enrollment_completion(p_student_id UUID, p_course_id UUID)
RETURNS VOID AS $$
DECLARE
  total_units INT;
  completed_units INT;
  pct REAL;
  ms RECORD;
  ms_lessons INT;
  ms_completed_lessons INT;
  ms_task_approved BOOLEAN;
BEGIN
  total_units := 0;
  completed_units := 0;

  FOR ms IN
    SELECT id FROM milestones WHERE course_id = p_course_id ORDER BY order_index
  LOOP
    SELECT COUNT(l.id) INTO ms_lessons
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE m.milestone_id = ms.id;

    SELECT COUNT(lc.id) INTO ms_completed_lessons
    FROM lesson_completions lc
    JOIN lessons l ON l.id = lc.lesson_id
    JOIN modules m ON m.id = l.module_id
    WHERE m.milestone_id = ms.id AND lc.student_id = p_student_id;

    SELECT EXISTS (
      SELECT 1 FROM submissions s
      JOIN tasks t ON t.id = s.task_id
      WHERE t.milestone_id = ms.id
        AND s.student_id = p_student_id
        AND s.status = 'approved'
    ) INTO ms_task_approved;

    total_units := total_units + ms_lessons + 1;
    completed_units := completed_units + ms_completed_lessons + CASE WHEN ms_task_approved THEN 1 ELSE 0 END;
  END LOOP;

  IF total_units = 0 THEN
    pct := 0;
  ELSE
    pct := (completed_units::REAL / total_units::REAL) * 100;
  END IF;

  UPDATE enrollments
  SET completion_percent = pct, updated_at = NOW()
  WHERE student_id = p_student_id AND course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_submission_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
  v_milestone_id UUID;
  v_order INT;
  v_approved_count INT;
  v_new_level student_level;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT ms.course_id, ms.id, ms.order_index
    INTO v_course_id, v_milestone_id, v_order
    FROM tasks t
    JOIN milestones ms ON ms.id = t.milestone_id
    WHERE t.id = NEW.task_id;

    PERFORM refresh_enrollment_completion(NEW.student_id, v_course_id);

    UPDATE profiles
    SET current_stage = (SELECT title FROM milestones WHERE id = v_milestone_id),
        updated_at = NOW()
    WHERE id = NEW.student_id;

    SELECT COUNT(*) INTO v_approved_count
    FROM submissions s
    JOIN tasks t ON t.id = s.task_id
    JOIN milestones ms ON ms.id = t.milestone_id
    WHERE s.student_id = NEW.student_id
      AND s.status = 'approved'
      AND ms.course_id = v_course_id;

    v_new_level := CASE
      WHEN v_approved_count >= 8 THEN 'amazon_launcher'::student_level
      WHEN v_approved_count >= 6 THEN 'brand_builder'::student_level
      WHEN v_approved_count >= 3 THEN 'research_expert'::student_level
      ELSE 'beginner_seller'::student_level
    END;

    UPDATE profiles SET level = v_new_level, updated_at = NOW() WHERE id = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_submission_status_change
  AFTER UPDATE OF status ON submissions
  FOR EACH ROW EXECUTE FUNCTION handle_submission_status_change();

-- Post like count trigger
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mentor_owns_student(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_milestone_unlocked(UUID, UUID) TO authenticated;

-- Tasks: readable by authenticated users on published courses
CREATE POLICY tasks_read ON tasks FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY tasks_admin_write ON tasks FOR ALL USING (
  auth_user_role() IN ('super_admin', 'instructor')
);

-- Submissions
CREATE POLICY submissions_select ON submissions FOR SELECT USING (
  student_id = auth.uid()
  OR auth_user_role() = 'super_admin'
  OR (auth_user_role() = 'mentor' AND mentor_owns_student(student_id))
  OR auth_user_role() = 'instructor'
);

CREATE POLICY submissions_insert ON submissions FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

CREATE POLICY submissions_update ON submissions FOR UPDATE USING (
  student_id = auth.uid()
  OR auth_user_role() = 'super_admin'
  OR (auth_user_role() = 'mentor' AND mentor_owns_student(student_id))
  OR auth_user_role() = 'instructor'
);

-- Reviews
CREATE POLICY reviews_select ON reviews FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM submissions s
    WHERE s.id = submission_id
      AND (s.student_id = auth.uid()
        OR auth_user_role() = 'super_admin'
        OR (auth_user_role() = 'mentor' AND mentor_owns_student(s.student_id))
        OR auth_user_role() = 'instructor')
  )
);

CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid()
  AND auth_user_role() IN ('super_admin', 'instructor', 'mentor')
);

-- Community posts
CREATE POLICY community_posts_select ON community_posts FOR SELECT USING (
  status = 'approved'
  OR author_id = auth.uid()
  OR auth_user_role() IN ('super_admin', 'instructor', 'mentor')
);

CREATE POLICY community_posts_insert ON community_posts FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND auth_user_role() != 'sales'
);

CREATE POLICY community_posts_update ON community_posts FOR UPDATE USING (
  author_id = auth.uid()
  OR auth_user_role() IN ('super_admin', 'instructor', 'mentor')
);

-- Comments
CREATE POLICY comments_select ON comments FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY comments_insert ON comments FOR INSERT WITH CHECK (
  author_id = auth.uid() AND auth_user_role() != 'sales'
);

-- Post likes
CREATE POLICY post_likes_select ON post_likes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY post_likes_insert ON post_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY post_likes_delete ON post_likes FOR DELETE USING (user_id = auth.uid());

-- Messages
CREATE POLICY messages_select ON messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Live sessions
CREATE POLICY live_sessions_select ON live_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY live_sessions_write ON live_sessions FOR ALL USING (
  auth_user_role() IN ('super_admin', 'instructor')
);

-- Session registrations
CREATE POLICY session_registrations_select ON session_registrations FOR SELECT USING (
  student_id = auth.uid() OR auth_user_role() IN ('super_admin', 'instructor')
);
CREATE POLICY session_registrations_insert ON session_registrations FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

-- Badges
CREATE POLICY badges_select ON badges FOR SELECT USING (
  student_id = auth.uid() OR auth_user_role() IN ('super_admin', 'instructor', 'mentor')
);

-- Notifications
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Audit log (admins read, system inserts via service role)
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (
  auth_user_role() IN ('super_admin', 'instructor', 'mentor')
);

-- AI chats
CREATE POLICY ai_chats_select ON ai_chats FOR SELECT USING (student_id = auth.uid());
CREATE POLICY ai_chats_insert ON ai_chats FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY ai_chats_update ON ai_chats FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY ai_chat_messages_select ON ai_chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM ai_chats c WHERE c.id = chat_id AND c.student_id = auth.uid())
);
CREATE POLICY ai_chat_messages_insert ON ai_chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ai_chats c WHERE c.id = chat_id AND c.student_id = auth.uid())
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY submissions_storage_read ON storage.objects FOR SELECT USING (
  bucket_id = 'submissions' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR auth_user_role() IN ('super_admin', 'instructor', 'mentor')
  )
);
CREATE POLICY submissions_storage_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY community_media_read ON storage.objects FOR SELECT USING (bucket_id = 'community-media');
CREATE POLICY community_media_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'community-media' AND auth.uid() IS NOT NULL
);
