// controllers/annonces.controller.js - Logique CRUD des annonces

const pool = require('../config/db');

exports.createAnnonce = async (req, res) => {
  const user_id = req.user.id;
  const {
    titre, description, prix, categorie_id,
    sous_categorie_id, ville, images, is_boosted
  } = req.body;

  if (!titre || !prix || !categorie_id || !ville) {
    return res.status(400).json({ message: '❌ Champs manquants' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO annonces 
        (user_id, titre, description, prix, categorie_id, sous_categorie_id, ville, images, is_boosted, date_creation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [
        user_id, titre, description||'', prix,
        categorie_id, sous_categorie_id||null,
        ville, images||'', is_boosted||false
      ]
    );
    res.status(201).json({ message: '✅ Annonce créée', annonce: result.rows[0] });
  } catch (err) {
    console.error('🔥 Erreur création annonce:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.listAnnonces = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.full_name, u.email,
             c.nom AS categorie, sc.nom AS sous_categorie
      FROM annonces a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN categories c ON a.categorie_id = c.id
      LEFT JOIN sous_categories sc ON a.sous_categorie_id = sc.id
      ORDER BY a.date_creation DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur récupération annonces:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.getAnnonce = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM annonces WHERE id = $1', [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur détail annonce:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.updateAnnonce = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const {
    titre, description, prix, categorie_id,
    sous_categorie_id, ville, images, is_boosted
  } = req.body;

  try {
    const old = await pool.query('SELECT * FROM annonces WHERE id = $1', [id]);
    const annonce = old.rows[0];
    if (!annonce) return res.status(404).json({ message: '❌ Introuvable' });
    if (annonce.user_id !== userId) return res.status(403).json({ message: '⛔ Non autorisé' });

    const updated = await pool.query(
      `UPDATE annonces SET
         titre=$1, description=$2, prix=$3,
         categorie_id=$4, sous_categorie_id=$5,
         ville=$6, images=$7, is_boosted=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [
        titre||annonce.titre,
        description||annonce.description,
        prix||annonce.prix,
        categorie_id||annonce.categorie_id,
        sous_categorie_id||annonce.sous_categorie_id,
        ville||annonce.ville,
        images||annonce.images,
        typeof is_boosted==='boolean'?is_boosted:annonce.is_boosted,
        id
      ]
    );
    return res.status(200).json({
      message: '✅ Mise à jour réussie',
      annonce: updated.rows[0]
    });
  } catch (err) {
    console.error('🔥 Erreur mise à jour annonce:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.deleteAnnonce = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const old = await pool.query('SELECT * FROM annonces WHERE id = $1', [id]);
    const annonce = old.rows[0];
    if (!annonce) return res.status(404).json({ message: '❌ Introuvable' });
    if (annonce.user_id !== userId) return res.status(403).json({ message: '⛔ Non autorisé' });

    await pool.query('DELETE FROM annonces WHERE id = $1', [id]);
    res.json({ message: '🗑️ Supprimé avec succès' });
  } catch (err) {
    console.error('🔥 Erreur suppression annonce:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.listUserAnnonces = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM annonces WHERE user_id = $1 ORDER BY date_creation DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur mes annonces:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.getAnnonces = async (req, res) => {
  try {
    // 1. Paramètres de pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    
    // Conversion en number pour PostgreSQL
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    // 2. Construction de la requête de base
    let query = `
      SELECT a.*, 
             u.full_name as vendeur,
             c.nom as categorie_nom
      FROM annonces a
      LEFT JOIN users u ON a.user_id = u.id 
      LEFT JOIN categories c ON a.categorie_id = c.id
      WHERE 1=1
    `;

    // 3. Paramètres pour les filtres
    const params = [];
    let paramCount = 0;

    // 4. Ajout des filtres
    if (req.query.categorie_id) {
      paramCount++;
      query += ` AND a.categorie_id = $${paramCount}`;
      params.push(Number(req.query.categorie_id));
    }

    if (req.query.q) {
      const searchTerm = `%${req.query.q}%`;
      paramCount++;
      const searchParam = `$${paramCount}`;
      query += ` AND (LOWER(a.titre) LIKE LOWER(${searchParam}) OR LOWER(a.description) LIKE LOWER(${searchParam}))`;
      params.push(searchTerm);
    }

    // 5. Tri
    const validSortFields = ['prix', 'date_creation'];
    const sort = validSortFields.includes(req.query.sort) ? req.query.sort : 'date_creation';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY a.${sort} ${order}`;

    // 6. Requête pour le total (avant d'ajouter la pagination)
    const countQuery = `
      SELECT COUNT(*) 
      FROM annonces a
      WHERE 1=1
      ${req.query.categorie_id ? ` AND a.categorie_id = $1` : ''}
      ${req.query.q ? ` AND (LOWER(a.titre) LIKE LOWER($${req.query.categorie_id ? 2 : 1}) OR LOWER(a.description) LIKE LOWER($${req.query.categorie_id ? 2 : 1}))` : ''}
    `;

    // 7. Pagination (ajoutée seulement à la requête principale)
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offsetNum);

    // 8. Exécution des requêtes
    // Préparer les paramètres pour la requête de comptage
    const countParams = [];
    if (req.query.categorie_id) countParams.push(Number(req.query.categorie_id));
    if (req.query.q) {
      const searchTerm = `%${req.query.q}%`;
      countParams.push(searchTerm);
    }

    const [results, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    // 9. Formatage réponse
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Formater la réponse
    return res.json({
      status: 'success',
      annonces: results.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (err) {
    console.error('❌ Erreur liste annonces:', err);
    return res.status(500).json({ 
      annonces: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      message: '❌ Erreur serveur'
    });
  }
};

// Gestion des images
exports.addImages = async (req, res) => {
  const annonceId = req.params.id;
  const userId = req.user.id;

  try {
    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const annonce = await pool.query('SELECT * FROM annonces WHERE id = $1', [annonceId]);
    if (!annonce.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }
    if (annonce.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé' });
    }

    if (!req.processedImages || !req.processedImages.length) {
      return res.status(400).json({ message: '❌ Aucune image fournie' });
    }

    // Sauvegarder les informations des images en base de données
    for (const images of req.processedImages) {
      await pool.query(`
        INSERT INTO images (annonce_id, thumbnail, medium, large, created_at)
        VALUES ($1, $2, $3, $4, NOW())`,
        [annonceId, images.thumbnail, images.medium, images.large]
      );
    }

    // Récupérer toutes les images de l'annonce
    const result = await pool.query('SELECT * FROM images WHERE annonce_id = $1 ORDER BY created_at DESC', [annonceId]);

    res.status(200).json({
      message: '✅ Images ajoutées avec succès',
      images: result.rows
    });

  } catch (error) {
    console.error('🔥 Erreur ajout images:', error);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.deleteImage = async (req, res) => {
  const { id: annonceId, imageId } = req.params;
  const userId = req.user.id;

  try {
    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const annonce = await pool.query('SELECT * FROM annonces WHERE id = $1', [annonceId]);
    if (!annonce.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }
    if (annonce.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé' });
    }

    // Récupérer l'image
    const image = await pool.query('SELECT * FROM images WHERE id = $1', [imageId]);
    if (!image.rows[0]) {
      return res.status(404).json({ message: '❌ Image introuvable' });
    }

    // Supprimer les fichiers
    const imageService = require('../services/image.service');
    await imageService.deleteImage(image.rows[0].thumbnail);
    await imageService.deleteImage(image.rows[0].medium);
    await imageService.deleteImage(image.rows[0].large);

    // Supprimer l'entrée en base de données
    await pool.query('DELETE FROM images WHERE id = $1', [imageId]);

    res.json({ message: '✅ Image supprimée avec succès' });

  } catch (error) {
    console.error('🔥 Erreur suppression image:', error);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.updateImagesOrder = async (req, res) => {
  const annonceId = req.params.id;
  const userId = req.user.id;
  const { imageIds } = req.body;

  if (!imageIds || !Array.isArray(imageIds)) {
    return res.status(400).json({ message: '❌ Liste d\'identifiants d\'images invalide' });
  }

  try {
    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const annonce = await pool.query('SELECT * FROM annonces WHERE id = $1', [annonceId]);
    if (!annonce.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }
    if (annonce.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé' });
    }

    // Mettre à jour l'ordre des images
    for (let i = 0; i < imageIds.length; i++) {
      await pool.query(
        'UPDATE images SET ordre = $1 WHERE id = $2 AND annonce_id = $3',
        [i, imageIds[i], annonceId]
      );
    }

    res.json({ message: '✅ Ordre des images mis à jour avec succès' });

  } catch (error) {
    console.error('🔥 Erreur mise à jour ordre images:', error);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};