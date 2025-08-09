// tests/images.test.js
const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

describe('📸 Gestion des images', () => {
  let jwtToken;
  let annonceId;
  
  const testUser = {
    full_name: 'Test Images',
    email: 'test.images@example.com',
    password: 'azerty123',
    phone: '+22990000002',
    birthdate: '1990-01-01',
    company_name: '',
    is_professional: false
  };

  beforeAll(async () => {
    try {
      // Supprimer l'utilisateur s'il existe déjà
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);

      // Créer utilisateur test
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      if (registerRes.statusCode !== 201) {
        throw new Error(`Échec inscription: ${JSON.stringify(registerRes.body)}`);
      }

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      if (!loginRes.body.token) {
        throw new Error(`Échec connexion: ${JSON.stringify(loginRes.body)}`);
      }

      jwtToken = loginRes.body.token;
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }

    // S'assurer que la catégorie 1 existe
    await pool.query('INSERT INTO categories(id, nom) VALUES($1, $2) ON CONFLICT DO NOTHING', [1, 'Test Category']);

    // Créer une annonce test
    const annonceRes = await request(app)
      .post('/api/annonces')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        titre: 'Test upload images',
        description: 'Annonce pour tester upload',
        prix: 100,
        categorie_id: 1,
        ville: 'Lomé'
      });
    
    if (!annonceRes.body.annonce) {
      throw new Error(`Échec création annonce: ${JSON.stringify(annonceRes.body)}`);
    }
    annonceId = annonceRes.body.annonce.id;
  });

  it('POST /api/annonces/:id/images → upload images', async () => {
    const res = await request(app)
      .post(`/api/annonces/${annonceId}/images`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .attach('images', path.join(__dirname, 'fixtures/test-image.jpg'))
      .attach('images', path.join(__dirname, 'fixtures/test-image-2.jpg'));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('images');
    expect(Array.isArray(res.body.images)).toBe(true);
    expect(res.body.images.length).toBe(2);

    for (const image of res.body.images) {
      expect(image).toHaveProperty('thumbnail');
      expect(image).toHaveProperty('medium');
      expect(image).toHaveProperty('large');
    }
  });

  it('DELETE /api/annonces/:id/images/:imageId → supprime une image', async () => {
    // D'abord récupérer la liste des images
    // Attendons un peu pour être sûr que l'image est bien enregistrée
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Récupérer l'ID de l'image depuis la base de données
    const imagesResult = await pool.query('SELECT id FROM images WHERE annonce_id = $1 LIMIT 1', [annonceId]);
    if (!imagesResult.rows[0]) {
      throw new Error('Aucune image trouvée pour l\'annonce');
    }
    const imageId = imagesResult.rows[0].id;

    const res = await request(app)
      .delete(`/api/annonces/${annonceId}/images/${imageId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('supprimée');
  });

  it('PUT /api/annonces/:id/images/order → réordonne les images', async () => {
    const res = await request(app)
      .put(`/api/annonces/${annonceId}/images/order`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        imageIds: [2, 1] // Inverser l'ordre
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('mis à jour');
  });

  // Nettoyage
  afterAll(async () => {
    await pool.query('DELETE FROM annonces WHERE titre = $1', ['Test upload images']);
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    
    // Nettoyer les fichiers uploadés en test
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const files = await fs.readdir(uploadDir);
    for (const file of files) {
      if (file.startsWith('test-')) {
        await fs.unlink(path.join(uploadDir, file));
      }
    }
  });
});
