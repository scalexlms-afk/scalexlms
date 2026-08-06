-- Quiz attempts + private storage buckets for certificates and platform backups.

-- ---------------------------------------------------------------------------
-- 1. quiz_attempts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score_percent NUMERIC NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_student_id_idx ON quiz_attempts (student_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx ON quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_lesson_id_idx ON quiz_attempts (lesson_id);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quiz_attempts_student_select ON quiz_attempts;
CREATE POLICY quiz_attempts_student_select ON quiz_attempts
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS quiz_attempts_student_insert ON quiz_attempts;
CREATE POLICY quiz_attempts_student_insert ON quiz_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS quiz_attempts_staff_select ON quiz_attempts;
CREATE POLICY quiz_attempts_staff_select ON quiz_attempts
  FOR SELECT USING (
    auth_user_role() IN ('super_admin', 'instructor', 'mentor')
  );

GRANT SELECT, INSERT ON quiz_attempts TO authenticated;
GRANT ALL ON quiz_attempts TO service_role;

-- ---------------------------------------------------------------------------
-- 2. Storage: certificates (private)
-- Path convention: {student_id}/{course_id}.pdf
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS certificates_storage_staff_all ON storage.objects;
CREATE POLICY certificates_storage_staff_all ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates'
    AND auth_user_role() IN ('super_admin', 'instructor')
  )
  WITH CHECK (
    bucket_id = 'certificates'
    AND auth_user_role() IN ('super_admin', 'instructor')
  );

DROP POLICY IF EXISTS certificates_storage_student_read ON storage.objects;
CREATE POLICY certificates_storage_student_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE ('%' || auth.uid()::text || '%')
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Storage: platform-backups (private, super_admin only)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-backups', 'platform-backups', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS platform_backups_storage_super_admin ON storage.objects;
CREATE POLICY platform_backups_storage_super_admin ON storage.objects
  FOR ALL USING (
    bucket_id = 'platform-backups'
    AND auth_user_role() = 'super_admin'
  )
  WITH CHECK (
    bucket_id = 'platform-backups'
    AND auth_user_role() = 'super_admin'
  );
