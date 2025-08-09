// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const poolAuth = require('../config/db');

exports.register = async (req, res) => {
  console.log('📝 Register route hit');
  console.log('Body received:', req.body);
  
  let { full_name, email, phone, password } = req.body;

  // normalisation email (IMPORTANT pour matching avec le login)
  email = String(email).trim().toLowerCase();
  console.log('Normalized email:', email);

  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis ❌' });
  }

  try {
    // ✅ Pré-check doublon (déterministe pour les tests)
    const exists = await poolAuth.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà inscrit ❌' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await poolAuth.query(
      `INSERT INTO users (full_name, email, phone, password_hash, account_type, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [full_name, email, phone, hashedPassword, 'particulier']
    );

    return res.status(201).json({ message: 'Inscription réussie ✅' });
  } catch (err) {
    // Garde-fou si tu as aussi une contrainte UNIQUE côté DB
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Cet email est déjà inscrit ❌' });
    }
    console.error('🔥 Erreur SQL register:', err);
    return res.status(500).json({ message: 'Erreur côté serveur ❌' });
  }
};

exports.login = async (req, res) => {
  // normalisation email
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;

  try {
    const r = await poolAuth.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = r.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ❌' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Mot de passe incorrect ❌' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token, message: 'Connexion réussie ✅' });
  } catch (err) {
    console.error('Erreur login:', err);
    return res.status(500).json({ message: 'Erreur serveur ❌' });
  }
};

exports.profile = (req, res) => {
  return res.status(200).json({
    message: `🔐 Bienvenue ${req.user.email}, tu es connecté.`,
    user: req.user,
  });
};
