-- Invitations d'administrateurs.
-- Le lien d'invitation porte un jeton aléatoire ; seule son empreinte SHA-256
-- est stockée, pour qu'une lecture de la base ne permette pas de s'en servir.

CREATE TABLE IF NOT EXISTS admin_invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'admin',
  token_hash  text NOT NULL UNIQUE,
  invited_by  uuid REFERENCES admins(id) ON DELETE SET NULL,
  expires_at  timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_invitations_role_check CHECK (role IN ('superadmin', 'admin'))
);

-- Une seule invitation en attente par adresse : une nouvelle invitation
-- remplace l'ancienne plutôt que de laisser deux liens valides.
CREATE UNIQUE INDEX IF NOT EXISTS admin_invitations_pending_email_idx
  ON admin_invitations (lower(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS admin_invitations_expires_idx
  ON admin_invitations (expires_at)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
