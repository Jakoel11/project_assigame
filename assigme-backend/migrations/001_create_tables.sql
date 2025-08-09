
select * from annonces;
select * from conversations;


-- migrations/001_create_tables.sql
BEGIN;

-- 1. Table users
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR(100)   NOT NULL,
  email           VARCHAR(255)   NOT NULL UNIQUE,
  phone           VARCHAR(20)    NOT NULL,
  password_hash   VARCHAR(255)   NOT NULL,
  account_type    VARCHAR(50)    NOT NULL DEFAULT 'particulier',
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- 2. Table categories
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL    PRIMARY KEY,
  nom   VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Table sous_categories
CREATE TABLE IF NOT EXISTS sous_categories (
  id            SERIAL    PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  categorie_id  INTEGER   NOT NULL
    REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT uc_sous_cat UNIQUE(categorie_id, nom)
);

-- 4. Table annonces
CREATE TABLE IF NOT EXISTS annonces (
  id                 SERIAL    PRIMARY KEY,
  user_id            INTEGER   NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  titre              VARCHAR(200) NOT NULL,
  description        TEXT,
  prix               NUMERIC(12,2) NOT NULL,
  categorie_id       INTEGER   NOT NULL
    REFERENCES categories(id),
  sous_categorie_id  INTEGER
    REFERENCES sous_categories(id),
  ville              VARCHAR(100) NOT NULL,
  images             TEXT,              -- JSON array d’URLs ou chaîne séparée par virgule
  is_boosted         BOOLEAN   NOT NULL DEFAULT FALSE,
  date_creation      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index sur date_creation pour accélérer les tris
CREATE INDEX IF NOT EXISTS idx_annonces_date_creation
  ON annonces(date_creation DESC);

COMMIT;







