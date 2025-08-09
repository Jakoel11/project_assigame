// tests/setup.js
const pool = require('../config/db');

// Nettoyage de l’utilisateur de test pour éviter les états sales
beforeAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  } catch (e) {
    console.error('⚠️ Cleanup users failed:', e);
  }
});

// Ferme la pool DB pour éviter "Jest did not exit..."
afterAll(async () => {
  await pool.end();
});
