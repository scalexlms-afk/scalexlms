-- Leftover client-PDF fields: course covers, resource targeting,
-- pinned community posts, complimentary student access, staff invites.
-- Applied on live project ovbijrslpsptkspxitnx as client_pdf_leftover_fields.

-- ---------------------------------------------------------------------------
-- 1. courses.cover_path / cover_url
-- ---------------------------------------------------------------------------
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover_path TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- ---------------------------------------------------------------------------
-- 2. academy_resources targeting
-- ---------------------------------------------------------------------------
ALTER TABLE academy_resources
  ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;
ALTER TABLE academy_resources
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 3. community_posts.pinned
-- ---------------------------------------------------------------------------
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- 4. profiles.complimentary_access
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS complimentary_access BOOLEAN NOT NULL DEFAULT FALSE;

-- Prevent students from granting themselves free access on self-update.
CREATE OR REPLACE FUNCTION guard_profile_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role (no JWT) and super_admin may change anything.
  IF auth.uid() IS NULL OR auth_user_role() = 'super_admin' THEN
    RETURN NEW;
  END IF;
  -- When a user edits their OWN profile row, lock privileged fields to old values.
  IF NEW.id = auth.uid() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.mentor_id := OLD.mentor_id;
    NEW.plan := OLD.plan;
    NEW.level := OLD.level;
    NEW.complimentary_access := OLD.complimentary_access;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- 5. staff_invites
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_invites_pending_email_idx
  ON staff_invites (lower(email))
  WHERE accepted_at IS NULL;

ALTER TABLE staff_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_invites_authenticated_admin ON staff_invites;
CREATE POLICY staff_invites_authenticated_admin ON staff_invites
  FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON staff_invites TO authenticated;
GRANT ALL ON staff_invites TO service_role;
