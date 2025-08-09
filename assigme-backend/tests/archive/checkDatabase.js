// checkDatabase.js
// Script pour vérifier la structure de la base de données

const pool = require('./config/db');

async function checkDatabase() {
  console.log('Vérification de la base de données...');
  
  try {
    // Vérifier la connexion
    const connection = await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie:', connection.rows[0].now);
    
    // Vérifier les tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables dans la base de données:');
    if (tables.rows.length === 0) {
      console.log('❌ Aucune table trouvée dans la base de données!');
    } else {
      tables.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Vérifier la table users si elle existe
    const userTableExists = tables.rows.some(table => table.table_name === 'users');
    
    if (userTableExists) {
      console.log('\n👤 Structure de la table users:');
      const userColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      
      userColumns.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
      });
    } else {
      console.log('\n❌ Table users non trouvée!');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:', error);
  } finally {
    // Fermer la connexion à la fin
    pool.end();
  }
}

// Exécuter la fonction
checkDatabase();
