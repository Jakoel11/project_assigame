const pool = require('../config/db');

// Initialiser un appel
const initiateCall = async (req, res) => {
    const { conversation_id, type } = req.body; // type: 'audio' ou 'video'
    const initiator_id = req.user.id;

    try {
        // Vérifier l'accès à la conversation
        const convCheck = await pool.query(
            `SELECT c.*, 
                CASE 
                    WHEN acheteur_id = $1 THEN vendeur_id 
                    ELSE acheteur_id 
                END as receiver_id 
            FROM conversations c 
            WHERE id = $1 AND (acheteur_id = $2 OR vendeur_id = $2)`,
            [conversation_id, initiator_id]
        );

        if (convCheck.rows.length === 0) {
            return res.status(403).json({ 
                message: "❌ Vous n'avez pas accès à cette conversation" 
            });
        }

        const receiver_id = convCheck.rows[0].receiver_id;
        const room_id = `call_${conversation_id}_${Date.now()}`;

        // Créer l'appel
        const result = await pool.query(
            `INSERT INTO calls 
            (conversation_id, initiator_id, receiver_id, type, room_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, room_id`,
            [conversation_id, initiator_id, receiver_id, type, room_id]
        );

        // Créer un message système pour l'appel
        await pool.query(
            `INSERT INTO messages 
            (conversation_id, sender_id, content, type, call_status) 
            VALUES ($1, $2, $3, $4, $5)`,
            [conversation_id, initiator_id, 
             `A initié un appel ${type}`, 
             `${type}_call`, 'initiated']
        );

        res.status(201).json({
            call_id: result.rows[0].id,
            room_id: result.rows[0].room_id,
            message: "✅ Appel initié avec succès"
        });

    } catch (error) {
        console.error('Erreur lors de l\'initiation de l\'appel:', error);
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
};

// Répondre à un appel
const handleCallResponse = async (req, res) => {
    const { call_id, action } = req.body; // action: 'accept' ou 'reject'
    const user_id = req.user.id;

    try {
        const call = await pool.query(
            'SELECT * FROM calls WHERE id = $1 AND receiver_id = $2',
            [call_id, user_id]
        );

        if (call.rows.length === 0) {
            return res.status(403).json({ 
                message: "❌ Appel non trouvé ou non autorisé" 
            });
        }

        const status = action === 'accept' ? 'accepted' : 'rejected';
        const answered_at = action === 'accept' ? 'CURRENT_TIMESTAMP' : null;

        // Mettre à jour le statut de l'appel
        await pool.query(
            'UPDATE calls SET status = $1, answered_at = $2 WHERE id = $3',
            [status, answered_at, call_id]
        );

        // Mettre à jour le message d'appel
        await pool.query(
            `UPDATE messages 
            SET call_status = $1 
            WHERE conversation_id = $2 
            AND type IN ('audio_call', 'video_call') 
            AND call_status = 'initiated'`,
            [status, call.rows[0].conversation_id]
        );

        res.json({ 
            message: `✅ Appel ${action === 'accept' ? 'accepté' : 'rejeté'} avec succès` 
        });

    } catch (error) {
        console.error('Erreur lors de la réponse à l\'appel:', error);
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
};

// Terminer un appel
const endCall = async (req, res) => {
    const { call_id } = req.params;
    const user_id = req.user.id;

    try {
        const call = await pool.query(
            'SELECT * FROM calls WHERE id = $1 AND (initiator_id = $2 OR receiver_id = $2)',
            [call_id, user_id]
        );

        if (call.rows.length === 0) {
            return res.status(403).json({ 
                message: "❌ Appel non trouvé ou non autorisé" 
            });
        }

        const now = new Date();
        const duration = call.rows[0].answered_at 
            ? Math.floor((now - new Date(call.rows[0].answered_at)) / 1000)
            : 0;

        // Mettre à jour l'appel
        await pool.query(
            'UPDATE calls SET status = $1, ended_at = CURRENT_TIMESTAMP, duration = $2 WHERE id = $3',
            ['ended', duration, call_id]
        );

        // Mettre à jour le message d'appel
        await pool.query(
            `UPDATE messages 
            SET call_status = 'ended', call_duration = $1 
            WHERE conversation_id = $2 
            AND type IN ('audio_call', 'video_call') 
            AND call_status IN ('initiated', 'accepted')`,
            [duration, call.rows[0].conversation_id]
        );

        res.json({ 
            message: "✅ Appel terminé avec succès",
            duration
        });

    } catch (error) {
        console.error('Erreur lors de la terminaison de l\'appel:', error);
        res.status(500).json({ message: "❌ Erreur serveur" });
    }
};

module.exports = {
    initiateCall,
    handleCallResponse,
    endCall
};
