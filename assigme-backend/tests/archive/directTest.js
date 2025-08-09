// simpleTest.js - Test simple avec différentes méthodes de logging

// Méthode 1: console.log standard
console.log("🔍 Test de logging avec console.log standard");

// Méthode 2: process.stdout.write
process.stdout.write("🔍 Test de logging avec process.stdout.write\n");

// Méthode 3: console.error (utilise stderr)
console.error("🔍 Test de logging avec console.error (stderr)");

// Méthode 4: process.stderr.write
process.stderr.write("🔍 Test de logging avec process.stderr.write\n");

// Méthode 5: fichier
const fs = require("fs");
fs.writeFileSync("simple_test_log.txt", "🔍 Test de logging dans un fichier\n");

// Informer que le test est terminé
console.log("🎉 Test de logging terminé. Vérifiez le fichier simple_test_log.txt");
