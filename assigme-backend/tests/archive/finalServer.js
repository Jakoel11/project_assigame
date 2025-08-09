// finalServer.js - Version finale du serveur pour résoudre les problèmes

// Gestion des erreurs non attrapées - doit être en premier
process.on('uncaughtException', (error) => {
  console.error('❌ ERREUR NON GÉRÉE:', error.message);
  console.error('Stack trace:', error.stack);
  // Ne pas quitter le processus pour permettre au serveur de continuer
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ PROMESSE REJETÉE NON GÉRÉE:', reason);
  // Ne pas quitter le processus pour permettre au serveur de continuer
});

// Modules nécessaires
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Création de l'application Express
const app = express();

// Configuration de base
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route de base pour tester
app.get('/', (req, res) => {
  res.send('🎯 API Assigmé en ligne');
});

// Connexion à la base de données avec des options robustes
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: 20,
  idleTimeoutMillis: 30000,
  allowExitOnIdle: false
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Création du serveur HTTP manuellement pour plus de contrôle
const server = http.createServer(app);

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
          message: 'Requête malformée ❌', 
          details: err.message 
        });
      }
      
      return res.status(500).json({ 
        message: 'Erreur serveur ❌', 
        details: err?.message || 'Erreur inconnue' 
      });
    });

    // Route 404 pour les routes non trouvées
    app.use((req, res) => {
      res.status(404).json({ message: 'Route non trouvée ❌' });
    });

    // Démarrer le serveur
    const PORT = process.env.PORT || 5001;
    
    console.log('Tentative de démarrage du serveur sur le port:', PORT);
    
    // Configurer les gestionnaires d'événements du serveur
    server.on('error', (error) => {
      console.error('❌ Erreur de démarrage du serveur:', error);
      
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé par un autre processus!`);
      }
    });
    
    // Écouter sur 127.0.0.1 au lieu de 0.0.0.0 pour éviter les problèmes de réseau
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
    });
    
    // Gérer les signaux de fermeture propre
    process.on('SIGINT', () => {
      console.log('Signal SIGINT reçu. Fermeture du serveur...');
      server.close(() => {
        console.log('Serveur fermé');
        pool.end(() => {
          console.log('Connexion DB fermée');
          process.exit(0);
        });
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('Signal SIGTERM reçu. Fermeture du serveur...');
      server.close(() => {
        console.log('Serveur fermé');
        pool.end(() => {
          console.log('Connexion DB fermée');
          process.exit(0);
        });
      });
    });
  })
  .catch(err => {
    console.error('❌ Erreur DB :', err);
    process.exit(1);
  });

module.exports = app;
