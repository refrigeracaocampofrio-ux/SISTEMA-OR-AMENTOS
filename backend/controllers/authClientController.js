const bcrypt = require('bcryptjs');
const clientesModel = require('../models/clientes');
const authService = require('../services/auth');

async function register(req, res, next) {
  try {
    const { nome, email, telefone, password } = req.body;
    if (!nome || !email || !password) {
      return res.status(400).json({ error: 'nome, email e password são obrigatórios' });
    }
    const existing = await clientesModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const c = await clientesModel.createCliente({ nome, email, telefone, password_hash: hash });
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
}

async function clientLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }
    const cliente = await clientesModel.findByEmail(email);
    if (!cliente || !cliente.password_hash) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const ok = await bcrypt.compare(password, cliente.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = authService.sign({ sub: cliente.id, tipo: 'cliente', email: cliente.email });
    res.json({ token, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, clientLogin };
