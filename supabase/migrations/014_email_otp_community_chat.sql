-- Password reset OTPs (service-role only), payment reminder tracking, community media.

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  portal TEXT NOT NULL CHECK (portal IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_otps_email_portal_idx
  ON password_reset_otps (email, portal, created_at DESC);

CREATE INDEX IF NOT EXISTS password_reset_otps_active_idx
  ON password_reset_otps (email, portal)
  WHERE consumed_at IS NULL;

ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS messages_recipient_unread_idx
  ON messages (recipient_id, created_at DESC)
  WHERE read_at IS NULL;
