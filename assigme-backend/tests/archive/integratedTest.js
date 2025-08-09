// integratedTest.js - Test intégré sans requêtes réseau externes

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

// Créer l'application Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route d'inscription simplifiée
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register route hit');
  console.log('Body received:', req.body);
  
  let { full_name, email, phone, password } = req.body;

  // normalisation email
  email = String(email).trim().toLowerCase();
  console.log('Normalized email:', email);

  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis ❌' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà inscrit ❌' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, account_type, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [full_name, email, phone, hashedPassword, 'particulier']
    );

    return res.status(201).json({ message: 'Inscription réussie ✅' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Cet email est déjà inscrit ❌' });
    }
    console.error('🔥 Erreur SQL register:', err);
    return res.status(500).json({ message: 'Erreur côté serveur ❌' });
  }
});

// Fonction pour faire un test direct
async function testRegisterDirect() {
  console.log('🧪 Test d\'inscription direct sans requête HTTP...');

  const userData = {
    full_name: 'Test User',
    email: `test${Date.now()}@test.com`,
    phone: '90909090',
    password: 'password123'
  };

  console.log('Données utilisateur:', userData);

  try {
    // Créer une requête fictive
    const req = {
      body: userData
    };

    // Créer une réponse fictive
    const res = {
      status: function(code) {
        this.statusCode = code;
        console.log(`🔢 Status code: ${code}`);
        return this;
      },
      json: function(data) {
        this.data = data;
        console.log('📤 Réponse:', data);
        return this;
      }
    };

    // Appeler la route directement
    await app.handle({
      method: 'POST',
      url: '/api/auth/register',
      headers: {
        'content-type': 'application/json'
      },
      body: userData
    }, res);

    console.log('✅ Test terminé');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  } finally {
    // Fermer la connexion à la fin
    await pool.end();
  }
}

// Exécuter le test
testRegisterDirect();
