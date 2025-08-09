// simpleConversationTest.js - Test simple de conversation avec token prédéfini

const axios = require("axios");
const fs = require("fs");

// Configuration
const BASE_URL = "http://localhost:5001";
const LOG_FILE = "simple_conversation_test.txt";

// Fonction pour logger
function log(message) {
  fs.appendFileSync(LOG_FILE, `${message}\n`);
  console.log(message);
}

// Initialiser le fichier de log
fs.writeFileSync(LOG_FILE, `=== Test simple de conversation - ${new Date().toISOString()} ===\n\n`);

// Token obtenu lors du test précédent (à remplacer par votre token valide)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIwLCJlbWFpbCI6ImJhc2ljLnRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTQ3MjQ5ODgsImV4cCI6MTc1NDcyODU4OH0.WgkYGjf-IaQBDV0McMCQ9yXAA47IhcFsECGsGWAE5BU";

// Fonction pour récupérer les annonces
async function getAnnonces() {
  log("Récupération des annonces:");
  try {
    const response = await axios.get(`${BASE_URL}/api/annonces`);
    log(`Nombre d'annonces: ${response.data.length}`);
    
    if (response.data.length > 0) {
      log(`Première annonce: ID=${response.data[0].id}, Titre=${response.data[0].titre}`);
      return response.data[0].id;
    } else {
      log("Aucune annonce trouvée");
      return null;
    }
  } catch (error) {
    log(`Erreur: ${error.message}`);
    return null;
  }
}

// Fonction pour récupérer les conversations
async function getConversations() {
  log("\nRécupération des conversations:");
  try {
    const response = await axios.get(`${BASE_URL}/api/conversations`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    log(`Nombre de conversations: ${response.data.length}`);
    
    if (response.data.length > 0) {
      log(`Première conversation: ID=${response.data[0].id}`);
      return response.data[0].id;
    } else {
      log("Aucune conversation trouvée");
      return null;
    }
  } catch (error) {
    log(`Erreur: ${error.message}`);
    if (error.response) {
      log(`Status: ${error.response.status}`);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// Fonction pour démarrer une conversation
async function startConversation(annonceId) {
  log("\nDémarrage d'une conversation:");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/conversations/${annonceId}`,
      { message: "Message initial de test" },
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    
    log(`Conversation démarrée: ID=${response.data.conversationId}`);
    return response.data.conversationId;
  } catch (error) {
    log(`Erreur: ${error.message}`);
    if (error.response) {
      log(`Status: ${error.response.status}`);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// Fonction pour envoyer un message
async function sendMessage(conversationId) {
  log("\nEnvoi d'un message:");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/conversations/${conversationId}/messages`,
      { content: "Message de test simple" },
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    
    log("Message envoyé avec succès");
    return true;
  } catch (error) {
    log(`Erreur: ${error.message}`);
    if (error.response) {
      log(`Status: ${error.response.status}`);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// Fonction pour récupérer les messages
async function getMessages(conversationId) {
  log("\nRécupération des messages:");
  try {
    const response = await axios.get(
      `${BASE_URL}/api/conversations/${conversationId}/messages`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    
    log(`Nombre de messages: ${response.data.length}`);
    
    if (response.data.length > 0) {
      response.data.forEach((msg, index) => {
        log(`Message ${index + 1}: ${msg.content}`);
      });
    } else {
      log("Aucun message trouvé");
    }
    
    return response.data.length > 0;
  } catch (error) {
    log(`Erreur: ${error.message}`);
    if (error.response) {
      log(`Status: ${error.response.status}`);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  try {
    // 1. Récupérer une annonce
    const annonceId = await getAnnonces();
    if (!annonceId) {
      log("\n❌ Test échoué: Aucune annonce disponible");
      return;
    }
    
    // 2. Vérifier les conversations existantes
    let conversationId = await getConversations();
    
    // 3. Si aucune conversation n'existe, en démarrer une
    if (!conversationId) {
      conversationId = await startConversation(annonceId);
    }
    
    if (!conversationId) {
      log("\n❌ Test échoué: Impossible de démarrer ou de trouver une conversation");
      return;
    }
    
    // 4. Envoyer un message
    const messageSent = await sendMessage(conversationId);
    
    // 5. Récupérer les messages
    const messagesFound = await getMessages(conversationId);
    
    // Résultat final
    log("\nRésultat final:");
    log(`- Annonce trouvée: ${annonceId ? "Oui" : "Non"}`);
    log(`- Conversation trouvée/créée: ${conversationId ? "Oui" : "Non"}`);
    log(`- Message envoyé: ${messageSent ? "Oui" : "Non"}`);
    log(`- Messages récupérés: ${messagesFound ? "Oui" : "Non"}`);
    
    if (annonceId && conversationId && messageSent && messagesFound) {
      log("\n✅ Test réussi !");
    } else {
      log("\n⚠️ Test partiellement réussi");
    }
    
  } catch (error) {
    log(`\n❌ Erreur générale: ${error.message}`);
  }
}

runTests();
