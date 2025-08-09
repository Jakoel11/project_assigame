// routes/annonces.routes.js
// ============================================================================
// Routes des annonces (petites annonces)
// ============================================================================

const express = require('express');
const router = express.Router();

// Contrôleur
const annoncesController = require('../controllers/annonces.controller');

// Middlewares
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createAnnonceSchema } = require('../validators/annonce.validator');

// ---------------------------------------------------------------------------
// GET /api/annonces - Liste des annonces
// ---------------------------------------------------------------------------
router.get('/', annoncesController.listAnnonces);

// ---------------------------------------------------------------------------
// GET /api/annonces/:id - Détail d'une annonce
// ---------------------------------------------------------------------------
router.get('/:id', annoncesController.getAnnonce);

// ---------------------------------------------------------------------------
// POST /api/annonces - Créer une annonce (protégé)
// ---------------------------------------------------------------------------
router.post('/', auth, validate(createAnnonceSchema), annoncesController.createAnnonce);

// ---------------------------------------------------------------------------
// PUT /api/annonces/:id - Modifier une annonce (protégé)
// ---------------------------------------------------------------------------
router.put('/:id', auth, validate(createAnnonceSchema), annoncesController.updateAnnonce);

// ---------------------------------------------------------------------------
// DELETE /api/annonces/:id - Supprimer une annonce (protégé)
// ---------------------------------------------------------------------------
router.delete('/:id', auth, annoncesController.deleteAnnonce);

module.exports = router;
