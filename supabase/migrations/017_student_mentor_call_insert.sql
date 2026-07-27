-- Allow Premium students to request mentor calls with their assigned mentor.
DROP POLICY IF EXISTS mentor_calls_student_insert ON mentor_calls;
CREATE POLICY mentor_calls_student_insert ON mentor_calls
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND status = 'scheduled'
    AND mentor_id = (
      SELECT p.mentor_id
      FROM profiles p
      WHERE p.id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.plan = 'premium'
        AND p.mentor_id IS NOT NULL
    )
  );
