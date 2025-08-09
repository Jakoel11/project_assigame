// simpleRegisterTest.js - Test simple d'inscription

const request = require('request');

// Configuration
const REGISTER_URL = 'http://localhost:5001/api/auth/register';

// Données de test avec un email unique
const testUser = {
  full_name: 'User Test',
  email: `test${Date.now()}@example.com`,
  phone: '0123456789',
  password: 'Password123!'
};

console.log('🔍 Test d\'inscription - Données:', testUser);

// Envoi de la requête d'inscription
request.post({
  url: REGISTER_URL,
  json: testUser,
  headers: {
    'Content-Type': 'application/json'
  }
}, (error, response, body) => {
  if (error) {
    console.error('❌ Erreur de requête:', error.message);
    return;
  }
  
  console.log('🔹 Status:', response.statusCode);
  console.log('🔹 Headers:', JSON.stringify(response.headers));
  
  if (body) {
    console.log('🔹 Body:', JSON.stringify(body, null, 2));
  }
  
  console.log('\n✅ Test terminé');
});
