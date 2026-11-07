-- Double authentification (TOTP) des comptes administrateurs.
-- Le secret est stocké chiffré (AES-256-GCM, clé dérivée de SESSION_SECRET).
-- Les codes de secours ne sont conservés que hachés.

ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_secret     text;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_enabled_at timestamptz;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_last_step  bigint;

CREATE TABLE IF NOT EXISTS admin_recovery_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  code_hash  text NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_recovery_codes_admin_idx
  ON admin_recovery_codes (admin_id)
  WHERE used_at IS NULL;
