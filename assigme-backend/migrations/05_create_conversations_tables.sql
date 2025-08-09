-- migrations/05_create_conversations_tables.sql

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    annonce_id INTEGER NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
    acheteur_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendeur_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(annonce_id, acheteur_id, vendeur_id)  -- Une seule conversation par trio
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'audio_call', 'video_call', 'offer', 'system')),
    media_url TEXT,
    media_type VARCHAR(50),
    call_status VARCHAR(50) CHECK (call_status IN ('initiated', 'accepted', 'rejected', 'ended', NULL)),
    call_duration INTEGER
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_conversations_users 
    ON conversations(acheteur_id, vendeur_id);
CREATE INDEX IF NOT EXISTS idx_conversations_annonce 
    ON conversations(annonce_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated 
    ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
    ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender 
    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created 
    ON messages(created_at DESC);

-- Table des appels
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    initiator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'video')),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'accepted', 'rejected', 'ended', 'missed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    room_id VARCHAR(255)
);

-- Index pour les appels
CREATE INDEX IF NOT EXISTS idx_calls_conversation 
    ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_users 
    ON calls(initiator_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status 
    ON calls(status);
