// registerTest.js - Test d'inscription avec un client HTTP natif

const http = require('http');

console.log('🧪 Test d\'inscription avec HTTP natif...');

// Données de l'utilisateur
const userData = {
  full_name: 'Test User',
  email: `test${Date.now()}@test.com`,
  phone: '90909090',
  password: 'password123'
};

console.log('Données utilisateur:', userData);

// Convertir les données en JSON
const postData = JSON.stringify(userData);

// Options de la requête
const options = {
  hostname: '127.0.0.1',
  port: 5001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Envoi de la requête à http://localhost:5001/api/auth/register');

// Créer la requête
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  // Événement pour chaque morceau de données reçu
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Événement quand la réponse est complète
  res.on('end', () => {
    console.log('Réponse complète:');
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('Réponse non-JSON:', data);
    }
    console.log('Test terminé!');
    process.exit(0); // Quitter proprement
  });
});

// Gérer les erreurs de requête
req.on('error', (e) => {
  console.error(`❌ Erreur de requête: ${e.message}`);
  process.exit(1);
});

// Envoyer les données
req.write(postData);

// Terminer la requête
req.end();

// Définir un timeout pour terminer le script si aucune réponse n'est reçue
setTimeout(() => {
  console.error('❌ Timeout - Aucune réponse reçue après 10 secondes');
  process.exit(1);
}, 10000);
