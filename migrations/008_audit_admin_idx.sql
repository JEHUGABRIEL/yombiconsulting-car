-- Activité d'un administrateur depuis le journal : filtre par compte.
CREATE INDEX IF NOT EXISTS audit_log_admin_idx ON audit_log (admin_id, created_at DESC);
