// scripts/migrate.js
// ============================================================================
// Script de migration de la base de données
// ============================================================================

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const migrationsDir = path.join(__dirname, '../migrations');

async function runMigrations() {
  console.log('🚀 Démarrage des migrations de base de données...');
  
  try {
    // Créer la table de suivi des migrations si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Obtenir la liste des migrations déjà exécutées
    const { rows: executedMigrations } = await pool.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    const executedSet = new Set(executedMigrations.map(m => m.filename));
    
    // Lire tous les fichiers de migration
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 ${migrationFiles.length} fichiers de migration trouvés`);
    
    // Exécuter les migrations non exécutées
    for (const filename of migrationFiles) {
      if (executedSet.has(filename)) {
        console.log(`⏭️  Migration ${filename} déjà exécutée`);
        continue;
      }
      
      console.log(`⚡ Exécution de la migration ${filename}...`);
      
      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query('BEGIN');
        await pool.query(migrationSQL);
        await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        await pool.query('COMMIT');
        
        console.log(`✅ Migration ${filename} exécutée avec succès`);
      } catch (error) {
        await pool.query('ROLLBACK');
        throw new Error(`Erreur lors de l'exécution de ${filename}: ${error.message}`);
      }
    }
    
    console.log('🎉 Toutes les migrations ont été exécutées avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };