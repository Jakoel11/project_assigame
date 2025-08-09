const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('🏷️ Catégories', () => {
  let categorieId = null;

  beforeAll(async () => {
    // Seed minimal si vide
    const rc = await pool.query('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
    if (rc.rows.length === 0) {
      const ins = await pool.query(`INSERT INTO categories (nom) VALUES ($1) RETURNING id`, ['Cat A']);
      categorieId = ins.rows[0].id;
      await pool.query(`INSERT INTO sous_categories (nom, categorie_id) VALUES ($1,$2)`, ['Sub A1', categorieId]);
    } else {
      categorieId = rc.rows[0].id;
      const sc = await pool.query(`SELECT 1 FROM sous_categories WHERE categorie_id=$1 LIMIT 1`, [categorieId]);
      if (sc.rows.length === 0) {
        await pool.query(`INSERT INTO sous_categories (nom, categorie_id) VALUES ($1,$2)`, ['Sub A1', categorieId]);
      }
    }
  });

  it('GET /api/categories → liste imbriquée', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // On attend une structure { id, nom, sous_categories: [] }
    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('nom');
    expect(first).toHaveProperty('sous_categories');
    expect(Array.isArray(first.sous_categories)).toBe(true);
  });

  it('GET /api/categories/:id/sous-categories → sous-cat d’une catégorie', async () => {
    const res = await request(app).get(`/api/categories/${categorieId}/sous-categories`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Doit contenir au moins 1 sous-catégorie après seed
    expect(res.body.length).toBeGreaterThan(0);
  });
});
