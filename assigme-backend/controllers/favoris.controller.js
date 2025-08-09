// controllers/favoris.controller.js
const pool = require('../config/db');

/**
 * Ajouter une annonce aux favoris
 */
exports.addFavori = async (req, res) => {
    const userId = req.user.id;
    const annonceId = req.params.annonceId;

    try {
        // Vérifier si l'annonce existe
        const annonceCheck = await pool.query(
            'SELECT id FROM annonces WHERE id = $1',
            [annonceId]
        );

        if (annonceCheck.rows.length === 0) {
            return res.status(404).json({ message: '❌ Annonce introuvable' });
        }

        // Vérifier si le favori existe déjà
        const existingFavori = await pool.query(
            'SELECT id FROM favoris WHERE user_id = $1 AND annonce_id = $2',
            [userId, annonceId]
        );

        if (existingFavori.rows.length > 0) {
            return res.status(409).json({ message: '⚠️ Cette annonce est déjà dans vos favoris' });
        }

        // Ajouter aux favoris
        await pool.query(
            'INSERT INTO favoris (user_id, annonce_id) VALUES ($1, $2)',
            [userId, annonceId]
        );

        res.status(201).json({ message: '✅ Ajouté aux favoris' });

    } catch (error) {
        console.error('🔥 Erreur ajout favori:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Supprimer une annonce des favoris
 */
exports.removeFavori = async (req, res) => {
    const userId = req.user.id;
    const annonceId = req.params.annonceId;

    try {
        const result = await pool.query(
            'DELETE FROM favoris WHERE user_id = $1 AND annonce_id = $2 RETURNING id',
            [userId, annonceId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Favori introuvable' });
        }

        res.json({ message: '✅ Retiré des favoris' });

    } catch (error) {
        console.error('🔥 Erreur suppression favori:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Liste des annonces favorites d'un utilisateur
 */
exports.listFavoris = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT a.*, 
                   u.full_name as vendeur,
                   c.nom as categorie,
                   f.created_at as date_ajout_favori
            FROM favoris f
            JOIN annonces a ON f.annonce_id = a.id
            JOIN users u ON a.user_id = u.id
            LEFT JOIN categories c ON a.categorie_id = c.id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            message: '✅ Liste des favoris récupérée',
            favoris: result.rows
        });

    } catch (error) {
        console.error('🔥 Erreur liste favoris:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};

/**
 * Vérifie si une annonce est en favori
 */
exports.checkFavori = async (req, res) => {
    const userId = req.user.id;
    const annonceId = req.params.annonceId;

    try {
        const result = await pool.query(
            'SELECT id FROM favoris WHERE user_id = $1 AND annonce_id = $2',
            [userId, annonceId]
        );

        res.json({
            isFavorite: result.rows.length > 0
        });

    } catch (error) {
        console.error('🔥 Erreur vérification favori:', error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
};
