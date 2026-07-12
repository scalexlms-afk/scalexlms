-- Phase 3: CRM, Finance, Admin RLS extensions

CREATE TYPE lead_stage AS ENUM (
  'new_lead',
  'contacted',
  'interested',
  'demo',
  'payment_pending',
  'enrolled'
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  source TEXT,
  assigned_sales_id UUID REFERENCES profiles(id),
  stage lead_stage NOT NULL DEFAULT 'new_lead',
  notes TEXT,
  converted_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount INT NOT NULL,
  incurred_at DATE NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Admin profile reads (additive policies; OR'd with profiles_select_own)
CREATE POLICY profiles_admin_select ON profiles
  FOR SELECT
  USING (
    auth_user_role() = 'super_admin'
    OR (
      auth_user_role() = 'instructor'
      AND role = 'student'
    )
    OR (
      auth_user_role() = 'mentor'
      AND (id = auth.uid() OR mentor_id = auth.uid())
    )
    OR (
      auth_user_role() = 'sales'
      AND id IN (
        SELECT converted_user_id
        FROM leads
        WHERE assigned_sales_id = auth.uid()
          AND converted_user_id IS NOT NULL
      )
    )
  );

CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE
  USING (auth_user_role() = 'super_admin')
  WITH CHECK (auth_user_role() = 'super_admin');

-- Payments / invoices admin reads
CREATE POLICY payments_admin_select ON payments
  FOR SELECT
  USING (
    auth_user_role() = 'super_admin'
    OR (
      auth_user_role() = 'sales'
      AND student_id IN (
        SELECT converted_user_id
        FROM leads
        WHERE assigned_sales_id = auth.uid()
          AND converted_user_id IS NOT NULL
      )
    )
  );

CREATE POLICY invoices_admin_select ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM payments p
      WHERE p.id = payment_id
        AND (
          p.student_id = auth.uid()
          OR auth_user_role() = 'super_admin'
          OR (
            auth_user_role() = 'sales'
            AND p.student_id IN (
              SELECT converted_user_id
              FROM leads
              WHERE assigned_sales_id = auth.uid()
                AND converted_user_id IS NOT NULL
            )
          )
        )
    )
  );

CREATE POLICY enrollments_admin_select ON enrollments
  FOR SELECT
  USING (
    student_id = auth.uid()
    OR auth_user_role() = 'super_admin'
    OR (
      auth_user_role() = 'instructor'
      AND EXISTS (
        SELECT 1 FROM profiles pr WHERE pr.id = student_id AND pr.role = 'student'
      )
    )
    OR (
      auth_user_role() = 'mentor'
      AND EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.id = student_id AND pr.mentor_id = auth.uid()
      )
    )
  );

CREATE POLICY payment_plan_admin_write ON payment_plan_settings
  FOR ALL
  USING (auth_user_role() = 'super_admin')
  WITH CHECK (auth_user_role() = 'super_admin');

-- Leads RLS
CREATE POLICY leads_super_admin ON leads
  FOR ALL
  USING (auth_user_role() = 'super_admin')
  WITH CHECK (auth_user_role() = 'super_admin');

CREATE POLICY leads_sales_own ON leads
  FOR ALL
  USING (
    auth_user_role() = 'sales'
    AND assigned_sales_id = auth.uid()
  )
  WITH CHECK (
    auth_user_role() = 'sales'
    AND assigned_sales_id = auth.uid()
  );

-- Expenses: super_admin only
CREATE POLICY expenses_super_admin ON expenses
  FOR ALL
  USING (auth_user_role() = 'super_admin')
  WITH CHECK (auth_user_role() = 'super_admin');
