// scripts/seed.js
// ============================================================================
// Script de seeding de la base de données
// ============================================================================

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const seedersDir = path.join(__dirname, '../seeders');

async function runSeeds() {
  console.log('🌱 Démarrage du seeding de la base de données...');
  
  try {
    // Créer le dossier seeders s'il n'existe pas
    if (!fs.existsSync(seedersDir)) {
      fs.mkdirSync(seedersDir);
      console.log('📁 Dossier seeders créé');
    }
    
    // Créer la table de suivi des seeds si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Obtenir la liste des seeds déjà exécutés
    const { rows: executedSeeds } = await pool.query(
      'SELECT filename FROM seeds ORDER BY id'
    );
    const executedSet = new Set(executedSeeds.map(s => s.filename));
    
    // Lire tous les fichiers de seed
    const seedFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (seedFiles.length === 0) {
      console.log('⚠️  Aucun fichier de seed trouvé dans le dossier seeders');
      return;
    }
    
    console.log(`📁 ${seedFiles.length} fichiers de seed trouvés`);
    
    // Exécuter les seeds non exécutés
    for (const filename of seedFiles) {
      if (executedSet.has(filename)) {
        console.log(`⏭️  Seed ${filename} déjà exécuté`);
        continue;
      }
      
      console.log(`🌱 Exécution du seed ${filename}...`);
      
      const seedPath = path.join(seedersDir, filename);
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      try {
        await pool.query('BEGIN');
        await pool.query(seedSQL);
        await pool.query('INSERT INTO seeds (filename) VALUES ($1)', [filename]);
        await pool.query('COMMIT');
        
        console.log(`✅ Seed ${filename} exécuté avec succès`);
      } catch (error) {
        await pool.query('ROLLBACK');
        throw new Error(`Erreur lors de l'exécution de ${filename}: ${error.message}`);
      }
    }
    
    console.log('🎉 Tous les seeds ont été exécutés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };