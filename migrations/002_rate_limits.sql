-- Compteurs de limitation d'appels partagés entre instances.
-- Remplace le limiteur en mémoire, qui repartait à zéro à chaque redéploiement.

CREATE TABLE IF NOT EXISTS rate_limits (
  key      text PRIMARY KEY,
  count    integer NOT NULL DEFAULT 0,
  reset_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limits_reset_idx ON rate_limits (reset_at);
