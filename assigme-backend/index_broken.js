////////////////////////////////////////////////////////////////////////////////////
// index.js - Point d'entrée principal du serveur

// Import des dépendances
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env
dotenv.config();

// Créer l'application Express
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Import des routes
const authRoutes = require('./routes/auth.routes');
const annoncesRoutes = require('./routes/annonces.routes');
const categoriesRoutes = require('./routes/categories.routes');

// Utiliser les routes avec le préfixe /api
app.use('/api/auth', authRoutes);
app.use('/api/annonces', annoncesRoutes);
app.use('/api/categories', categoriesRoutes);

// Route racine simple pour test
app.get('/', (req, res) => {
  res.send('🎯 API Assigmé en ligne');
});

// Importer la connexion à la base de données et vérifier sa disponibilité au démarrage
const pool = require('./config/db');
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Erreur DB :', err);
  } else {
    console.log('🟢 Connexion DB réussie à :', result.rows[0].now);
  }
});


////////////////////////////////////////////////////////////////////////////////////
// config/db.js - Configuration et connexion PostgreSQL

const { Pool } = require('pg');


// Export du pool pour être réutilisé dans toute l'application
module.exports = pool;

////////////////////////////////////////////////////////////////////////////////////
// middleware/auth.js - Middleware d'authentification JWT

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ message: '⛔ Token manquant' });

  // Format attendu : "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: '⛔ Token invalide (format)' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // injection des infos utilisateur décodées dans req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: '⛔ Token invalide' });
  }
}

module.exports = authMiddleware;

////////////////////////////////////////////////////////////////////////////////////
// routes/auth.routes.js - Routes d'authentification

const routerAuth = express.Router();
const authController = require('../controllers/auth.controller');

// Route inscription
routerAuth.post('/register', authController.register);

// Route connexion
routerAuth.post('/login', authController.login);

module.exports = routerAuth;

////////////////////////////////////////////////////////////////////////////////////
// controllers/auth.controller.js - Contrôleur pour l'authentification

const bcrypt = require('bcryptjs');
const poolAuth = require('../config/db');

exports.register = async (req, res) => {
  const { full_name, email, phone, password } = req.body;

  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis ❌' });
  }

  try {
    // Vérifier qu'aucun utilisateur n'a déjà cet email
    const existingUser = await poolAuth.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà inscrit ❌' });
    }

    // Hasher le mot de passe utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur en base de données
    await poolAuth.query(
      `INSERT INTO users (full_name, email, phone, password_hash, account_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [full_name, email, phone, hashedPassword, 'particulier']
    );

    res.status(201).json({ message: 'Inscription réussie ✅' });
  } catch (err) {
    console.error('🔥 Erreur SQL:', err);
    res.status(500).json({ message: 'Erreur côté serveur ❌' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Récupérer utilisateur par email
    const result = await poolAuth.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ❌' });
    }

    // Comparer mot de passe avec le hash stocké
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect ❌' });
    }

    // Générer un token JWT signé avec la clef secrète
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, message: 'Connexion réussie ✅' });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ message: 'Erreur serveur ❌' });
  }
};

////////////////////////////////////////////////////////////////////////////////////
// routes/annonces.routes.js - Routes liées aux annonces


const routerAnnonces = express.Router();
const annoncesController = require('../controllers/annonces.controller');
const auth = require('../middleware/auth');

// Création d'une annonce (protégée)
routerAnnonces.post('/', auth, annoncesController.createAnnonce);

// Liste publique des annonces
routerAnnonces.get('/', annoncesController.listAnnonces);

// Détail d'une annonce spécifique (publique)
routerAnnonces.get('/:id', annoncesController.getAnnonce);

// Mise à jour d'une annonce (protégée)
routerAnnonces.put('/:id', auth, annoncesController.updateAnnonce);

// Suppression d'une annonce (protégée)
routerAnnonces.delete('/:id', auth, annoncesController.deleteAnnonce);

// Liste des annonces de l'utilisateur connecté (protégée)
routerAnnonces.get('/mes-annonces', auth, annoncesController.listUserAnnonces);

module.exports = routerAnnonces;

////////////////////////////////////////////////////////////////////////////////////
// controllers/annonces.controller.js - Contrôleur pour les annonces

const poolAnnonces = require('../config/db');

exports.createAnnonce = async (req, res) => {
  const user_id = req.user.id;
  const {
    titre, description, prix, categorie_id, sous_categorie_id, ville, images, is_boosted,
  } = req.body;

  // Vérification des champs obligatoires
  if (!titre || !prix || !categorie_id || !ville) {
    return res.status(400).json({ message: '❌ Champs obligatoires manquants (titre, prix, catégorie, ville)' });
  }

  try {
    const result = await poolAnnonces.query(
      `INSERT INTO annonces 
       (user_id, titre, description, prix, categorie_id, sous_categorie_id, ville, images, is_boosted, date_creation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [
        user_id,
        titre,
        description || '',
        prix,
        categorie_id,
        sous_categorie_id || null,
        ville,
        images || '',
        is_boosted || false,
      ]
    );
    res.status(201).json({ message: '✅ Annonce créée avec succès', annonce: result.rows[0] });
  } catch (err) {
    console.error('🔥 Erreur création annonce:', err);
    res.status(500).json({ message: '❌ Erreur serveur lors de la création' });
  }
};

