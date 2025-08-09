// controllers/categories.controller.js
const pool = require('../config/db');

exports.listCategoriesWithSousCategories = async (req, res) => {
  try {
    const cats = await pool.query('SELECT * FROM categories ORDER BY nom ASC');
    const subs = await pool.query('SELECT * FROM sous_categories ORDER BY nom ASC');

    const map = {};
    subs.rows.forEach(sc => {
      map[sc.categorie_id] = map[sc.categorie_id] || [];
      map[sc.categorie_id].push({ id: sc.id, nom: sc.nom });
    });

    const result = cats.rows.map(cat => ({
      id: cat.id,
      nom: cat.nom,
      sous_categories: map[cat.id] || []
    }));
    res.json(result);
  } catch (err) {
    console.error('❌ Erreur catégories imbriquées:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY nom ASC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur catégories :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};

exports.listSousCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sous_categories WHERE categorie_id=$1 ORDER BY nom ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur sous-catégories :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};
exports.getCategoryById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories WHERE id=$1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '❌ Catégorie introuvable' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Erreur catégorie par ID :', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
};