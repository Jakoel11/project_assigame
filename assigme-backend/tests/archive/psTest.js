const axios = require('axios');
const BASE_URL = 'http://localhost:5001';

async function runTest() {
  // Résultats
  let results = {
    register: false,
    login: false,
    createAnnonce: false,
    createConversation: false,
    sendMessage: false
  };
  
  try {
    // 1. Inscription
    console.log("1. Test d'inscription...");
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        full_name: 'Test PowerShell',
        email: 'test.ps@example.com',
        phone: '99887755',
        password: 'password123'
      });
      console.log("Inscription réussie:", registerResponse.status);
      results.register = true;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log("Utilisateur déjà inscrit, on continue");
        results.register = true;
      } else {
        console.log("Erreur inscription:", error.message);
        if (error.response) {
          console.log("Status:", error.response.status);
          console.log("Data:", JSON.stringify(error.response.data));
        }
      }
    }
    
    if (!results.register) {
      console.log("Échec à l'inscription, arrêt du test");
      return results;
    }
    
    // 2. Connexion
    console.log("\n2. Test de connexion...");
    let token;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test.ps@example.com',
        password: 'password123'
      });
      console.log("Connexion réussie:", loginResponse.status);
      token = loginResponse.data.token;
      results.login = true;
    } catch (error) {
      console.log("Erreur connexion:", error.message);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data));
      }
    }
    
    if (!results.login) {
      console.log("Échec à la connexion, arrêt du test");
      return results;
    }
    
    // 3. Création d'une annonce
    console.log("\n3. Test de création d'annonce...");
    let annonceId;
    try {
      const createAnnonceResponse = await axios.post(`${BASE_URL}/api/annonces`,
        {
          titre: 'Test PowerShell',
          description: 'Annonce créée via test PowerShell',
          prix: 5000,
          categorie_id: 1,
          ville: 'Lomé',
          images: 'image.jpg'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Annonce créée:", createAnnonceResponse.status);
      annonceId = createAnnonceResponse.data.annonce.id;
      results.createAnnonce = true;
    } catch (error) {
      console.log("Erreur création annonce:", error.message);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data));
      }
    }
    
    if (!results.createAnnonce) {
      console.log("Échec à la création d'annonce, arrêt du test");
      return results;
    }
    
    // 4. Création d'une conversation
    console.log("\n4. Test de création de conversation...");
    let conversationId;
    try {
      const createConvResponse = await axios.post(
        `${BASE_URL}/api/conversations/${annonceId}`,
        { message: 'Message initial PowerShell' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Conversation créée:", createConvResponse.status);
      conversationId = createConvResponse.data.conversationId;
      results.createConversation = true;
    } catch (error) {
      console.log("Erreur création conversation:", error.message);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data));
      }
    }
    
    if (!results.createConversation) {
      console.log("Échec à la création de conversation, arrêt du test");
      return results;
    }
    
    // 5. Envoi d'un message
    console.log("\n5. Test d'envoi de message...");
    try {
      const sendMsgResponse = await axios.post(
        `${BASE_URL}/api/conversations/${conversationId}/messages`,
        { content: 'Message de suivi PowerShell' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Message envoyé:", sendMsgResponse.status);
      results.sendMessage = true;
    } catch (error) {
      console.log("Erreur envoi message:", error.message);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data));
      }
    }
    
    // Résultat final
    console.log("\n=== RÉSULTAT FINAL ===");
    console.log("Inscription:", results.register ? "✓" : "✗");
    console.log("Connexion:", results.login ? "✓" : "✗");
    console.log("Création d'annonce:", results.createAnnonce ? "✓" : "✗");
    console.log("Création de conversation:", results.createConversation ? "✓" : "✗");
    console.log("Envoi de message:", results.sendMessage ? "✓" : "✗");
    
    const success = Object.values(results).every(r => r === true);
    console.log("\n", success ? "✅ TEST COMPLET RÉUSSI!" : "⚠️ TEST PARTIELLEMENT RÉUSSI");
    
    return results;
  } catch (error) {
    console.log("Erreur générale:", error.message);
    return results;
  }
}

runTest();
