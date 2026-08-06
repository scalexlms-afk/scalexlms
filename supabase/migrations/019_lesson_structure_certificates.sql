-- Phase 2 lesson structure: completion types, lesson resources, quizzes,
-- unlock rules, certificates; tasks attach to lessons (multi-task milestones).

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
CREATE TYPE lesson_completion_type AS ENUM (
  'view_only',
  'upload_file',
  'quiz_pass',
  'mentor_task'
);

-- ---------------------------------------------------------------------------
-- 2. Alter lessons
-- ---------------------------------------------------------------------------
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS ai_prompt TEXT,
  ADD COLUMN IF NOT EXISTS completion_type lesson_completion_type NOT NULL DEFAULT 'view_only',
  ADD COLUMN IF NOT EXISTS xp_points INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level TEXT,
  ADD COLUMN IF NOT EXISTS learning_objectives TEXT[],
  ADD COLUMN IF NOT EXISTS estimated_minutes INT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_status_check'
  ) THEN
    ALTER TABLE lessons
      ADD CONSTRAINT lessons_status_check
      CHECK (status IN ('draft', 'published'));
  END IF;
END $$;

-- Preserve student access: existing content was already live without a status.
UPDATE lessons SET status = 'published' WHERE status = 'draft';

-- ---------------------------------------------------------------------------
-- 3. lesson_resources
-- ---------------------------------------------------------------------------
CREATE TABLE lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size_bytes INT,
  mime_type TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX lesson_resources_lesson_id_idx ON lesson_resources (lesson_id);

CREATE TRIGGER lesson_resources_updated_at
  BEFORE UPDATE ON lesson_resources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Alter tasks + backfill lesson_id BEFORE dropping milestone uniqueness
-- ---------------------------------------------------------------------------
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS review_method TEXT NOT NULL DEFAULT 'mentor';

-- Backfill: attach each task to the last lesson in its milestone; if none,
-- create module "Gate" + lesson "Milestone task" under that milestone.
DO $$
DECLARE
  r RECORD;
  v_lesson_id UUID;
  v_module_id UUID;
  v_next_module_order INT;
BEGIN
  FOR r IN
    SELECT id AS task_id, milestone_id
    FROM tasks
    WHERE milestone_id IS NOT NULL AND lesson_id IS NULL
  LOOP
    SELECT l.id INTO v_lesson_id
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE m.milestone_id = r.milestone_id
    ORDER BY m.order_index DESC, l.order_index DESC
    LIMIT 1;

    IF v_lesson_id IS NULL THEN
      SELECT COALESCE(MAX(order_index), 0) + 1 INTO v_next_module_order
      FROM modules
      WHERE milestone_id = r.milestone_id;

      INSERT INTO modules (milestone_id, title, order_index)
      VALUES (r.milestone_id, 'Gate', v_next_module_order)
      RETURNING id INTO v_module_id;

      INSERT INTO lessons (
        module_id,
        title,
        content_type,
        content_text,
        order_index,
        completion_type,
        status
      )
      VALUES (
        v_module_id,
        'Milestone task',
        'text',
        'Gating task for this milestone.',
        1,
        'mentor_task',
        'published'
      )
      RETURNING id INTO v_lesson_id;
    END IF;

    UPDATE tasks
    SET lesson_id = v_lesson_id, updated_at = NOW()
    WHERE id = r.task_id;
  END LOOP;
END $$;

-- Drop one-task-per-milestone uniqueness; keep milestone_id for audit (nullable).
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_milestone_id_key;
ALTER TABLE tasks ALTER COLUMN milestone_id DROP NOT NULL;

-- Require lesson attachment going forward.
ALTER TABLE tasks ALTER COLUMN lesson_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS tasks_lesson_id_idx ON tasks (lesson_id);
CREATE INDEX IF NOT EXISTS tasks_milestone_id_idx ON tasks (milestone_id);

-- ---------------------------------------------------------------------------
-- 5. quizzes + quiz_questions
-- ---------------------------------------------------------------------------
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pass_percent INT NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX quizzes_lesson_id_idx ON quizzes (lesson_id);

CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX quiz_questions_quiz_id_idx ON quiz_questions (quiz_id);

-- ---------------------------------------------------------------------------
-- 6. unlock_rules
-- ---------------------------------------------------------------------------
CREATE TABLE unlock_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE UNIQUE,
  rule_type TEXT NOT NULL DEFAULT 'previous_milestone_required_tasks',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER unlock_rules_updated_at
  BEFORE UPDATE ON unlock_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. certificates
-- ---------------------------------------------------------------------------
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url TEXT,
  UNIQUE (student_id, course_id)
);

CREATE INDEX certificates_student_id_idx ON certificates (student_id);
CREATE INDEX certificates_course_id_idx ON certificates (course_id);

-- ---------------------------------------------------------------------------
-- 8. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlock_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Lessons: students see published only; staff (incl. mentors/sales via admin helper) read all.
DROP POLICY IF EXISTS lessons_read ON lessons;
CREATE POLICY lessons_read ON lessons FOR SELECT USING (
  (
    status = 'published'
    AND EXISTS (
      SELECT 1
      FROM modules m
      JOIN milestones ms ON ms.id = m.milestone_id
      WHERE m.id = module_id
        AND auth_can_read_course(ms.course_id)
    )
  )
  OR auth_user_role() IN ('super_admin', 'instructor', 'mentor')
);

