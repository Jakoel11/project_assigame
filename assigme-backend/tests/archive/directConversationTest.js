// directConversationTest.js - Test direct des fonctionnalités de conversation

const axios = require("axios");
const fs = require("fs");

// Configuration
const BASE_URL = "http://localhost:5001";
const LOG_FILE = "direct_conversation_test.txt";

// Données de test
const testUser1 = {
  full_name: "Test Direct 1",
  email: "direct1@example.com",
  phone: "90000011",
  password: "password123"
};

const testUser2 = {
  full_name: "Test Direct 2",
  email: "direct2@example.com",
  phone: "90000022",
  password: "password123"
};

// Variables globales
let user1Token = null;
let user2Token = null;
let annonceId = null;
let conversationId = null;

// Fonction pour logger dans un fichier et la console
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = typeof message === "object" 
    ? JSON.stringify(message, null, 2) 
    : message;
  
  // Écrire dans le fichier
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${formattedMessage}\n`);
  
  // Afficher dans la console
  console.log(formattedMessage);
}

// Initialiser le fichier de log
fs.writeFileSync(LOG_FILE, `=== Test direct des conversations - ${new Date().toISOString()} ===\n\n`);

// Fonction pour exécuter les tests
async function runTests() {
  log("🚀 Démarrage des tests de conversation");
  
  try {
    // 1. Enregistrer ou connecter les utilisateurs
    log("\n--- 1. Authentification des utilisateurs ---");
    
    // Utilisateur 1
    try {
      const user1Response = await axios.post(`${BASE_URL}/api/auth/register`, testUser1);
      user1Token = user1Response.data.token;
      log(`✅ Utilisateur 1 enregistré`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // L'utilisateur existe déjà
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: testUser1.email,
          password: testUser1.password
        });
        user1Token = loginResponse.data.token;
        log(`✅ Utilisateur 1 connecté`);
      } else {
        throw error;
      }
    }
    
    // Utilisateur 2
    try {
      const user2Response = await axios.post(`${BASE_URL}/api/auth/register`, testUser2);
      user2Token = user2Response.data.token;
      log(`✅ Utilisateur 2 enregistré`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // L'utilisateur existe déjà
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: testUser2.email,
          password: testUser2.password
        });
        user2Token = loginResponse.data.token;
        log(`✅ Utilisateur 2 connecté`);
      } else {
        throw error;
      }
    }
    
    // 2. Créer une annonce
    log("\n--- 2. Création d'une annonce ---");
    
    try {
      const annonceData = {
        titre: "Annonce de test direct",
        description: "Description de l'annonce de test direct",
        prix: 5000,
        categorie_id: 1,
        sous_categorie_id: 1,
        ville: "Lomé",
        images: "https://example.com/image.jpg",
        is_boosted: false
      };
      
      const annonceResponse = await axios.post(`${BASE_URL}/api/annonces`, annonceData, {
        headers: { "Authorization": `Bearer ${user1Token}` }
      });
      
      annonceId = annonceResponse.data.id;
      log(`✅ Annonce créée avec ID: ${annonceId}`);
    } catch (error) {
      log(`⚠️ Erreur lors de la création de l'annonce: ${error.message}`);
      
      // Tenter de récupérer une annonce existante
      const annoncesResponse = await axios.get(`${BASE_URL}/api/annonces`);
      if (annoncesResponse.data && annoncesResponse.data.length > 0) {
        annonceId = annoncesResponse.data[0].id;
        log(`✅ Utilisation d'une annonce existante: ID ${annonceId}`);
      } else {
        throw new Error("Impossible de créer ou de trouver une annonce");
      }
    }
    
    // 3. Démarrer une conversation
    log("\n--- 3. Démarrage d'une conversation ---");
    
    try {
      const convResponse = await axios.post(
        `${BASE_URL}/api/conversations/${annonceId}`,
        { message: "Bonjour, je suis intéressé par votre annonce." },
        { headers: { "Authorization": `Bearer ${user2Token}` } }
      );
      
      conversationId = convResponse.data.conversationId;
      log(`✅ Conversation démarrée avec ID: ${conversationId}`);
    } catch (error) {
      if (error.response && error.response.status === 409 && error.response.data.conversationId) {
        conversationId = error.response.data.conversationId;
        log(`⚠️ Une conversation existe déjà avec ID: ${conversationId}`);
      } else {
        log(`⚠️ Erreur lors du démarrage de la conversation: ${error.message}`);
        
        // Tenter de récupérer une conversation existante
        const convsResponse = await axios.get(`${BASE_URL}/api/conversations`, {
          headers: { "Authorization": `Bearer ${user2Token}` }
        });
        
        if (convsResponse.data && convsResponse.data.length > 0) {
          conversationId = convsResponse.data[0].id;
          log(`✅ Utilisation d'une conversation existante: ID ${conversationId}`);
        } else {
          throw new Error("Impossible de démarrer ou de trouver une conversation");
        }
      }
    }
    
    // 4. Envoyer des messages
    log("\n--- 4. Envoi de messages ---");
    
    try {
      // Message de l'acheteur
      await axios.post(
        `${BASE_URL}/api/conversations/${conversationId}/messages`,
        { content: "Quel est le prix minimum que vous accepteriez ?" },
        { headers: { "Authorization": `Bearer ${user2Token}` } }
      );
      log("✅ Message envoyé par l'acheteur");
      
      // Réponse du vendeur
      await axios.post(
        `${BASE_URL}/api/conversations/${conversationId}/messages`,
        { content: "Je peux baisser à 4500 FCFA, pas moins." },
        { headers: { "Authorization": `Bearer ${user1Token}` } }
      );
      log("✅ Réponse envoyée par le vendeur");
    } catch (error) {
      log(`⚠️ Erreur lors de l'envoi des messages: ${error.message}`);
    }
    
    // 5. Récupérer les messages
    log("\n--- 5. Récupération des messages ---");
    
    try {
      const messagesResponse = await axios.get(
        `${BASE_URL}/api/conversations/${conversationId}/messages`,
        { headers: { "Authorization": `Bearer ${user1Token}` } }
      );
      
      log(`✅ ${messagesResponse.data.length} messages récupérés:`);
      messagesResponse.data.forEach((msg, index) => {
        log(`   Message ${index + 1}: ${msg.content}`);
      });
    } catch (error) {
      log(`⚠️ Erreur lors de la récupération des messages: ${error.message}`);
    }
    
    log("\n✅ Tests terminés avec succès");
    
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`);
    if (error.response) {
      log(`   Status: ${error.response.status}`);
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Exécuter les tests
runTests();
