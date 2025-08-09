const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: '⛔ Token manquant' });
  }

  const token = authHeader.split(' ')[1]; // Format : "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: '⛔ Token invalide (format)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Passe à la prochaine fonction (ex: création annonce)
  } catch (err) {
    return res.status(401).json({ message: '⛔ Token invalide' });
  }
}

module.exports = authMiddleware;

