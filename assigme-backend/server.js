// server.js - Point d'entrée principal du serveur ASSIGMÉ
// ============================================================================
// Configuration Express complète avec tous les middlewares et routes
// ============================================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Créer l'application Express
const app = express();

// ============================================================================
// MIDDLEWARES GLOBAUX
// ============================================================================

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parser JSON et URL-encoded
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting global (moins restrictif que pour l'auth)
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requêtes par fenêtre
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use(globalRateLimit);

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// CONNEXION BASE DE DONNÉES
// ============================================================================
const pool = require('./config/db');

// Test de connexion au démarrage
pool.query('SELECT NOW() AS now', (err, result) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
  } else {
    console.log('🟢 Connexion DB réussie à:', result.rows[0].now);
  }
});

// ============================================================================
// ROUTES
// ============================================================================

// Route de santé/health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'assigme-backend',
    version: '1.0.0'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: '🎯 API Assigmé en ligne',
    endpoints: {
      auth: '/api/auth',
      annonces: '/api/annonces',
      categories: '/api/categories',
      conversations: '/api/conversations',
      favoris: '/api/favoris',
      images: '/api/images',
      calls: '/api/calls'
    }
  });
});

// Import et utilisation des routes
const authRoutes = require('./routes/auth.routes');
const annoncesRoutes = require('./routes/annonces.routes');
const categoriesRoutes = require('./routes/categories.routes');
const conversationsRoutes = require('./routes/conversations.routes');
const favorisRoutes = require('./routes/favoris.routes');
const imagesRoutes = require('./routes/images.routes');
const callsRoutes = require('./routes/calls.routes');

app.use('/api/auth', authRoutes);
app.use('/api/annonces', annoncesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/calls', callsRoutes);

// ============================================================================
// GESTION D'ERREURS GLOBALE
// ============================================================================

// Route 404 pour les endpoints non trouvés
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Endpoint non trouvé',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion d'erreurs
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  
  // Erreur de validation
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON malformé' });
  }
  
  // Erreur de base de données
  if (error.code && error.code.startsWith('22')) {
    return res.status(400).json({ message: 'Données invalides' });
  }
  
  // Erreur générique
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============================================================================
// DÉMARRAGE DU SERVEUR
// ============================================================================

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Serveur ASSIGMÉ démarré sur le port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 API Base URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;