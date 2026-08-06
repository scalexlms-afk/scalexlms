-- Platform-wide JSON settings (branding, auth prefs, email, AI, storage, backup)

CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS platform_settings_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Authenticated staff can read
DROP POLICY IF EXISTS platform_settings_staff_select ON platform_settings;
CREATE POLICY platform_settings_staff_select ON platform_settings
  FOR SELECT USING (auth_is_admin());

-- Super admin can insert / update / delete
DROP POLICY IF EXISTS platform_settings_super_admin_insert ON platform_settings;
CREATE POLICY platform_settings_super_admin_insert ON platform_settings
  FOR INSERT WITH CHECK (auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS platform_settings_super_admin_update ON platform_settings;
CREATE POLICY platform_settings_super_admin_update ON platform_settings
  FOR UPDATE
  USING (auth_user_role() = 'super_admin')
  WITH CHECK (auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS platform_settings_super_admin_delete ON platform_settings;
CREATE POLICY platform_settings_super_admin_delete ON platform_settings
  FOR DELETE USING (auth_user_role() = 'super_admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON platform_settings TO authenticated;
GRANT ALL ON platform_settings TO service_role;
