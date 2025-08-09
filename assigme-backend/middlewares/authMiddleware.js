const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ message: '⛔ Token manquant' });

  // Format attendu : "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: '⛔ Token invalide (format)' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // injection des infos utilisateur décodées dans req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: '⛔ Token invalide' });
  }
}

module.exports = authMiddleware;
