// diagnose.js - Script de diagnostic pour identifier les problèmes serveur

const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Fonction pour tester la connexion à la base de données
async function testDatabaseConnection() {
  console.log('1️⃣ Test de connexion à la base de données...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL : 'Non défini');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Définir un timeout court pour le test
      connectionTimeoutMillis: 5000
    });
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie:', result.rows[0].now);
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.error('Détails:', error);
    return false;
  }
}

// Fonction pour tester le serveur HTTP minimal
async function testMinimalServer() {
  return new Promise((resolve) => {
    console.log('\n2️⃣ Test de démarrage d\'un serveur HTTP minimal...');
    
    try {
      const app = express();
      const PORT = 5002; // Port différent pour éviter les conflits
      
      app.get('/', (req, res) => {
        res.send('Test server is running');
      });
      
      const server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`✅ Serveur minimal démarré sur http://localhost:${PORT}`);
        
        // Fermer le serveur après 2 secondes
        setTimeout(() => {
          server.close(() => {
            console.log('✅ Serveur minimal arrêté proprement');
            resolve(true);
          });
        }, 2000);
      });
      
      server.on('error', (error) => {
        console.error('❌ Erreur de démarrage du serveur minimal:', error.message);
        console.error('Détails:', error);
        resolve(false);
      });
    } catch (error) {
      console.error('❌ Exception lors du démarrage du serveur minimal:', error.message);
      console.error('Détails:', error);
      resolve(false);
    }
  });
}

// Fonction pour tester le middleware et les routes
async function testRoutes() {
  console.log('\n3️⃣ Test des routes...');
  
  try {
    // Vérifier que les fichiers des routes existent
    const fs = require('fs');
    const routes = [
      './routes/auth.routes.js',
      './routes/annonces.routes.js',
      './routes/categories.routes.js',
      './routes/favoris.routes.js',
      './routes/conversations.routes.js'
    ];
    
    for (const route of routes) {
      if (fs.existsSync(route)) {
        console.log(`✅ Route ${route} existe`);
      } else {
        console.error(`❌ Route ${route} n'existe pas`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test des routes:', error.message);
    console.error('Détails:', error);
    return false;
  }
}

// Fonction pour vérifier les packages requis
async function checkRequiredPackages() {
  console.log('\n4️⃣ Vérification des packages requis...');
  
  const requiredPackages = [
    'express',
    'cors',
    'body-parser',
    'pg',
    'dotenv',
    'jsonwebtoken',
    'bcryptjs',
    'joi'
  ];
  
  try {
    const packageJson = require('./package.json');
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const pkg of requiredPackages) {
      if (dependencies[pkg]) {
        console.log(`✅ Package ${pkg} est installé (${dependencies[pkg]})`);
      } else {
        console.error(`❌ Package ${pkg} n'est pas installé`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des packages:', error.message);
    console.error('Détails:', error);
    return false;
  }
}

// Fonction pour vérifier les erreurs non gérées
function checkUncaughtExceptions() {
  console.log('\n5️⃣ Configuration de la gestion des erreurs non gérées...');
  
  try {
    // Configurer des gestionnaires pour capturer les erreurs non gérées
    process.on('uncaughtException', (error) => {
      console.error('❌ ERREUR NON GÉRÉE:', error.message);
      console.error('Stack trace:', error.stack);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ PROMESSE REJETÉE NON GÉRÉE:', reason);
    });
    
    console.log('✅ Gestionnaires d\'erreurs configurés');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des gestionnaires d\'erreurs:', error.message);
    console.error('Détails:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runDiagnostics() {
  console.log('🔍 DÉBUT DU DIAGNOSTIC 🔍');
  console.log('==========================');
  
  // Vérifier les erreurs non gérées d'abord
  checkUncaughtExceptions();
  
  // Exécuter les tests dans l'ordre
  await testDatabaseConnection();
  await testMinimalServer();
  await testRoutes();
  await checkRequiredPackages();
  
  console.log('\n==========================');
  console.log('🔍 FIN DU DIAGNOSTIC 🔍');
  
  console.log('\n📋 RECOMMANDATIONS:');
  console.log('1. Ajouter une gestion des erreurs non attrapées dans index.js');
  console.log('2. Ajouter un timeout à la connexion de la base de données');
  console.log('3. Vérifier que tous les middlewares sont correctement configurés');
  console.log('4. Rendre le serveur plus robuste avec un gestionnaire de processus comme PM2');
}

// Exécuter le diagnostic
runDiagnostics();
