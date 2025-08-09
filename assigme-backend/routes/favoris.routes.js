// routes/favoris.routes.js
const express = require('express');
const router = express.Router();
const favorisController = require('../controllers/favoris.controller');
const auth = require('../middlewares/auth');

// Toutes les routes des favoris nécessitent une authentification
router.use(auth);

// Liste des favoris de l'utilisateur connecté
router.get('/', favorisController.listFavoris);

// Ajouter une annonce aux favoris
router.post('/:annonceId', favorisController.addFavori);

// Retirer une annonce des favoris
router.delete('/:annonceId', favorisController.removeFavori);

// Vérifier si une annonce est en favori
router.get('/:annonceId/check', favorisController.checkFavori);

module.exports = router;
