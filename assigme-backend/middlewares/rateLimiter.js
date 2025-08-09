// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,              // 15 minutes
  limit: 5,                              // 5 tentatives échouées
  skipSuccessfulRequests: true,          // ✅ ne compte pas les logins réussis
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    });
  },
});
// middlewares/rateLimiter.js - Middleware de limitation de taux

// Ce middleware limite le nombre de requêtes pour éviter les abus
// Il est utilisé pour protéger les routes sensibles comme l'authentification