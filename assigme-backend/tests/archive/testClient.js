// testClient.js - Client Node.js pour tester le serveur

const http = require('http');

// Options de la requête
const options = {
  hostname: 'localhost',
  port: 5005,
  path: '/',
  method: 'GET'
};

console.log('Envoi d\'une requête à', `http://${options.hostname}:${options.port}${options.path}`);

// Créer la requête
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Réponse complète:');
    console.log(data);
    console.log('Test réussi!');
  });
});

// Gérer les erreurs
req.on('error', (e) => {
  console.error(`Erreur de requête: ${e.message}`);
});

// Terminer la requête
req.end();
