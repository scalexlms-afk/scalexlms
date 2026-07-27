-- Account settings: profile extras, notification prefs, learning settings, avatars bucket

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Unique only when set (multiple NULLs allowed)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_key
  ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Lock stripe_customer_id on self-update (service role / super_admin may set it)
CREATE OR REPLACE FUNCTION guard_profile_self_update()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NULL OR auth_user_role() = 'super_admin' THEN
    RETURN NEW;
  END IF;
  IF NEW.id = auth.uid() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.mentor_id := OLD.mentor_id;
    NEW.plan := OLD.plan;
    NEW.level := OLD.level;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  in_app boolean NOT NULL DEFAULT true,
  email boolean NOT NULL DEFAULT true,
  browser boolean NOT NULL DEFAULT false,
  push boolean NOT NULL DEFAULT false,
  whatsapp boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notification_preferences_select_own ON notification_preferences;
CREATE POLICY notification_preferences_select_own ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_insert_own ON notification_preferences;
CREATE POLICY notification_preferences_insert_own ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_update_own ON notification_preferences;
CREATE POLICY notification_preferences_update_own ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  learning jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_settings_select_own ON user_settings;
CREATE POLICY user_settings_select_own ON user_settings
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_settings_insert_own ON user_settings;
CREATE POLICY user_settings_insert_own ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_settings_update_own ON user_settings;
CREATE POLICY user_settings_update_own ON user_settings
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Public avatars: path must be {user_id}/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
CREATE POLICY avatars_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS avatars_update_own ON storage.objects;
CREATE POLICY avatars_update_own ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS avatars_delete_own ON storage.objects;
CREATE POLICY avatars_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
