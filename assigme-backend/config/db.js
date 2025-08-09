// config/db.js - Configuration PostgreSQL

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
// Vous pouvez ajouter des configurations supplémentaires ici si nécessaire
// Assurez-vous que le fichier .env contient DATABASE_URL avec les bonnes informations de connexion