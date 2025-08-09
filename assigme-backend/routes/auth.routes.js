// routes/auth.routes.js
// ============================================================================
// Routes d'authentification : inscription, connexion, profil protégé
// Dépendances : contrôleur d'auth, middlewares (rate-limit, validation, auth)
// ============================================================================

const express = require('express');
const router = express.Router();

// Contrôleur (logique métier)
const authController = require('../controllers/auth.controller');

// Middlewares
const validate = require('../middlewares/validate');          // → valide le body avec un schéma
const rateLimiter = require('../middlewares/rateLimiter');    // → limite les tentatives (ex: /login)
const auth = require('../middlewares/auth');                  // → vérifie le JWT (Authorization: Bearer <token>)

// Schémas de validation (Yup/Joi selon ton implémentation)
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// ---------------------------------------------------------------------------
// POST /api/auth/register
// Inscription d'un utilisateur
// - Valide le body (full_name, email, phone, password)
// - Délègue au contrôleur (hash, insert, gestion doublon)
// ---------------------------------------------------------------------------
router.post('/register', validate(registerSchema), authController.register);

// ---------------------------------------------------------------------------
// POST /api/auth/login
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
