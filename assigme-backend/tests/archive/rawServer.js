// rawServer.js - Serveur HTTP brut sans Express

const http = require('http');

// Créer un serveur HTTP simple
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Répondre avec un message simple
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Serveur HTTP brut fonctionne!');
});

// Démarrer le serveur
server.listen(5006, '0.0.0.0', () => {
  console.log('Serveur HTTP brut démarré sur http://localhost:5006');
});

// Gérer les erreurs
server.on('error', (error) => {
  console.error('Erreur du serveur:', error);
});

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu. Fermeture du serveur...');
  server.close(() => {
    console.log('Serveur fermé');
    process.exit(0);
  });
});