CREATE POLICY lessons_staff_write ON lessons
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- lesson_resources
CREATE POLICY lesson_resources_student_select ON lesson_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN milestones ms ON ms.id = m.milestone_id
      WHERE l.id = lesson_id
        AND l.status = 'published'
        AND auth_can_read_course(ms.course_id)
    )
  );

CREATE POLICY lesson_resources_staff_select ON lesson_resources
  FOR SELECT USING (auth_is_admin());

CREATE POLICY lesson_resources_staff_write ON lesson_resources
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- quizzes
CREATE POLICY quizzes_student_select ON quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN milestones ms ON ms.id = m.milestone_id
      WHERE l.id = lesson_id
        AND l.status = 'published'
        AND auth_can_read_course(ms.course_id)
    )
  );

CREATE POLICY quizzes_staff_select ON quizzes
  FOR SELECT USING (auth_is_admin());

CREATE POLICY quizzes_staff_write ON quizzes
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- quiz_questions
CREATE POLICY quiz_questions_student_select ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN milestones ms ON ms.id = m.milestone_id
      WHERE q.id = quiz_id
        AND l.status = 'published'
        AND auth_can_read_course(ms.course_id)
    )
  );

CREATE POLICY quiz_questions_staff_select ON quiz_questions
  FOR SELECT USING (auth_is_admin());

CREATE POLICY quiz_questions_staff_write ON quiz_questions
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- unlock_rules: students/staff can read enabled rules; staff write
CREATE POLICY unlock_rules_select ON unlock_rules
  FOR SELECT USING (
    (enabled = TRUE AND auth.uid() IS NOT NULL)
    OR auth_is_admin()
  );

CREATE POLICY unlock_rules_staff_write ON unlock_rules
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- certificates: students read own; staff write
CREATE POLICY certificates_student_select ON certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR auth_user_role() IN ('super_admin', 'instructor', 'mentor')
  );

CREATE POLICY certificates_staff_write ON certificates
  FOR ALL USING (
    auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    auth_user_role() IN ('super_admin', 'instructor')
  );

-- Tasks: also readable via lesson → published course (milestone_id may be null later)
DROP POLICY IF EXISTS tasks_read ON tasks;
CREATE POLICY tasks_read ON tasks FOR SELECT USING (
  (
    milestone_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM milestones ms
      WHERE ms.id = milestone_id AND auth_can_read_course(ms.course_id)
    )
  )
  OR EXISTS (
    SELECT 1
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN milestones ms ON ms.id = m.milestone_id
    WHERE l.id = lesson_id AND auth_can_read_course(ms.course_id)
  )
);

-- ---------------------------------------------------------------------------
-- 9. is_milestone_unlocked — previous milestone required tasks all approved
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_milestone_unlocked(p_student_id UUID, p_milestone_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_order INT;
  v_prev_milestone_id UUID;
  v_rule_enabled BOOLEAN;
  v_required_count INT;
  v_approved_count INT;
BEGIN
  SELECT order_index INTO v_order FROM milestones WHERE id = p_milestone_id;
  IF v_order IS NULL THEN
    RETURN FALSE;
  END IF;

  -- First milestone in a course is always unlocked.
  IF v_order = 1 THEN
    RETURN TRUE;
  END IF;

  -- Per-milestone unlock rule: if present and disabled, treat as unlocked.
  SELECT enabled INTO v_rule_enabled
  FROM unlock_rules
  WHERE milestone_id = p_milestone_id;

  IF v_rule_enabled IS NOT NULL AND v_rule_enabled = FALSE THEN
    RETURN TRUE;
  END IF;

  SELECT ms.id INTO v_prev_milestone_id
  FROM milestones ms
  JOIN milestones cur ON cur.course_id = ms.course_id
  WHERE cur.id = p_milestone_id
    AND ms.order_index = v_order - 1;

  IF v_prev_milestone_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO v_required_count
  FROM tasks t
  WHERE t.milestone_id = v_prev_milestone_id
    AND t.is_required = TRUE;

  -- No required tasks → previous milestone does not gate progression.
  IF v_required_count = 0 THEN
    RETURN TRUE;
  END IF;

  SELECT COUNT(*) INTO v_approved_count
  FROM tasks t
  WHERE t.milestone_id = v_prev_milestone_id
    AND t.is_required = TRUE
    AND EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.task_id = t.id
        AND s.student_id = p_student_id
        AND s.status = 'approved'
    );

  RETURN v_approved_count = v_required_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_milestone_unlocked(UUID, UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 10. Seed one unlock_rule per existing milestone
-- ---------------------------------------------------------------------------
INSERT INTO unlock_rules (milestone_id, rule_type, config, enabled)
SELECT
  m.id,
  'previous_milestone_required_tasks',
  '{}'::jsonb,
  TRUE
FROM milestones m
ON CONFLICT (milestone_id) DO NOTHING;
