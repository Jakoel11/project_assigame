-- Ajout des colonnes pour les médias et les appels dans la table messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS call_status VARCHAR(50) CHECK (call_status IN ('initiated', 'accepted', 'rejected', 'ended', NULL)),
ADD COLUMN IF NOT EXISTS call_duration INTEGER;

-- Modification du type CHECK pour inclure les nouveaux types de messages
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_type_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_type_check 
CHECK (type IN ('text', 'image', 'file', 'audio_call', 'video_call', 'offer', 'system'));

-- Création de la table des appels
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    initiator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'video')),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated' 
        CHECK (status IN ('initiated', 'ringing', 'accepted', 'rejected', 'ended', 'missed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    room_id VARCHAR(255)
);

-- Index pour optimiser les recherches d'appels
CREATE INDEX IF NOT EXISTS idx_calls_conversation 
    ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_users 
    ON calls(initiator_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status 
    ON calls(status);


ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_type_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_type_check 
CHECK (type IN ('text', 'image', 'file', 'audio_call', 'video_call', 'voice', 'offer', 'system'));