// index.js - Point d'entrée principal du serveur

const express   = require('express');
const cors      = require('cors');
const bodyParser= require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Also accept URL-encoded bodies (e.g., Postman x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion DB
const pool = require('./config/db');

// Import des routes
const authRoutes           = require('./routes/auth.routes');
const annoncesRoutes       = require('./routes/annonces.routes');
const categoriesRoutes     = require('./routes/categories.routes');
const favorisRoutes        = require('./routes/favoris.routes');
const conversationsRoutes  = require('./routes/conversations.routes');

// Montage des routes sous /api
app.use('/api/auth',          authRoutes);
app.use('/api/annonces',      annoncesRoutes);
app.use('/api/categories',    categoriesRoutes);
app.use('/api/favoris',       favorisRoutes);
app.use('/api/conversations', conversationsRoutes);

// Route racine pour test
app.get('/', (req, res) => {
  res.send('🎯 API Assigmé en ligne');
});

// Gestion d'erreurs globale (JSON invalide, etc.) - doit être après les routes
app.use((err, req, res, next) => {
  console.error('🔥 Erreur globale:', err);
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    return res.status(400).json({ message: 'JSON invalide ❌', details: err.message });
  }
  return res.status(500).json({ message: 'Erreur serveur ❌', details: err?.message || 'Unknown error' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

console.log('Tentative de démarrage du serveur sur le port:', PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Défini' : 'Non défini');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Défini' : 'Non défini');

if (require.main === module) {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Erreur de démarrage du serveur:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé par un autre processus!`);
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
  }
}

// Vérification DB au démarrage
pool.query('SELECT NOW()', (err, result) => {
  if (err) console.error('❌ Erreur DB :', err);
  else console.log('🟢 Connexion DB réussie à :', result.rows[0].now);
});
module.exports = app;