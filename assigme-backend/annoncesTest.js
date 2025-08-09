const axios = require('axios');
const fs = require('fs');

async function testAnnonces() {
  console.log("Début du test des annonces");
  try {
    const response = await axios.get("http://localhost:5001/api/annonces");
    
    console.log("Status:", response.status);
    console.log("Headers:", JSON.stringify(response.headers));
    console.log("Type of data:", typeof response.data);
    
    // Sauvegarder la réponse complète
    fs.writeFileSync("annonces_response.json", JSON.stringify(response.data, null, 2));
    console.log("Réponse complète sauvegardée dans annonces_response.json");
    
    // Afficher les propriétés de premier niveau
    console.log("Propriétés dans response.data:", Object.keys(response.data));
    
    if (response.data.annonces) {
      console.log("Nombre d'annonces:", response.data.annonces.length);
    } else {
      console.log("Pas de propriété 'annonces' dans la réponse");
    }
  } catch (error) {
    console.log("Erreur:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data));
    }
  }
  console.log("Fin du test");
}

testAnnonces();
