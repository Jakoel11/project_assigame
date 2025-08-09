// diagServer.js - Diagnostic du serveur HTTP

const express = require('express');
const http = require('http');
const app = express();

// Middleware pour journaliser toutes les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Route de base
app.get('/', (req, res) => {
  console.log('Route racine appelée');
  res.send('Serveur de diagnostic fonctionne!');
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).send('Erreur serveur');
});

// Créer le serveur HTTP manuellement
const server = http.createServer(app);

// Ajouter des gestionnaires d'événements pour le serveur
server.on('listening', () => {
  console.log(`Serveur de diagnostic démarré sur http://localhost:5005`);
});

server.on('error', (error) => {
  console.error('Erreur du serveur:', error);
});

server.on('connection', (socket) => {
  console.log('Nouvelle connexion socket');
  
  socket.on('error', (error) => {
    console.error('Erreur socket:', error);
  });
  
  socket.on('close', (hadError) => {
    console.log('Socket fermé, hadError:', hadError);
  });
});

server.on('request', (req, res) => {
  console.log('Requête reçue:', req.method, req.url);
});

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('Signal SIGINT reçu. Fermeture du serveur...');
  server.close(() => {
    console.log('Serveur fermé');
    process.exit(0);
  });
});

// Démarrer le serveur
server.listen(5005, '0.0.0.0');
