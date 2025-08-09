// controllers/images.controller.js
const pool = require('../config/db');
const imageService = require('../services/image.service');

exports.uploadImages = async (req, res) => {
  const annonceId = req.params.id;
  const userId = req.user.id;

  try {
    // Vérifier propriétaire de l'annonce
    const annonce = await pool.query(
      'SELECT user_id FROM annonces WHERE id = $1',
      [annonceId]
    );

    if (!annonce.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }

    if (annonce.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé' });
    }

    // Vérifier nombre d'images existantes
    const existingImages = await pool.query(
      'SELECT COUNT(*) FROM images WHERE annonce_id = $1',
      [annonceId]
    );

    const currentCount = parseInt(existingImages.rows[0].count);
    if (currentCount + req.processedImages.length > 5) {
      return res.status(400).json({ 
        message: '❌ Maximum 5 images par annonce' 
      });
    }

    // Insérer les images en DB
    const images = [];
    for (const [index, variants] of req.processedImages.entries()) {
      const result = await pool.query(
        `INSERT INTO images 
          (annonce_id, url, ordre, is_principal, thumbnail_url, medium_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          annonceId,
          variants.large,
          currentCount + index + 1,
          currentCount === 0 && index === 0, // Première image = principale
          variants.thumbnail,
          variants.medium
        ]
      );
      images.push(result.rows[0]);
    }

    res.json({
      message: '✅ Images uploadées avec succès',
      images
    });
  } catch (err) {
    console.error('❌ Erreur upload images:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.deleteImage = async (req, res) => {
  const { id: annonceId, imageId } = req.params;
  const userId = req.user.id;

  try {
    // Vérifier propriétaire
    const annonce = await pool.query(
      'SELECT user_id FROM annonces WHERE id = $1',
      [annonceId]
    );

    if (!annonce.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }

    if (annonce.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé' });
    }

    // Récupérer l'image
    const image = await pool.query(
      'SELECT * FROM images WHERE id = $1 AND annonce_id = $2',
      [imageId, annonceId]
    );

    if (!image.rows[0]) {
      return res.status(404).json({ message: '❌ Image introuvable' });
    }

    // Supprimer l'image du stockage
    await imageService.deleteImage(image.rows[0].url);
    if (image.rows[0].thumbnail_url) {
      await imageService.deleteImage(image.rows[0].thumbnail_url);
    }
    if (image.rows[0].medium_url) {
      await imageService.deleteImage(image.rows[0].medium_url);
    }

    // Supprimer de la DB
    await pool.query(
      'DELETE FROM images WHERE id = $1',
      [imageId]
    );

    // Réordonner les images restantes
    await pool.query(
      `UPDATE images 
       SET ordre = ordre - 1
       WHERE annonce_id = $1 AND ordre > $2`,
      [annonceId, image.rows[0].ordre]
    );

    res.json({ message: '✅ Image supprimée avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression image:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.updateOrder = async (req, res) => {
  const annonceId = req.params.id;
  const userId = req.user.id;
  const { imageIds } = req.body;

  if (!Array.isArray(imageIds)) {
    return res.status(400).json({ 
      message: '❌ Format invalide' 
    });
  }

  try {
    // Vérifier propriétaire
    const annonce = await pool.query(
      'SELECT user_id FROM annonces WHERE id = $1',
      [annonceId]
    );

    if (!annonce.rows[0]) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }

    if (annonce.rows[0].user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé' });
    }

    // Vérifier que toutes les images appartiennent à l'annonce
    const images = await pool.query(
      'SELECT id FROM images WHERE annonce_id = $1',
      [annonceId]
    );

    const existingIds = images.rows.map(img => img.id);
    const validIds = imageIds.every(id => existingIds.includes(id));

    if (!validIds) {
      return res.status(400).json({ 
        message: '❌ Images invalides' 
      });
    }

    // Mettre à jour l'ordre
    for (const [index, id] of imageIds.entries()) {
      await pool.query(
        'UPDATE images SET ordre = $1 WHERE id = $2',
        [index + 1, id]
      );
    }

    res.json({ message: '✅ Ordre mis à jour avec succès' });
  } catch (err) {
    console.error('❌ Erreur mise à jour ordre:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};
