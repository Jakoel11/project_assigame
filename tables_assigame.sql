
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


-- migrations/002_seed_categories.sql
BEGIN;

-- 1) Insérer les catégories
INSERT INTO categories (nom) VALUES
  ('Alimentation & Boissons'),
  ('Électronique & Informatique'),
  ('Mode & Vêtements'),
  ('Maison & Jardin'),
  ('Beauté & Santé'),
  ('Sport & Loisirs'),
  ('Bébés & Enfants'),
  ('Automobile & Moto'),
  ('Livres & Médias'),
  ('Animaux'),
  ('Bricolage & Matériaux'),
  ('Services'),
  ('Papeterie & Fournitures'),
  ('Jeux & Jouets'),
  ('Art & Artisanat'),
  ('Industrie & Pro'),
  ('Voyage & Bagagerie'),
  ('Énergie & Écologie'),
  ('Culture & Religion'),
  ('Jeux d''argent & Loterie'),
  ('Télécommunications'),
  ('Immobilier & Construction'),
  ('Éducation & Formation')
ON CONFLICT (nom) DO NOTHING;  -- évite doublons si déjà inséré

-- 2) Insérer les sous-catégories
-- Chaque ligne reprend la syntaxe : 
-- INSERT INTO sous_categories(nom, categorie_id) VALUES ('NomSousCat', (SELECT id FROM categories WHERE nom='NomCat'));
-- Et ON CONFLICT pour ignorer si déjà présent.

