// controllers/conversations.controller.js
const pool = require('../config/db');

/**
 * Démarrer une nouvelle conversation
 */
exports.startConversation = async (req, res) => {
    const acheteurId = req.user.id;
    const { annonceId } = req.params;
    
    try {
        // 1. Vérifier que l'annonce existe
        const annonceResult = await pool.query(
            'SELECT user_id FROM annonces WHERE id = $1',
            [annonceId]
        );

        if (annonceResult.rows.length === 0) {
            return res.status(404).json({ message: '❌ Annonce introuvable' });
        }

        const vendeurId = annonceResult.rows[0].user_id;

        // Ne pas permettre une conversation avec soi-même
        if (vendeurId === acheteurId) {
            return res.status(400).json({ message: '❌ Vous ne pouvez pas démarrer une conversation avec vous-même' });
        }

        // 2. Vérifier si une conversation existe déjà
        const existingConv = await pool.query(
            'SELECT id FROM conversations WHERE annonce_id = $1 AND acheteur_id = $2 AND vendeur_id = $3',
            [annonceId, acheteurId, vendeurId]
        );

        if (existingConv.rows.length > 0) {
            return res.status(409).json({ 
                message: '⚠️ Une conversation existe déjà',
                conversationId: existingConv.rows[0].id
            });
        }

        // 3. Créer la conversation
        const result = await pool.query(
            `INSERT INTO conversations 
            (annonce_id, acheteur_id, vendeur_id) 
            VALUES ($1, $2, $3) 
            RETURNING id`,
            [annonceId, acheteurId, vendeurId]
        );

        // 4. Ajouter le premier message s'il existe
        if (req.body.message) {
            await pool.query(
                `INSERT INTO messages 
                (conversation_id, sender_id, content) 
                VALUES ($1, $2, $3)`,
                [result.rows[0].id, acheteurId, req.body.message]
            );
        }

        res.status(201).json({
            message: '✅ Conversation créée',
            conversationId: result.rows[0].id
        });

    } catch (error) {
        console.error('🔥 Erreur création conversation:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Liste des conversations d'un utilisateur
 */
exports.listConversations = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const result = await pool.query(`
            SELECT 
                c.*,
                a.titre as annonce_titre,
                a.prix as annonce_prix,
                a.images as annonce_image,
                u1.full_name as acheteur_nom,
                u2.full_name as vendeur_nom,
                (SELECT content 
                 FROM messages 
                 WHERE conversation_id = c.id 
                 ORDER BY created_at DESC 
                 LIMIT 1) as dernier_message,
                (SELECT COUNT(*) 
                 FROM messages 
                 WHERE conversation_id = c.id 
                 AND sender_id != $1 
                 AND read_at IS NULL) as messages_non_lus
            FROM conversations c
            JOIN annonces a ON c.annonce_id = a.id
            JOIN users u1 ON c.acheteur_id = u1.id
            JOIN users u2 ON c.vendeur_id = u2.id
            WHERE c.acheteur_id = $1 OR c.vendeur_id = $1
            ORDER BY c.last_message_at DESC`,
            [userId]
        );

        res.json({
            message: '✅ Liste des conversations récupérée',
            conversations: result.rows
        });

    } catch (error) {
        console.error('🔥 Erreur liste conversations:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Messages d'une conversation
 */
exports.getMessages = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;
    
    try {
        // 1. Vérifier l'accès à la conversation
        const convResult = await pool.query(
            'SELECT * FROM conversations WHERE id = $1 AND (acheteur_id = $2 OR vendeur_id = $2)',
            [conversationId, userId]
        );

        if (convResult.rows.length === 0) {
            return res.status(403).json({ message: '⛔ Accès non autorisé à cette conversation' });
        }

        // 2. Récupérer les messages
        const messages = await pool.query(`
            SELECT 
                m.*,
                u.full_name as sender_name,
                u.email as sender_email
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC`,
            [conversationId]
        );

        // 3. Marquer les messages comme lus
        await pool.query(`
            UPDATE messages 
            SET read_at = NOW() 
            WHERE conversation_id = $1 
            AND sender_id != $2 
            AND read_at IS NULL`,
            [conversationId, userId]
        );

        res.json({
            conversation: convResult.rows[0],
            messages: messages.rows
        });

    } catch (error) {
        console.error('🔥 Erreur récupération messages:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Envoi d'un nouveau message
 */
exports.sendMessage = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content) {
        return res.status(400).json({ message: '❌ Le message ne peut pas être vide' });
    }

    try {
        // 1. Vérifier l'accès à la conversation
        const convResult = await pool.query(
            'SELECT * FROM conversations WHERE id = $1 AND (acheteur_id = $2 OR vendeur_id = $2)',
            [conversationId, userId]
        );

        if (convResult.rows.length === 0) {
            return res.status(403).json({ message: '⛔ Accès non autorisé à cette conversation' });
        }

        // 2. Enregistrer le message
        const result = await pool.query(`
            WITH new_message AS (
                INSERT INTO messages (conversation_id, sender_id, content, type)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            )
            UPDATE conversations 
            SET last_message_at = NOW()
            WHERE id = $1
            RETURNING (SELECT * FROM new_message)`,
            [conversationId, userId, content, type]
        );

        res.status(201).json({
            message: '✅ Message envoyé',
            newMessage: result.rows[0]
        });

    } catch (error) {
        console.error('🔥 Erreur envoi message:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Archiver/Désarchiver une conversation
 */
exports.updateConversationStatus = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { status } = req.body;

    if (!['active', 'archived', 'blocked'].includes(status)) {
        return res.status(400).json({ message: '❌ Statut invalide' });
    }

    try {
        const result = await pool.query(`
            UPDATE conversations 
            SET status = $1
            WHERE id = $2 AND (acheteur_id = $3 OR vendeur_id = $3)
            RETURNING *`,
            [status, conversationId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: '⛔ Accès non autorisé à cette conversation' });
        }

        res.json({
            message: '✅ Statut de la conversation mis à jour',
            conversation: result.rows[0]
        });

    } catch (error) {
        console.error('🔥 Erreur mise à jour statut:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};
