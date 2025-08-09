// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connexion DB
const pool = require('./config/db');

// Routes (⚠️ pas d’accolades sur require)
const authRoutes = require('./routes/auth.routes');
const annoncesRoutes = require('./routes/annonces.routes');
const categoriesRoutes = require('./routes/categories.routes');

app.use('/api/auth', authRoutes);
app.use('/api/annonces', annoncesRoutes);
app.use('/api/categories', categoriesRoutes);

app.get('/', (req, res) => {
  res.send('🎯 API Assigmé en ligne');
});

pool.query('SELECT NOW() AS now', (err, result) => {
  if (err) console.error('❌ Erreur DB :', err);
  else console.log('🟢 Connexion DB réussie à : ', result.rows[0].now);
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ Serveur lancé sur le port ${PORT}`));
}

module.exports = app;
