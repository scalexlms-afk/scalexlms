-- auth_user_role() is used inside RLS policies; authenticated users must execute it.
-- Revoking from anon/public blocks direct RPC abuse while keeping RLS working.

GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated;

DROP POLICY IF EXISTS payments_insert_own ON payments;
DROP POLICY IF EXISTS payments_select_own ON payments;

CREATE POLICY payments_insert_own ON payments
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY payments_select_own ON payments
  FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (id = auth.uid());
