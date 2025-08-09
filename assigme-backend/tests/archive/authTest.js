// authTest.js - Test d'authentification uniquement

const axios = require("axios");
const fs = require("fs");

// Configuration
const BASE_URL = "http://localhost:5001";
const LOG_FILE = "auth_test.txt";

// Fonction pour logger
function log(message) {
  fs.appendFileSync(LOG_FILE, `${message}\n`);
  console.log(message);
}

// Initialiser le fichier de log
fs.writeFileSync(LOG_FILE, `=== Test d'authentification - ${new Date().toISOString()} ===\n\n`);

// Fonction de test
async function testAuth() {
  log("🚀 Démarrage du test d'authentification");
  
  try {
    // 1. Tester la connexion au serveur
    log("\n--- 1. Test de connexion au serveur ---");
    try {
      const response = await axios.get(BASE_URL);
      log(`✅ Serveur en ligne: ${response.data}`);
    } catch (error) {
      throw new Error(`Serveur non disponible: ${error.message}`);
    }
    
    // 2. Enregistrer un utilisateur
    log("\n--- 2. Enregistrement d'un utilisateur ---");
    const userData = {
      full_name: "Auth Test",
      email: "auth.test@example.com",
      phone: "90000099",
      password: "password123"
    };
    
    let token = null;
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, userData);
      token = registerResponse.data.token;
      log(`✅ Utilisateur enregistré avec succès, token obtenu: ${token ? "Oui" : "Non"}`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        log("⚠️ L'utilisateur existe déjà, tentative de connexion");
        
        try {
          const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: userData.email,
            password: userData.password
          });
          token = loginResponse.data.token;
          log(`✅ Utilisateur connecté avec succès, token obtenu: ${token ? "Oui" : "Non"}`);
        } catch (loginError) {
          throw new Error(`Échec de connexion: ${loginError.message}`);
        }
      } else {
        throw new Error(`Échec d'enregistrement: ${error.message}`);
      }
    }
    
    // 3. Tester le token
    if (token) {
      log("\n--- 3. Test du token ---");
      
      try {
        const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        log(`✅ Token valide, utilisateur: ${meResponse.data.email}`);
      } catch (error) {
        throw new Error(`Token invalide: ${error.message}`);
      }
    } else {
      throw new Error("Aucun token obtenu");
    }
    
    log("\n✅ Test d'authentification réussi");
    
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`);
    if (error.response) {
      log(`   Status: ${error.response.status}`);
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Exécuter le test
testAuth();
