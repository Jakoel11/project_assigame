// tests/favoris.test.js
const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('❤️ Favoris', () => {
  let jwtToken;
  let testUserId;
  let testAnnonceId;

  const testUser = {
    full_name: 'Test Favoris',
    email: 'test.favoris@example.com',
    password: 'azerty123',
    phone: '+22990000003',
    birthdate: '1990-01-01',
    company_name: '',
    is_professional: false
  };

  const testAnnonce = {
    titre: 'Annonce test favoris',
    description: 'Description test',
    prix: 100,
    categorie_id: 1,
    ville: 'Lomé'
  };

  beforeAll(async () => {
    try {
      // Nettoyer les données de test précédentes
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
      await pool.query('DELETE FROM annonces WHERE titre = $1', [testAnnonce.titre]);
      
      // Créer un utilisateur de test
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      if (registerRes.statusCode !== 201) {
        throw new Error(`Échec inscription: ${JSON.stringify(registerRes.body)}`);
      }

      testUserId = registerRes.body.id;

      // Se connecter pour avoir le token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      if (!loginRes.body.token) {
        throw new Error('Token manquant');
      }

      jwtToken = loginRes.body.token;

      // Créer une catégorie de test si elle n'existe pas
      await pool.query(
        'INSERT INTO categories(id, nom) VALUES($1, $2) ON CONFLICT DO NOTHING',
        [1, 'Test Category']
      );

      // Créer une annonce de test
      const annonceRes = await request(app)
        .post('/api/annonces')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(testAnnonce);

      if (!annonceRes.body.annonce) {
        throw new Error(`Échec création annonce: ${JSON.stringify(annonceRes.body)}`);
      }

      testAnnonceId = annonceRes.body.annonce.id;

    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM favoris WHERE user_id = $1', [testUserId]);
      await pool.query('DELETE FROM annonces WHERE titre = $1', [testAnnonce.titre]);
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('Gestion des favoris', () => {
    it('POST /api/favoris/:annonceId → ajoute un favori', async () => {
      const res = await request(app)
        .post(`/api/favoris/${testAnnonceId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', '✅ Ajouté aux favoris');
    });

    it('POST /api/favoris/:annonceId (doublon) → erreur conflit', async () => {
      const res = await request(app)
        .post(`/api/favoris/${testAnnonceId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('déjà dans vos favoris');
    });

    it('GET /api/favoris → liste les favoris', async () => {
      const res = await request(app)
        .get('/api/favoris')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('favoris');
      expect(Array.isArray(res.body.favoris)).toBe(true);
      expect(res.body.favoris.length).toBeGreaterThan(0);
      expect(res.body.favoris[0]).toHaveProperty('titre', testAnnonce.titre);
    });

    it('GET /api/favoris/:annonceId/check → vérifie si en favori', async () => {
      const res = await request(app)
        .get(`/api/favoris/${testAnnonceId}/check`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isFavorite', true);
    });

    it('DELETE /api/favoris/:annonceId → retire des favoris', async () => {
      const res = await request(app)
        .delete(`/api/favoris/${testAnnonceId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Retiré des favoris');
    });

    it('GET /api/favoris après suppression → liste vide', async () => {
      const res = await request(app)
        .get('/api/favoris')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.favoris).toHaveLength(0);
    });
  });

  describe('Cas d\'erreur', () => {
    it('GET /api/favoris sans token → 401', async () => {
      const res = await request(app)
        .get('/api/favoris');

      expect(res.statusCode).toBe(401);
    });

    it('POST /api/favoris/:annonceId avec ID invalide → 404', async () => {
      const res = await request(app)
        .post('/api/favoris/999999')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
