// simple-server.js
// Un serveur Express très simple pour tester

const express = require('express');
const app = express();
const port = 5002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route racine
app.get('/', (req, res) => {
  res.send('Serveur de test fonctionne!');
});

// Route de test pour l'inscription
app.post('/api/register', (req, res) => {
  console.log('Requête reçue sur /api/register');
  console.log('Corps de la requête:', req.body);
  res.status(201).json({ message: 'Inscription simulée réussie' });
});

// Démarrer le serveur
app.listen(port, 'localhost', () => {
  console.log(`Serveur de test démarré sur http://localhost:${port}`);
});