-- Alimentation & Boissons
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Fruits',              (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Légumes',             (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Viandes',             (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Poissons',            (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Produits laitiers',   (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Épices',              (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Snacks',              (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Surgelés',            (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Bio',                 (SELECT id FROM categories WHERE nom='Alimentation & Boissons')),
  ('Boissons',            (SELECT id FROM categories WHERE nom='Alimentation & Boissons'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Électronique & Informatique
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Smartphones',         (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Ordinateurs',         (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Tablettes',           (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Accessoires',         (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Télévisions',         (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Audio',               (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Appareils photo',     (SELECT id FROM categories WHERE nom='Électronique & Informatique')),
  ('Drones',              (SELECT id FROM categories WHERE nom='Électronique & Informatique'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Mode & Vêtements
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Hommes',              (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Femmes',              (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Enfants',             (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Chaussures',          (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Sacs',                (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Bijoux',              (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Montres',             (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Lunettes',            (SELECT id FROM categories WHERE nom='Mode & Vêtements')),
  ('Sous-vêtements',      (SELECT id FROM categories WHERE nom='Mode & Vêtements'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Maison & Jardin
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Meubles',             (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Décoration',          (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Linge de maison',     (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Outils',              (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Plantes',             (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Jardinage',           (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Éclairage',           (SELECT id FROM categories WHERE nom='Maison & Jardin')),
  ('Rangement',           (SELECT id FROM categories WHERE nom='Maison & Jardin'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Beauté & Santé
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Maquillage',          (SELECT id FROM categories WHERE nom='Beauté & Santé')),
  ('Soins de la peau',    (SELECT id FROM categories WHERE nom='Beauté & Santé')),
  ('Parfums',             (SELECT id FROM categories WHERE nom='Beauté & Santé')),
  ('Produits capillaires',(SELECT id FROM categories WHERE nom='Beauté & Santé')),
  ('Hygiène',             (SELECT id FROM categories WHERE nom='Beauté & Santé')),
  ('Suppléments',         (SELECT id FROM categories WHERE nom='Beauté & Santé')),
  ('Matériel médical',    (SELECT id FROM categories WHERE nom='Beauté & Santé'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Sport & Loisirs
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Vêtements de sport',  (SELECT id FROM categories WHERE nom='Sport & Loisirs')),
  ('Équipements',         (SELECT id FROM categories WHERE nom='Sport & Loisirs')),
  ('Vélo',                (SELECT id FROM categories WHERE nom='Sport & Loisirs')),
  ('Camping',             (SELECT id FROM categories WHERE nom='Sport & Loisirs')),
  ('Fitness',             (SELECT id FROM categories WHERE nom='Sport & Loisirs')),
  ('Jeux extérieurs',     (SELECT id FROM categories WHERE nom='Sport & Loisirs')),
  ('Sports nautiques',    (SELECT id FROM categories WHERE nom='Sport & Loisirs'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Bébés & Enfants
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Vêtements bébé',      (SELECT id FROM categories WHERE nom='Bébés & Enfants')),
  ('Jouets',              (SELECT id FROM categories WHERE nom='Bébés & Enfants')),
  ('Poussettes',          (SELECT id FROM categories WHERE nom='Bébés & Enfants')),
  ('Sièges auto',         (SELECT id FROM categories WHERE nom='Bébés & Enfants')),
  ('Alimentation bébé',   (SELECT id FROM categories WHERE nom='Bébés & Enfants')),
  ('Hygiène bébé',        (SELECT id FROM categories WHERE nom='Bébés & Enfants'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Automobile & Moto
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Pièces détachées',    (SELECT id FROM categories WHERE nom='Automobile & Moto')),
  ('Accessoires',         (SELECT id FROM categories WHERE nom='Automobile & Moto')),
  ('Pneus',               (SELECT id FROM categories WHERE nom='Automobile & Moto')),
  ('Huiles',              (SELECT id FROM categories WHERE nom='Automobile & Moto')),
  ('Produits d''entretien',(SELECT id FROM categories WHERE nom='Automobile & Moto')),
  ('GPS',                 (SELECT id FROM categories WHERE nom='Automobile & Moto')),
  ('Casques',             (SELECT id FROM categories WHERE nom='Automobile & Moto'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Livres & Médias
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Livres papier',       (SELECT id FROM categories WHERE nom='Livres & Médias')),
  ('eBooks',              (SELECT id FROM categories WHERE nom='Livres & Médias')),
  ('Magazines',           (SELECT id FROM categories WHERE nom='Livres & Médias')),
  ('Films',               (SELECT id FROM categories WHERE nom='Livres & Médias')),
  ('Musique',             (SELECT id FROM categories WHERE nom='Livres & Médias')),
  ('Jeux vidéo',          (SELECT id FROM categories WHERE nom='Livres & Médias')),
  ('Bandes dessinées',    (SELECT id FROM categories WHERE nom='Livres & Médias'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Animaux
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Nourriture',          (SELECT id FROM categories WHERE nom='Animaux')),
  ('Accessoires',         (SELECT id FROM categories WHERE nom='Animaux')),
  ('Jouets',              (SELECT id FROM categories WHERE nom='Animaux')),
  ('Hygiène',             (SELECT id FROM categories WHERE nom='Animaux')),
  ('Habitat',             (SELECT id FROM categories WHERE nom='Animaux')),
  ('Vétérinaire',         (SELECT id FROM categories WHERE nom='Animaux')),
  ('Produits naturels',   (SELECT id FROM categories WHERE nom='Animaux'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Bricolage & Matériaux
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Peinture',            (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Bois',                (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Électricité',         (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Plomberie',           (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Outils',              (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Sécurité',            (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Isolation',           (SELECT id FROM categories WHERE nom='Bricolage & Matériaux')),
  ('Quincaillerie',       (SELECT id FROM categories WHERE nom='Bricolage & Matériaux'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Services
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Livraison',           (SELECT id FROM categories WHERE nom='Services')),
  ('Réparation',          (SELECT id FROM categories WHERE nom='Services')),
  ('Formation',           (SELECT id FROM categories WHERE nom='Services')),
  ('Abonnement',          (SELECT id FROM categories WHERE nom='Services')),
  ('Billetterie',         (SELECT id FROM categories WHERE nom='Services')),
  ('Coaching',            (SELECT id FROM categories WHERE nom='Services')),
  ('Traduction',          (SELECT id FROM categories WHERE nom='Services'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Papeterie & Fournitures
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Stylos',              (SELECT id FROM categories WHERE nom='Papeterie & Fournitures')),
  ('Carnets',             (SELECT id FROM categories WHERE nom='Papeterie & Fournitures')),
  ('Imprimantes',         (SELECT id FROM categories WHERE nom='Papeterie & Fournitures')),
  ('Cartouches',          (SELECT id FROM categories WHERE nom='Papeterie & Fournitures')),
  ('Fournitures scolaires',(SELECT id FROM categories WHERE nom='Papeterie & Fournitures')),
  ('Classeurs',           (SELECT id FROM categories WHERE nom='Papeterie & Fournitures')),
  ('Accessoires de bureau',(SELECT id FROM categories WHERE nom='Papeterie & Fournitures'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Jeux & Jouets
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Jeux de société',     (SELECT id FROM categories WHERE nom='Jeux & Jouets')),
  ('Jeux éducatifs',      (SELECT id FROM categories WHERE nom='Jeux & Jouets')),
  ('Figurines',           (SELECT id FROM categories WHERE nom='Jeux & Jouets')),
  ('Puzzles',             (SELECT id FROM categories WHERE nom='Jeux & Jouets')),
  ('Jeux électroniques',  (SELECT id FROM categories WHERE nom='Jeux & Jouets')),
  ('Peluches',            (SELECT id FROM categories WHERE nom='Jeux & Jouets'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Art & Artisanat
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Peinture',            (SELECT id FROM categories WHERE nom='Art & Artisanat')),
  ('Dessin',              (SELECT id FROM categories WHERE nom='Art & Artisanat')),
  ('Sculpture',           (SELECT id FROM categories WHERE nom='Art & Artisanat')),
  ('Couture',             (SELECT id FROM categories WHERE nom='Art & Artisanat')),
  ('Matériaux créatifs',  (SELECT id FROM categories WHERE nom='Art & Artisanat')),
  ('DIY',                 (SELECT id FROM categories WHERE nom='Art & Artisanat'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Industrie & Pro
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Équipements industriels',(SELECT id FROM categories WHERE nom='Industrie & Pro')),
  ('Fournitures de bureau',(SELECT id FROM categories WHERE nom='Industrie & Pro')),
  ('Matériel de santé',    (SELECT id FROM categories WHERE nom='Industrie & Pro')),
  ('Outils professionnels',(SELECT id FROM categories WHERE nom='Industrie & Pro'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Voyage & Bagagerie
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Valises',             (SELECT id FROM categories WHERE nom='Voyage & Bagagerie')),
  ('Sacs à dos',          (SELECT id FROM categories WHERE nom='Voyage & Bagagerie')),
  ('Accessoires de voyage',(SELECT id FROM categories WHERE nom='Voyage & Bagagerie')),
  ('Adaptateurs',         (SELECT id FROM categories WHERE nom='Voyage & Bagagerie')),
  ('Étiquettes',          (SELECT id FROM categories WHERE nom='Voyage & Bagagerie')),
  ('Organisateurs',       (SELECT id FROM categories WHERE nom='Voyage & Bagagerie'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Énergie & Écologie
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Panneaux solaires',   (SELECT id FROM categories WHERE nom='Énergie & Écologie')),
  ('Batteries',           (SELECT id FROM categories WHERE nom='Énergie & Écologie')),
  ('Lampes LED',          (SELECT id FROM categories WHERE nom='Énergie & Écologie')),
  ('Composteurs',         (SELECT id FROM categories WHERE nom='Énergie & Écologie')),
  ('Produits recyclés',   (SELECT id FROM categories WHERE nom='Énergie & Écologie'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Culture & Religion
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Livres religieux',    (SELECT id FROM categories WHERE nom='Culture & Religion')),
  ('Objets de culte',     (SELECT id FROM categories WHERE nom='Culture & Religion')),
  ('Vêtements traditionnels',(SELECT id FROM categories WHERE nom='Culture & Religion')),
  ('Encens',              (SELECT id FROM categories WHERE nom='Culture & Religion')),
  ('Calendriers liturgiques',(SELECT id FROM categories WHERE nom='Culture & Religion'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Jeux d'argent & Loterie
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Billets de loterie',  (SELECT id FROM categories WHERE nom='Jeux d''argent & Loterie')),
  ('Cartes à gratter',    (SELECT id FROM categories WHERE nom='Jeux d''argent & Loterie')),
  ('Jetons',              (SELECT id FROM categories WHERE nom='Jeux d''argent & Loterie')),
  ('Accessoires de poker',(SELECT id FROM categories WHERE nom='Jeux d''argent & Loterie'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Télécommunications
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Cartes SIM',          (SELECT id FROM categories WHERE nom='Télécommunications')),
  ('Recharges',           (SELECT id FROM categories WHERE nom='Télécommunications')),
  ('Téléphones fixes',    (SELECT id FROM categories WHERE nom='Télécommunications')),
  ('Modems',              (SELECT id FROM categories WHERE nom='Télécommunications')),
  ('Routeurs',            (SELECT id FROM categories WHERE nom='Télécommunications'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Immobilier & Construction
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Matériaux',           (SELECT id FROM categories WHERE nom='Immobilier & Construction')),
  ('Plans',               (SELECT id FROM categories WHERE nom='Immobilier & Construction')),
  ('Outils',              (SELECT id FROM categories WHERE nom='Immobilier & Construction')),
  ('Services de construction',(SELECT id FROM categories WHERE nom='Immobilier & Construction')),
  ('Location d''équipement',(SELECT id	FROM categories WHERE nom='Immobilier & Construction'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

-- Éducation & Formation
INSERT INTO sous_categories (nom, categorie_id) VALUES
  ('Manuels',             (SELECT id FROM categories WHERE nom='Éducation & Formation')),
  ('Cours en ligne',      (SELECT id FROM categories WHERE nom='Éducation & Formation')),
  ('Matériel pédagogique',(SELECT id	FROM categories WHERE nom='Éducation & Formation')),
  ('Certifications',      (SELECT id FROM categories WHERE nom='Éducation & Formation')),
  ('Universités',         (SELECT id FROM categories WHERE nom='Éducation & Formation'))
ON CONFLICT (categorie_id, nom) DO NOTHING;

COMMIT;




