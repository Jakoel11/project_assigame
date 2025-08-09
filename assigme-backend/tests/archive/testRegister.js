// testRegister.js
// Script pour tester l'inscription d'un utilisateur

const axios = require('axios');

async function testRegister() {
  console.log('Test de l\'inscription d\'un utilisateur...');
  
  try {
    const userData = {
      full_name: "Test User",
      email: "test" + Date.now() + "@test.com", // Pour éviter les doublons
      phone: "90909090",
      password: "password123"
    };
    
    console.log('Données utilisateur:', userData);
    
    const response = await axios.post('http://localhost:5001/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Inscription réussie!');
    console.log('Code de statut:', response.status);
    console.log('Réponse:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:');
    if (error.response) {
      // La requête a été effectuée et le serveur a répondu avec un code de statut
      // qui n'est pas dans la plage 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // La requête a été effectuée mais aucune réponse n'a été reçue
      console.error('No response received:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Error message:', error.message);
    }
  }
}

// Exécuter la fonction
testRegister();
