const request = require('supertest');
const { expect } = require('chai');
const app = require('../backend/server');

describe('Auth', () => {
  it('should return token with correct admin credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: process.env.ADMIN_USER || 'admin',
        password: process.env.ADMIN_PASS || 'admin',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  });
  it('should reject wrong credentials', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'x', password: 'y' });
    expect(res.status).to.equal(401);
  });
});
