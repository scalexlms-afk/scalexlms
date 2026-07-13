-- Plan on signup from auth metadata; support tickets; mentor calls;
-- selective live session audience.

-- 1) Persist plan from signup metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_plan plan_type;
BEGIN
  v_plan := CASE
    WHEN COALESCE(NEW.raw_user_meta_data->>'plan', '') = 'premium' THEN 'premium'::plan_type
    ELSE 'standard'::plan_type
  END;

  INSERT INTO public.profiles (id, name, email, role, status, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student',
    'inactive',
    v_plan
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) Live session audience targeting
DO $$ BEGIN
  CREATE TYPE session_audience AS ENUM ('all_premium', 'selected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE live_sessions
  ADD COLUMN IF NOT EXISTS audience session_audience NOT NULL DEFAULT 'all_premium';

-- Students only see sessions they are registered for (or staff see all).
DROP POLICY IF EXISTS live_sessions_select ON live_sessions;
CREATE POLICY live_sessions_select ON live_sessions FOR SELECT USING (
  auth_user_role() IN ('super_admin', 'instructor', 'mentor')
  OR (
    auth_is_active_student()
    AND EXISTS (
      SELECT 1 FROM session_registrations sr
      WHERE sr.session_id = live_sessions.id
        AND sr.student_id = auth.uid()
    )
  )
);

-- 3) Support tickets
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('normal', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_student_idx ON support_tickets (student_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets (status, priority);

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_tickets_select ON support_tickets;
CREATE POLICY support_tickets_select ON support_tickets FOR SELECT USING (
  student_id = auth.uid()
  OR auth_user_role() IN ('super_admin', 'instructor')
  OR (
    auth_user_role() = 'mentor'
    AND mentor_owns_student(student_id)
  )
);

DROP POLICY IF EXISTS support_tickets_insert ON support_tickets;
CREATE POLICY support_tickets_insert ON support_tickets FOR INSERT WITH CHECK (
  student_id = auth.uid()
  AND auth_is_active_student()
);

DROP POLICY IF EXISTS support_tickets_update ON support_tickets;
CREATE POLICY support_tickets_update ON support_tickets FOR UPDATE USING (
  auth_user_role() IN ('super_admin', 'instructor')
  OR (
    auth_user_role() = 'mentor'
    AND mentor_owns_student(student_id)
  )
);

-- 4) Mentor calls log
DO $$ BEGIN
  CREATE TYPE mentor_call_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS mentor_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  notes TEXT,
  status mentor_call_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mentor_calls_student_idx ON mentor_calls (student_id);
CREATE INDEX IF NOT EXISTS mentor_calls_mentor_idx ON mentor_calls (mentor_id);

DROP TRIGGER IF EXISTS mentor_calls_updated_at ON mentor_calls;
CREATE TRIGGER mentor_calls_updated_at
  BEFORE UPDATE ON mentor_calls
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE mentor_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mentor_calls_select ON mentor_calls;
CREATE POLICY mentor_calls_select ON mentor_calls FOR SELECT USING (
  student_id = auth.uid()
  OR mentor_id = auth.uid()
  OR auth_user_role() IN ('super_admin', 'instructor')
);

DROP POLICY IF EXISTS mentor_calls_write ON mentor_calls;
CREATE POLICY mentor_calls_write ON mentor_calls FOR ALL USING (
  auth_user_role() IN ('super_admin', 'instructor')
  OR (
    auth_user_role() = 'mentor'
    AND mentor_id = auth.uid()
    AND mentor_owns_student(student_id)
  )
);
