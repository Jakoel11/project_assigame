// middlewares/auth.js - Middleware d'authentification JWT

// middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: '⛔ Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: '⛔ Token invalide (format)' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: '⛔ Token invalide' });
  }
};
// Ce middleware vérifie la présence et la validité du token JWT dans les requêtes
// Il extrait les informations de l'utilisateur et les ajoute à la requête pour les routes protég