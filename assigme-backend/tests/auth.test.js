const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('🛡️ Auth routes', () => {
  let jwtToken;
  
  const newUser = {
    full_name: 'Test User',
    company_name: '',
    birthdate: '1990-01-01',
    phone: '+22990000000',
    email: 'test@example.com',
    password: 'azerty123'
  };

  // Test inscription
  it('POST /api/auth/register → doit s\'inscrire', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Inscription réussie ✅');
  });

  // Test doublon
  it('POST /api/auth/register (doublon) → 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'Cet email est déjà inscrit ❌');
  });

  // Test login
  it('POST /api/auth/login → doit se connecter et renvoyer un token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: newUser.email,
        password: newUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    jwtToken = res.body.token;
  });

  // Test rate limit
  it('Rate-limit sur /login → après 5 tentatives échouées, code 429', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: newUser.email, password: 'wrongpass' });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: 'wrongpass' });

    expect(res.statusCode).toBe(429);
    expect(res.body).toHaveProperty('message');
  });

  // Test profil protégé
  it('GET /api/auth/profile → accès protégé avec token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', newUser.email);
  });
});