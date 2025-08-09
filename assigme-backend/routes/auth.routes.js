// routes/auth.routes.js
// ============================================================================
// Routes d'authentification : inscription, connexion, profil protégé
// ============================================================================

const express = require('express');
const router = express.Router();

// Contrôleur (logique métier)
const authController = require('../controllers/auth.controller');

// Middlewares
const validate = require('../middlewares/validate');          
const rateLimiter = require('../middlewares/rateLimiter');   
const auth = require('../middlewares/auth');                  

// Schémas de validation
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// ---------------------------------------------------------------------------
// POST /api/auth/register - Inscription d'un utilisateur
// ---------------------------------------------------------------------------
router.post('/register', validate(registerSchema), authController.register);

// ---------------------------------------------------------------------------
// POST /api/auth/login - Connexion d'un utilisateur
// ---------------------------------------------------------------------------
router.post('/login', rateLimiter, validate(loginSchema), authController.login);

// ---------------------------------------------------------------------------
// GET /api/auth/profile - Récupération du profil utilisateur (protégé)
// ---------------------------------------------------------------------------
router.get('/profile', auth, authController.profile);

module.exports = router;
// Connexion d'un utilisateur
// - Rate limiter (ex: 5 essais / 15 min)
// - Valide le body (email, password)
// - Délègue au contrôleur (vérif mdp, génération JWT)
// ---------------------------------------------------------------------------
router.post('/login', rateLimiter, validate(loginSchema), authController.login);

// ---------------------------------------------------------------------------
// GET /api/auth/profile
// Route protégée : renvoie les infos basées sur le token (req.user)
// - Exige un header Authorization: Bearer <token>
// ---------------------------------------------------------------------------
router.get('/profile', auth, authController.profile);

module.exports = router;
