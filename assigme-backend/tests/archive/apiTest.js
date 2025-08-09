const axios = require('axios');
const fs = require('fs');

async function testAPI() {
  try {
    // Test GET /api/annonces
    console.log('Récupération des annonces...');
    const annoncesResponse = await axios.get('http://localhost:5001/api/annonces');
    console.log(`Status: ${annoncesResponse.status}`);
    console.log(`Données reçues: ${JSON.stringify(annoncesResponse.data).substring(0, 300)}...`);
    
    if (annoncesResponse.data && annoncesResponse.data.annonces) {
      console.log(`Nombre d'annonces: ${annoncesResponse.data.annonces.length}`);
      if (annoncesResponse.data.annonces.length > 0) {
        console.log(`Première annonce: ${JSON.stringify(annoncesResponse.data.annonces[0])}`);
      }
    } else {
      console.log('Format de réponse inattendu:', Object.keys(annoncesResponse.data));
    }
    
    // Test Conversations API
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIwLCJlbWFpbCI6ImJhc2ljLnRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTQ3MjQ5ODgsImV4cCI6MTc1NDcyODU4OH0.WgkYGjf-IaQBDV0McMCQ9yXAA47IhcFsECGsGWAE5BU";
    
    console.log('\nRécupération des conversations...');
    try {
      const convsResponse = await axios.get('http://localhost:5001/api/conversations', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      console.log(`Status: ${convsResponse.status}`);
      console.log(`Données reçues: ${JSON.stringify(convsResponse.data)}`);
    } catch (convError) {
      console.log(`Erreur conversations: ${convError.message}`);
      if (convError.response) {
        console.log(`Status: ${convError.response.status}`);
        console.log(`Message: ${JSON.stringify(convError.response.data)}`);
      }
    }
    
    console.log('\nTest terminé');
    
  } catch (error) {
    console.log(`Erreur principale: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testAPI();
