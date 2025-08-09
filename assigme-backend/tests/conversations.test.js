// tests/conversations.test.js
const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('💬 Conversations', () => {
    let buyerToken;
    let sellerToken;
    let buyerId;
    let sellerId;
    let annonceId;
    let conversationId;

    const buyerUser = {
        full_name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'azerty123',
        phone: '+22890000001',
        birthdate: '1990-01-01',
        company_name: '',
        is_professional: false
    };

    const sellerUser = {
        full_name: 'Test Seller',
        email: 'seller@test.com',
        password: 'azerty123',
        phone: '+22890000002',
        birthdate: '1990-01-01',
        company_name: '',
        is_professional: false
    };

    const testAnnonce = {
        titre: 'Test Conversation Annonce',
        description: 'Description pour test conversations',
        prix: 1000,
        categorie_id: 1,
        ville: 'Lomé'
    };

    beforeAll(async () => {
        try {
            // Nettoyer les données de test précédentes
            await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [buyerUser.email, sellerUser.email]);
            await pool.query('DELETE FROM annonces WHERE titre = $1', [testAnnonce.titre]);

            // Créer la catégorie si nécessaire
            await pool.query('INSERT INTO categories(id, nom) VALUES($1, $2) ON CONFLICT DO NOTHING', [1, 'Test Category']);

            // Créer l'acheteur et récupérer son token
            const buyerRes = await request(app)
                .post('/api/auth/register')
                .send(buyerUser);
            buyerId = buyerRes.body.id;

            const buyerLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: buyerUser.email,
                    password: buyerUser.password
                });
            buyerToken = buyerLogin.body.token;

            // Créer le vendeur et récupérer son token
            const sellerRes = await request(app)
                .post('/api/auth/register')
                .send(sellerUser);
            sellerId = sellerRes.body.id;

            const sellerLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: sellerUser.email,
                    password: sellerUser.password
                });
            sellerToken = sellerLogin.body.token;

            // Créer l'annonce de test
            const annonceRes = await request(app)
                .post('/api/annonces')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(testAnnonce);

            annonceId = annonceRes.body.annonce.id;

        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        }
    });

    afterAll(async () => {
        try {
            await pool.query('DELETE FROM conversations WHERE annonce_id IN (SELECT id FROM annonces WHERE titre = $1)', [testAnnonce.titre]);
            await pool.query('DELETE FROM annonces WHERE titre = $1', [testAnnonce.titre]);
            await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [buyerUser.email, sellerUser.email]);
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    });

    describe('Gestion des conversations', () => {
        it('POST /api/conversations/annonce/:annonceId → démarre une conversation', async () => {
            const res = await request(app)
                .post(`/api/conversations/annonce/${annonceId}`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ message: 'Bonjour, est-ce toujours disponible ?' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('conversationId');
            conversationId = res.body.conversationId;
        });

        it('POST /api/conversations/annonce/:annonceId (doublon) → erreur conflit', async () => {
            const res = await request(app)
                .post(`/api/conversations/annonce/${annonceId}`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ message: 'Test doublon' });

            expect(res.statusCode).toBe(409);
        });

        it('GET /api/conversations → liste les conversations (acheteur)', async () => {
            const res = await request(app)
                .get('/api/conversations')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('conversations');
            expect(Array.isArray(res.body.conversations)).toBe(true);
            expect(res.body.conversations.length).toBeGreaterThan(0);
            expect(res.body.conversations[0]).toHaveProperty('annonce_titre', testAnnonce.titre);
        });

        it('GET /api/conversations → liste les conversations (vendeur)', async () => {
            const res = await request(app)
                .get('/api/conversations')
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.conversations.length).toBeGreaterThan(0);
        });

        it('GET /api/conversations/:conversationId/messages → récupère les messages', async () => {
            const res = await request(app)
                .get(`/api/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('messages');
            expect(Array.isArray(res.body.messages)).toBe(true);
            expect(res.body.messages.length).toBe(1);
        });

        it('POST /api/conversations/:conversationId/messages → envoie un message', async () => {
            const res = await request(app)
                .post(`/api/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({ content: 'Oui, toujours disponible !' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('newMessage');
            expect(res.body.newMessage.content).toBe('Oui, toujours disponible !');
        });

        it('PUT /api/conversations/:conversationId/status → archive la conversation', async () => {
            const res = await request(app)
                .put(`/api/conversations/${conversationId}/status`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ status: 'archived' });

            expect(res.statusCode).toBe(200);
            expect(res.body.conversation.status).toBe('archived');
        });
    });

    describe('Cas d\'erreur', () => {
        it('GET /api/conversations sans token → 401', async () => {
            const res = await request(app)
                .get('/api/conversations');

            expect(res.statusCode).toBe(401);
        });

        it('POST /api/conversations/annonce/999999 → 404', async () => {
            const res = await request(app)
                .post('/api/conversations/annonce/999999')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({ message: 'Test erreur' });

            expect(res.statusCode).toBe(404);
        });

        it('POST /api/conversations/:conversationId/messages sans contenu → 400', async () => {
            const res = await request(app)
                .post(`/api/conversations/${conversationId}/messages`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });
});
