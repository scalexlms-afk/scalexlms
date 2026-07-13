-- Link payment settings to Standard / Premium product tiers and seed Premium.
ALTER TABLE payment_plan_settings
  ADD COLUMN IF NOT EXISTS plan_type plan_type NOT NULL DEFAULT 'standard';

UPDATE payment_plan_settings
SET plan_type = 'standard',
    updated_at = now()
WHERE plan_key = 'standard_launch';

INSERT INTO payment_plan_settings (
  plan_key,
  plan_type,
  total_cents,
  first_payment_percent,
  remaining_percent,
  is_active
)
VALUES ('premium_launch', 'premium', 199700, 70, 30, true)
ON CONFLICT (plan_key) DO UPDATE
SET plan_type = EXCLUDED.plan_type,
    total_cents = EXCLUDED.total_cents,
    first_payment_percent = EXCLUDED.first_payment_percent,
    remaining_percent = EXCLUDED.remaining_percent,
    is_active = EXCLUDED.is_active,
    updated_at = now();

CREATE UNIQUE INDEX IF NOT EXISTS payment_plan_settings_plan_type_active_uidx
  ON payment_plan_settings (plan_type)
  WHERE is_active = true;
