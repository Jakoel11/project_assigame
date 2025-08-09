// stableServer.js - Serveur robuste qui ne se ferme pas avec les signaux

// Ignorer les signaux d'interruption
process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu, mais ignoré pour maintenir le serveur en vie');
  // Ne pas quitter le processus
});

process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu, mais ignoré pour maintenir le serveur en vie');
  // Ne pas quitter le processus
});

// Gestion des erreurs non attrapées
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON GÉRÉE:', error.message);
  console.error('Stack trace:', error.stack);
  // Ne pas quitter le processus
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ PROMESSE REJETÉE NON GÉRÉE:', reason);
  // Ne pas quitter le processus
});

// Modules nécessaires
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Création de l'application Express
const app = express();

// Configuration de base
app.use(cors());

// Middleware JSON avec gestion d'erreur spécifique
app.use((req, res, next) => {
  bodyParser.json({
    limit: '10mb' // Augmenter la limite pour les fichiers plus grands
  })(req, res, (err) => {
    if (err) {
      console.error('❌ Erreur de parsing JSON:', err.message);
      return res.status(400).json({ 
        message: 'Format JSON invalide', 
        details: err.message 
      });
    }
    next();
  });
});

// Middleware pour les formulaires
app.use(bodyParser.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Middleware de logging détaillé
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️ [${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Intercepter la fin de la réponse pour logger le temps et le statut
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`⬅️ [${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
    originalEnd.apply(res, args);
  };
  
  next();
});

// Route de base pour tester
app.get('/', (req, res) => {
  console.log('Route racine appelée');
  res.send('🎯 API Assigmé en ligne - Serveur stable');
});

// Connexion à la base de données avec des options robustes
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,  // 30 secondes timeout
  max: 20,                         // max 20 clients
  idleTimeoutMillis: 30000,        // 30 secondes d'inactivité avant de fermer
  allowExitOnIdle: false
});

// Tester la connexion à la DB avant de configurer les routes
pool.query('SELECT NOW()')
  .then(result => {
    console.log('🟢 Connexion DB réussie à :', result.rows[0].now);
    
    try {
      // Import des routes
      const authRoutes = require('./routes/auth.routes');
      const annoncesRoutes = require('./routes/annonces.routes');
      const categoriesRoutes = require('./routes/categories.routes');
      const favorisRoutes = require('./routes/favoris.routes');
      const conversationsRoutes = require('./routes/conversations.routes');

      // Montage des routes sous /api
      app.use('/api/auth', authRoutes);
      app.use('/api/annonces', annoncesRoutes);
      app.use('/api/categories', categoriesRoutes);
      app.use('/api/favoris', favorisRoutes);
      app.use('/api/conversations', conversationsRoutes);
      
      console.log('✅ Routes chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des routes:', error);
    }

    // Middleware de gestion d'erreurs - après les routes
    app.use((err, req, res, next) => {
      console.error('🔥 Erreur globale:', err);
      
      if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
        return res.status(400).json({ 
          message: 'Requête malformée', 
          details: err.message 
        });
      }
      
      return res.status(500).json({ 
        message: 'Erreur serveur', 
        details: err?.message || 'Erreur inconnue' 
      });
    });

    // Route 404 pour les routes non trouvées
    app.use((req, res) => {
      res.status(404).json({ message: 'Route non trouvée' });
    });

    // Démarrer le serveur
    const PORT = process.env.PORT || 5001;
    
    console.log('Tentative de démarrage du serveur sur le port:', PORT);
    
    // Démarrer le serveur sur 127.0.0.1 (localhost uniquement)
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
      console.log('Le serveur ignorera les signaux SIGINT/SIGTERM pour rester stable');
    }).on('error', (error) => {
      console.error('❌ Erreur de démarrage du serveur:', error);
      
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé par un autre processus!`);
      }
    });
  })
  .catch(err => {
    console.error('❌ Erreur DB :', err);
  });

// Maintenir le processus Node.js en vie
setInterval(() => {
  console.log('Serveur toujours en vie -', new Date().toISOString());
}, 60000); // Log toutes les minutes pour montrer que le serveur est actif
