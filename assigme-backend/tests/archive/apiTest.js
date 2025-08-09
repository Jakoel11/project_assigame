const axios = require('axios');
const fs = require('fs');

async function testAPI() {
  try {
    // Test GET /api/annonces
    console.log('R�cup�ration des annonces...');
    const annoncesResponse = await axios.get('http://localhost:5001/api/annonces');
    console.log(`Status: ${annoncesResponse.status}`);
    console.log(`Donn�es re�ues: ${JSON.stringify(annoncesResponse.data).substring(0, 300)}...`);
    
    if (annoncesResponse.data && annoncesResponse.data.annonces) {
      console.log(`Nombre d'annonces: ${annoncesResponse.data.annonces.length}`);
      if (annoncesResponse.data.annonces.length > 0) {
        console.log(`Premi�re annonce: ${JSON.stringify(annoncesResponse.data.annonces[0])}`);
      }
    } else {
      console.log('Format de r�ponse inattendu:', Object.keys(annoncesResponse.data));
    }
    
    // Test Conversations API
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIwLCJlbWFpbCI6ImJhc2ljLnRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTQ3MjQ5ODgsImV4cCI6MTc1NDcyODU4OH0.WgkYGjf-IaQBDV0McMCQ9yXAA47IhcFsECGsGWAE5BU";
    
    console.log('\nR�cup�ration des conversations...');
    try {
      const convsResponse = await axios.get('http://localhost:5001/api/conversations', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      console.log(`Status: ${convsResponse.status}`);
      console.log(`Donn�es re�ues: ${JSON.stringify(convsResponse.data)}`);
    } catch (convError) {
      console.log(`Erreur conversations: ${convError.message}`);
      if (convError.response) {
        console.log(`Status: ${convError.response.status}`);
        console.log(`Message: ${JSON.stringify(convError.response.data)}`);
      }
    }
    
    console.log('\nTest termin�');
    
  } catch (error) {
    console.log(`Erreur principale: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testAPI();
