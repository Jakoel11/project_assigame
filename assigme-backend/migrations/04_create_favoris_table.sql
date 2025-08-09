-- migrations/04_create_favoris_table.sql
CREATE TABLE IF NOT EXISTS favoris (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    annonce_id INTEGER NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, annonce_id)  -- Empêche les doublons de favoris
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_favoris_user ON favoris(user_id);
CREATE INDEX IF NOT EXISTS idx_favoris_annonce ON favoris(annonce_id);
