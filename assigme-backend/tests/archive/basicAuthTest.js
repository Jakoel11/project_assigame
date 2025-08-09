// basicAuthTest.js - Test très basique d'authentification

const axios = require("axios");
const fs = require("fs");

// Configuration
const BASE_URL = "http://localhost:5001";
const LOG_FILE = "basic_auth_test.txt";

// Fonction pour logger
function log(message) {
  fs.appendFileSync(LOG_FILE, `${message}\n`);
  console.log(message);
}

// Initialiser le fichier de log
fs.writeFileSync(LOG_FILE, `=== Test basique d'authentification - ${new Date().toISOString()} ===\n\n`);

// Données d'authentification
const registerData = {
  full_name: "Basic Test",
  email: "basic.test@example.com",
  phone: "90123456",
  password: "password123"
};

const loginData = {
  email: "basic.test@example.com",
  password: "password123"
};

// Tester l'enregistrement
async function testRegister() {
  log("Test d'enregistrement:");
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    log(`Status: ${response.status}`);
    log(`Data: ${JSON.stringify(response.data, null, 2)}`);
    return response.data;
  } catch (error) {
    log(`Erreur: ${error.message}`);
    if (error.response) {
      log(`Status: ${error.response.status}`);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// Tester la connexion
async function testLogin() {
  log("\nTest de connexion:");
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    log(`Status: ${response.status}`);
    log(`Data: ${JSON.stringify(response.data, null, 2)}`);
    return response.data;
  } catch (error) {
    log(`Erreur: ${error.message}`);
    if (error.response) {
      log(`Status: ${error.response.status}`);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// Exécuter les tests
async function runTests() {
  // Tester l'enregistrement
  const registerResult = await testRegister();
  
  // Tester la connexion si l'enregistrement échoue ou réussit
  const loginResult = await testLogin();
  
  log("\nRésultats:");
  log(`- Enregistrement: ${registerResult ? "Réussi" : "Échoué"}`);
  log(`- Connexion: ${loginResult ? "Réussie" : "Échouée"}`);
}

runTests();
