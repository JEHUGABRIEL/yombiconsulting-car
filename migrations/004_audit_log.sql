-- Journal d'audit du back-office : trace des actions sensibles (connexions,
-- publications, suppressions, imports, téléversements).
-- L'e-mail est recopié pour que la trace survive à la suppression du compte.

CREATE TABLE IF NOT EXISTS audit_log (
  id          bigserial PRIMARY KEY,
  admin_id    uuid,
  admin_email text NOT NULL DEFAULT '',
  action      text NOT NULL,
  target      text NOT NULL DEFAULT '',
  detail      text NOT NULL DEFAULT '',
  ip          text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action_idx  ON audit_log (action, created_at DESC);
