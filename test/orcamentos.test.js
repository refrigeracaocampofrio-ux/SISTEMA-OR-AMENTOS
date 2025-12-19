const request = require('supertest');
const { expect } = require('chai');
const app = require('../backend/server');

describe('Orçamentos', () => {
  it('should create an orcamento', async () => {
    // generate unique email to avoid duplicate key issues
    const unique = Date.now() + Math.floor(Math.random() * 1000);
    const email = `testeapi+${unique}@example.com`;
    const payload = {
      cliente: { nome: 'Teste API', email },
      itens: [{ nome_peca: 'Filtro', quantidade: 1, valor_unitario: 10 }],
      mao_obra: 5,
    };
    const res = await request(app).post('/orcamentos').send(payload);
    expect([201, 200]).to.include(res.status);
    expect(res.body).to.have.property('id');
  }).timeout(5000);
});
