// routes/categories.routes.js
// ============================================================================
// Routes des catégories et sous-catégories
// ============================================================================

const express = require('express');
const router = express.Router();

// Contrôleur
const categoriesController = require('../controllers/categories.controller');

// ---------------------------------------------------------------------------
// GET /api/categories - Liste des catégories avec sous-catégories
// ---------------------------------------------------------------------------
router.get('/', categoriesController.listCategoriesWithSousCategories);

// ---------------------------------------------------------------------------
// GET /api/categories/simple - Liste simple des catégories
// ---------------------------------------------------------------------------
router.get('/simple', categoriesController.listCategories);

module.exports = router;
