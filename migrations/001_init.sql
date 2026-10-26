-- Schéma initial du back-office Yo Mbi Consulting.
-- Contenu bilingue : chaque champ éditorial existe en _fr et _en.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text NOT NULL UNIQUE,
  username            text UNIQUE,
  password_hash       text,
  role                text NOT NULL DEFAULT 'admin',
  status              text NOT NULL DEFAULT 'active',
  password_changed_at timestamptz,
  last_login_at       timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admins_role_check   CHECK (role   IN ('superadmin', 'admin')),
  CONSTRAINT admins_status_check CHECK (status IN ('active', 'blocked'))
);

CREATE TABLE IF NOT EXISTS services (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL UNIQUE,
  title_fr       text NOT NULL,
  title_en       text NOT NULL DEFAULT '',
  description_fr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  list_fr        jsonb NOT NULL DEFAULT '[]'::jsonb,
  list_en        jsonb NOT NULL DEFAULT '[]'::jsonb,
  subject        text NOT NULL DEFAULT '',
  image          text NOT NULL DEFAULT '',
  published      boolean NOT NULL DEFAULT true,
  position       integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS formations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  title_fr         text NOT NULL,
  title_en         text NOT NULL DEFAULT '',
  category         text NOT NULL DEFAULT 'sec',
  description_fr   text NOT NULL DEFAULT '',
  description_en   text NOT NULL DEFAULT '',
  duration_fr      text NOT NULL DEFAULT '',
  duration_en      text NOT NULL DEFAULT '',
  format_fr        text NOT NULL DEFAULT '',
  format_en        text NOT NULL DEFAULT '',
  objectives_fr    jsonb NOT NULL DEFAULT '[]'::jsonb,
  objectives_en    jsonb NOT NULL DEFAULT '[]'::jsonb,
  public_cible_fr  text NOT NULL DEFAULT '',
  public_cible_en  text NOT NULL DEFAULT '',
  image            text NOT NULL DEFAULT '',
  published        boolean NOT NULL DEFAULT true,
  position         integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT formations_category_check CHECK (category IN ('sec', 'mgmt', 'ent'))
);

CREATE TABLE IF NOT EXISTS actualites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  title_fr     text NOT NULL,
  title_en     text NOT NULL DEFAULT '',
  excerpt_fr   text NOT NULL DEFAULT '',
  excerpt_en   text NOT NULL DEFAULT '',
  content_fr   jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_en   jsonb NOT NULL DEFAULT '[]'::jsonb,
  category     text NOT NULL DEFAULT '',
  image        text NOT NULL DEFAULT '',
  published    boolean NOT NULL DEFAULT true,
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text NOT NULL DEFAULT '',
  company    text NOT NULL DEFAULT '',
  subject    text NOT NULL DEFAULT '',
  body       text NOT NULL,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_position_idx    ON services (position, created_at);
CREATE INDEX IF NOT EXISTS formations_position_idx  ON formations (position, created_at);
CREATE INDEX IF NOT EXISTS actualites_published_idx ON actualites (published_at DESC);
CREATE INDEX IF NOT EXISTS messages_created_idx     ON messages (created_at DESC);
