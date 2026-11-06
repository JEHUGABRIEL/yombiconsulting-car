-- Révocation des sessions : chaque jeton porte la version courante de l'admin.
-- Incrémenter la colonne invalide tous les jetons déjà émis pour ce compte.

ALTER TABLE admins ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;
