-- Notifications du back-office et gestion de profil.
--
-- 1. `notification_reads` : état de lecture par administrateur. Les alertes
--    elles-mêmes sont dérivées de `audit_log` (une seule source de vérité) ;
--    cette table ne stocke que « qui a lu quelle entrée », sans dupliquer le
--    journal ni le modifier.
-- 2. Champs de profil : nom affiché et fonction, utilisés dans l'interface
--    (barre latérale, alertes). L'e-mail et l'identifiant de connexion sont
--    déjà portés par `admins`.

CREATE TABLE IF NOT EXISTS notification_reads (
  audit_id bigint NOT NULL REFERENCES audit_log (id) ON DELETE CASCADE,
  admin_id uuid   NOT NULL REFERENCES admins (id) ON DELETE CASCADE,
  read_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (audit_id, admin_id)
);

CREATE INDEX IF NOT EXISTS notification_reads_admin_idx ON notification_reads (admin_id);

ALTER TABLE admins ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS job_title    text NOT NULL DEFAULT '';
-- URL Cloudinary de la photo de profil (vide = initiales).
ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url   text NOT NULL DEFAULT '';