exports.listAnnonces = async (req, res) => {
  try {
    const result = await poolAnnonces.query(
      `SELECT 
        a.id, a.titre, a.description, a.prix, 
        c.nom AS categorie, 
        sc.nom AS sous_categorie, 
        a.ville, a.images, a.is_boosted, a.date_creation,
        u.full_name, u.email
       FROM annonces a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN categories c ON a.categorie_id = c.id
       LEFT JOIN sous_categories sc ON a.sous_categorie_id = sc.id
       ORDER BY a.date_creation DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Erreur récupération annonces :', err);
    res.status(500).json({ message: 'Erreur serveur ❌' });
  }
};

exports.getAnnonce = async (req, res) => {
  const annonceId = req.params.id;
  try {
    const result = await poolAnnonces.query('SELECT * FROM annonces WHERE id = $1', [annonceId]);
    const annonce = result.rows[0];
    if (!annonce) {
      return res.status(404).json({ message: '❌ Annonce introuvable' });
    }
    res.status(200).json(annonce);
  } catch (err) {
    console.error('❌ Erreur récupération annonce spécifique :', err);
    res.status(500).json({ message: 'Erreur serveur ❌' });
  }
};

exports.updateAnnonce = async (req, res) => {
  const annonceId = req.params.id;
  const userId = req.user.id;
  const {
    titre, description, prix, categorie_id, sous_categorie_id, ville, images, is_boosted,
  } = req.body;

  try {
    const result = await poolAnnonces.query('SELECT * FROM annonces WHERE id = $1', [annonceId]);
    const annonce = result.rows[0];

    if (!annonce) {
      return res.status(404).json({ message: '❌ Annonce non trouvée' });
    }
    if (annonce.user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé à modifier cette annonce' });
    }

    const updated = await poolAnnonces.query(
      `UPDATE annonces SET
        titre = $1, description = $2, prix = $3, categorie_id = $4,
        sous_categorie_id = $5, ville = $6, images = $7, is_boosted = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        titre || annonce.titre,
        description || annonce.description,
        prix || annonce.prix,
        categorie_id || annonce.categorie_id,
        sous_categorie_id || annonce.sous_categorie_id,
        ville || annonce.ville,
        images || annonce.images,
        typeof is_boosted === 'boolean' ? is_boosted : annonce.is_boosted,
        annonceId,
      ]
    );
    res.status(200).json({ message: '✅ Annonce mise à jour avec succès', annonce: updated.rows[0] });
  } catch (err) {
    console.error('🔥 Erreur mise à jour annonce :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.deleteAnnonce = async (req, res) => {
  const annonceId = req.params.id;
  const userId = req.user.id;
  try {
    const result = await poolAnnonces.query('SELECT * FROM annonces WHERE id = $1', [annonceId]);
    const annonce = result.rows[0];
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée ❌' });
    }
    if (annonce.user_id !== userId) {
      return res.status(403).json({ message: '⛔ Non autorisé à supprimer cette annonce' });
    }
    await poolAnnonces.query('DELETE FROM annonces WHERE id = $1', [annonceId]);
    res.json({ message: '🗑️ Annonce supprimée avec succès ✅' });
  } catch (err) {
    console.error('🔥 Erreur suppression annonce :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.listUserAnnonces = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await poolAnnonces.query(
      'SELECT * FROM annonces WHERE user_id = $1 ORDER BY date_creation DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur récupération annonces utilisateur :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

////////////////////////////////////////////////////////////////////////////////////
// routes/categories.routes.js - Routes liées aux catégories et sous-catégories 


const routerCategories = express.Router();
const categoriesController = require('../controllers/categories.controller');

// Liste des catégories avec sous-catégories imbriquées
routerCategories.get('/', categoriesController.listCategoriesWithSousCategories);

// Liste simple des catégories
routerCategories.get('/list', categoriesController.listCategories);

// Sous-catégories d'une catégorie donnée
routerCategories.get('/:id/sous-categories', categoriesController.listSousCategories);

module.exports = routerCategories;

////////////////////////////////////////////////////////////////////////////////////
// controllers/categories.controller.js - Contrôleur des catégories 

const poolCategories = require('../config/db');

exports.listCategoriesWithSousCategories = async (req, res) => {
  try {
    const categoriesResult = await poolCategories.query('SELECT * FROM categories ORDER BY nom ASC');
    const sousCategoriesResult = await poolCategories.query('SELECT * FROM sous_categories ORDER BY nom ASC');

    // Grouper les sous-catégories par catégorie id
    const mapSousCategories = {};
    sousCategoriesResult.rows.forEach(sc => {
      if (!mapSousCategories[sc.categorie_id]) {
        mapSousCategories[sc.categorie_id] = [];
      }
      mapSousCategories[sc.categorie_id].push({
        id: sc.id,
        nom: sc.nom,
      });
    });

    const categoriesAvecSous = categoriesResult.rows.map(cat => ({
      id: cat.id,
      nom: cat.nom,
      sous_categories: mapSousCategories[cat.id] || [],
    }));

    res.status(200).json(categoriesAvecSous);
  } catch (err) {
    console.error('Erreur récupération catégories :', err);
    res.status(500).json({ message: '❌ Erreur serveur lors de la récupération des catégories' });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const result = await poolCategories.query('SELECT * FROM categories ORDER BY nom ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur récupération catégories :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.listSousCategories = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const result = await poolCategories.query(
      'SELECT * FROM sous_categories WHERE categorie_id = $1 ORDER BY nom ASC',
      [categoryId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur récupération sous-catégories :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

// Démarrer le serveur sur le port défini (5000 par défaut)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});