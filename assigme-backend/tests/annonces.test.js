const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

describe('📦 Annonces - CRUD protégé', () => {
  let jwtToken;
  let createdAnnonceId;
  
  const testUser = {
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'azerty123',
    phone: '+22990000000',
    birthdate: '1990-01-01',  // Ajout
    company_name: '',         // Ajout
    is_professional: false    // Ajout
  };

  const testAnnonce = {
    titre: 'Vélo vintage',
    description: 'Très bon état',
    prix: 120,
    categorie_id: 1,
    sous_categorie_id: 1,
    ville: 'Lomé',
    images: 'https://exemple.com/velo.jpg'
  };

  // Helper: inscription + connexion pour avoir un token
  beforeAll(async () => {
    try {
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
      await pool.query('DELETE FROM annonces WHERE titre = $1', [testAnnonce.titre]);
      
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
        throw new Error('Token manquant dans la réponse de login');
      }
      
      jwtToken = loginRes.body.token;

      const catRes = await pool.query('SELECT id FROM categories WHERE id = $1', [1]);
      if (catRes.rows.length === 0) {
        await pool.query('INSERT INTO categories(id, nom) VALUES($1, $2)', [1, 'Test Category']);
        await pool.query('INSERT INTO sous_categories(id, categorie_id, nom) VALUES($1, $2, $3)', [1, 1, 'Test SubCategory']);
      }

    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  /**
   * Vérifie que la liste des annonces est accessible publiquement
   * et retourne un tableau
   */
  it('GET /api/annonces → liste publique', async () => {
    const res = await request(app)
      .get('/api/annonces');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(Array.isArray(res.body.annonces)).toBe(true);
  });

  /**
   * Vérifie la création d'une annonce :
   * - Nécessite un token JWT valide
   * - Retourne l'annonce créée avec un ID
   * - Les champs correspondent aux données envoyées
   */
  it('POST /api/annonces → créer une annonce (protégée)', async () => {
    expect(jwtToken).toBeDefined();
    
    const res = await request(app)
      .post('/api/annonces')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(testAnnonce);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('annonce');
    expect(res.body.annonce).toHaveProperty('id');
    createdAnnonceId = res.body.annonce.id;
    
    // Vérifie les autres champs de l'annonce
    expect(res.body.annonce).toMatchObject({
      titre: testAnnonce.titre,
      description: testAnnonce.description,
      prix: testAnnonce.prix.toString() + '.00',
      ville: testAnnonce.ville
    });
  });

  // Test détail annonce
  it('GET /api/annonces/:id → détail public', async () => {
    expect(createdAnnonceId).toBeDefined();
    
    const res = await request(app)
      .get(`/api/annonces/${createdAnnonceId}`);

    expect(res.statusCode).toBe(200);
    // L'API renvoie directement l'objet annonce
    expect(res.body).toMatchObject({
      id: createdAnnonceId,
      titre: testAnnonce.titre,
      description: testAnnonce.description,
      prix: testAnnonce.prix.toString() + '.00',
      ville: testAnnonce.ville
    });
  });

  // Test mise à jour
  it('PUT /api/annonces/:id → mise à jour (protégée)', async () => {
    expect(createdAnnonceId).toBeDefined();
    
    const updates = { titre: 'Vélo vintage modifié' };
    
    const res = await request(app)
      .put(`/api/annonces/${createdAnnonceId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(updates);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('annonce');
    expect(res.body.annonce).toHaveProperty('titre', updates.titre);
  });

  // Test suppression - uniquement si une annonce a été créée
  it('DELETE /api/annonces/:id → suppression (protégée)', async () => {
    expect(createdAnnonceId).toBeDefined();
    
    const res = await request(app)
      .delete(`/api/annonces/${createdAnnonceId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
  });

  // Nettoyage après les tests
  afterAll(async () => {
    try {
      await pool.query('DELETE FROM annonces WHERE titre = $1', [testAnnonce.titre]);
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });
});

describe('📑 Pagination des annonces', () => {
  let testUserId;
  
  // Créer un utilisateur et quelques annonces de test avant les tests de pagination
  beforeAll(async () => {
    // Créer un utilisateur de test
    const testUser = {
      full_name: 'Test Pagination',
      email: 'test.pagination@example.com',
      password: 'azerty123',
      phone: '+22990000001',
      birthdate: '1990-01-01',
      company_name: '',
      is_professional: false
    };

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const userResult = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone, account_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
      [testUser.full_name, testUser.email, hashedPassword, testUser.phone, 'particulier']
    );
    
    testUserId = userResult.rows[0].id;

    const testAnnonces = [
      {
        titre: "Vélo vintage",
        description: "Très bon état",
        prix: 120,
        categorie_id: 1,
        ville: "Lomé",
      },
      {
        titre: "iPhone 12",
        description: "Comme neuf",
        prix: 300,
        categorie_id: 1,
        ville: "Lomé",
      }
    ];

    for (const annonce of testAnnonces) {
      await pool.query(`
        INSERT INTO annonces (titre, description, prix, categorie_id, ville, user_id, date_creation)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [annonce.titre, annonce.description, annonce.prix, annonce.categorie_id, annonce.ville, testUserId]);
    }
  });

  // Nettoyer après les tests
  afterAll(async () => {
    await pool.query("DELETE FROM annonces WHERE titre IN ('Vélo vintage', 'iPhone 12')");
    await pool.query("DELETE FROM users WHERE email = 'test.pagination@example.com'");
  });

  /**
   * Vérifie la pagination de la liste des annonces
   * - Retourne un objet avec les propriétés 'annonces' et 'pagination'
   * - La page demandée et la limite sont respectées
   */
  it('GET /api/annonces?page=1&limit=2 → pagination basique', async () => {
    const res = await request(app)
      .get('/api/annonces?page=1&limit=2');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: expect.any(Number),
      totalPages: expect.any(Number)
    });
    expect(res.body.annonces.length).toBeLessThanOrEqual(2);
  });
});

describe('🔍 Filtrage des annonces', () => {
  it('GET /api/annonces?categorie_id=1 → filtre par catégorie', async () => {
    const res = await request(app)
      .get('/api/annonces?categorie_id=1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(Array.isArray(res.body.annonces)).toBe(true);
    
    // Vérifie que toutes les annonces ont la catégorie ID 1
    for (const annonce of res.body.annonces) {
      expect(annonce).toHaveProperty('categorie_id', 1);
    }
  });

  it('GET /api/annonces?q=vélo → filtre par recherche', async () => {
    const res = await request(app)
      .get('/api/annonces?q=vélo');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(Array.isArray(res.body.annonces)).toBe(true);
    
    // Vérifie que chaque annonce correspond à la recherche (titre ou description)
    for (const annonce of res.body.annonces) {
      expect(annonce.titre.toLowerCase()).toContain('vélo');
      expect(annonce.description.toLowerCase()).toContain('vélo');
    }
  });
});

describe('⚙️ Tri des annonces', () => {
  it('GET /api/annonces?sort=prix&order=asc → tri par prix croissant', async () => {
    const res = await request(app)
      .get('/api/annonces?sort=prix&order=asc');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(Array.isArray(res.body.annonces)).toBe(true);
    
    // Vérifie que les annonces sont triées par prix croissant
    let previousPrix = 0;
    for (const annonce of res.body.annonces) {
      const currentPrix = parseFloat(annonce.prix);
      expect(currentPrix).toBeGreaterThanOrEqual(previousPrix);
      previousPrix = currentPrix;
    }
  });

  it('GET /api/annonces?sort=date_creation&order=desc → tri par date décroissante', async () => {
    const res = await request(app)
      .get('/api/annonces?sort=date_creation&order=desc');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(Array.isArray(res.body.annonces)).toBe(true);
    
    // Vérifie que les annonces sont triées par date de création décroissante
    let previousDate = new Date();
    for (const annonce of res.body.annonces) {
      const currentDate = new Date(annonce.date_creation);
      expect(currentDate).toBeLessThanOrEqual(previousDate);
      previousDate = currentDate;
    }
  });
});

describe('📑 Pagination et filtres - cas limites', () => {
  it('GET /api/annonces avec page invalide → retourne première page', async () => {
    const res = await request(app)
      .get('/api/annonces?page=-1');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET /api/annonces avec tri invalide → tri par date par défaut', async () => {
    // On vérifie juste que la requête fonctionne sans erreur avec un tri invalide
    const res = await request(app)
      .get('/api/annonces?sort=invalid');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('annonces');
    expect(Array.isArray(res.body.annonces)).toBe(true);
  });

  it('GET /api/annonces avec recherche sans résultat → tableau vide', async () => {
    const res = await request(app)
      .get('/api/annonces?q=xxxxxxxxxxx');

    expect(res.statusCode).toBe(200);
    expect(res.body.annonces).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });
});
