// serverTest.js - Test de serveur minimal pour isoler le problème

const express = require('express');
const app = express();
const PORT = 5003;

// Middleware simple pour tester
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Route de base
app.get('/', (req, res) => {
  res.send('Serveur de test fonctionne!');
});

// Route d'inscription simulée
app.post('/register', express.json(), (req, res) => {
  console.log('Données reçues:', req.body);
  res.json({ success: true, message: 'Inscription simulée réussie' });
});

// Démarrer le serveur
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur de test démarré sur http://localhost:${PORT}`);
  });

  // Gestion des signaux
  process.on('SIGINT', () => {
    console.log('Signal SIGINT reçu. Fermeture du serveur...');
    server.close(() => {
      console.log('Serveur fermé');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('Erreur lors du démarrage du serveur:', error);
}
