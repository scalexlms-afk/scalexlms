-- Allow active students (admin-activated / test accounts) to self-enroll,
-- not only those with a paid payment row.
DROP POLICY IF EXISTS enrollments_insert_own ON enrollments;
CREATE POLICY enrollments_insert_own ON enrollments FOR INSERT WITH CHECK (
  auth_user_role() = 'super_admin'
  OR (
    student_id = auth.uid()
    AND (
      auth_is_active_student()
      OR EXISTS (
        SELECT 1 FROM payments p
        WHERE p.student_id = auth.uid() AND p.status = 'paid'
      )
    )
  )
);
