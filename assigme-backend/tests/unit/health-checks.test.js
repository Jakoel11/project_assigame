const request = require('supertest');
const app = require('../../index');

describe('🔧 API Health Checks', () => {
  it('should return categories list', async () => {
    const response = await request(app)
      .get('/api/categories')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should require authentication for protected routes', async () => {
    const response = await request(app)
      .get('/api/auth/profile');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('should reject invalid login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@test.com',
        mot_de_passe: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
  });
});
