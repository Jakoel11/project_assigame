-- migrations/03_create_images_table.sql
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    annonce_id INTEGER REFERENCES annonces(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    medium_url VARCHAR(255),
    ordre INTEGER NOT NULL,
    is_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_images_annonce ON images(annonce_id);
CREATE INDEX idx_images_ordre ON images(ordre);
