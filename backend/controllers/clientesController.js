const clientesModel = require('../models/clientes');

async function listar(req, res, next) {
  try {
    const [rows] = await require('../services/db').query(
      'SELECT id, nome, email, telefone FROM clientes ORDER BY nome',
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { nome, email, telefone } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ error: 'nome e email são obrigatórios' });
    }
    // evita duplicar
    const existente = await clientesModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'Cliente já cadastrado' });
    }
    const c = await clientesModel.createCliente({ nome, email, telefone });
    try {
      await require('../services/googleSheets').logClienteCreate(c);
    } catch (e) {
      console.warn('Sheets logClienteCreate:', e.message);
    }
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
}

async function detalhe(req, res, next) {
  try {
    const c = await clientesModel.findById(req.params.id);
    if (!c) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(c);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { nome, email, telefone } = req.body;
    const id = req.params.id;
    await require('../services/db').query(
      'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, email, telefone, id],
    );
    try {
      await require('../services/googleSheets').logClienteUpdate({ id, nome, email, telefone });
    } catch (e) {
      console.warn('Sheets logClienteUpdate:', e.message);
    }
    res.json({ id, nome, email, telefone });
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await require('../services/db').query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, detalhe, atualizar, remover, buscarClientePorTelefoneOuProtocolo, gerarNovoProtocolo, listarAgendamentosCliente };

// Buscar cliente por telefone ou protocolo
async function buscarClientePorTelefoneOuProtocolo(req, res, next) {
  try {
    const { query } = req.params; // pode ser telefone ou protocolo
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Informe um telefone ou protocolo' 
      });
    }

    let cliente = null;
    let agendamentos = [];
    let protocolo = null;

    // Tentar buscar por protocolo (4 dígitos numéricos)
    if (/^\d{4}$/.test(query.trim())) {
      cliente = await require('../models/clientes').buscarPorProtocolo(query.trim());
      if (cliente) {
        protocolo = cliente.protocolo;
        agendamentos = await require('../models/agendamentos').buscarPorProtocolo(query.trim());
      }
    }
    
    // Se não encontrou por protocolo, tentar por telefone
    if (!cliente) {
      const telefoneLimpo = query.replace(/\D/g, '');
      if (telefoneLimpo.length >= 10) {
        cliente = await require('../models/clientes').findByPhone(telefoneLimpo);
        if (cliente) {
          agendamentos = await require('../models/agendamentos').buscarPorTelefone(telefoneLimpo);
          protocolo = cliente.protocolo || await gerarProtocolo();
        }
      }
    }

    if (!cliente) {
      return res.status(404).json({ 
        success: false,
        error: 'Cliente não encontrado',
        protocolo: null,
        cliente: null,
        agendamentos: []
      });
    }

    res.json({
      success: true,
      protocolo: String(protocolo).padStart(4, '0'),
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone
      },
      agendamentos: agendamentos.map(a => ({
        id: a.id,
        data: a.data_agendamento,
        horario_inicio: a.horario_inicio,
        horario_fim: a.horario_fim,
        status: a.status,
        tipo_servico: a.tipo_servico || 'Não especificado'
      }))
    });
  } catch (err) {
    next(err);
  }
}

// Gerar novo protocolo para novo cliente
async function gerarNovoProtocolo(req, res, next) {
  try {
    console.log('[novo-protocolo] body:', req.body);
    const { telefone, nome, email } = req.body;

    if (!telefone || !nome || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Telefone, nome e email são obrigatórios' 
      });
    }

    // Limpar telefone
    const telefoneLimpo = String(telefone).replace(/\D/g, '');

    // Verificar se cliente já existe
    let cliente = await require('../models/clientes').findByPhone(telefoneLimpo);

    if (cliente) {
      // Cliente já existe, retornar dados com protocolo existente ou gerar novo
      const protocolo = cliente.protocolo || await gerarProtocolo();
      return res.json({
        success: true,
        protocolo: String(protocolo).padStart(4, '0'),
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone
        },
        message: 'Cliente já cadastrado'
      });
    }

    // Criar novo cliente com protocolo
    const novoProtocolo = await gerarProtocolo();
    cliente = await require('../models/clientes').create({
      nome,
      email,
      telefone: telefoneLimpo,
      protocolo: novoProtocolo
    });

    res.json({
      success: true,
      protocolo: String(novoProtocolo).padStart(4, '0'),
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone
      },
      message: 'Novo cliente criado com sucesso'
    });
  } catch (err) {
    console.error('[novo-protocolo] error:', err);
    next(err);
  }
}

// Listar agendamentos do cliente
async function listarAgendamentosCliente(req, res, next) {
  try {
    const { telefone } = req.params;
    
    if (!telefone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    const agendamentos = await require('../models/agendamentos').buscarPorTelefone(telefone);

    res.json({
      success: true,
      agendamentos: agendamentos.map(a => ({
        id: a.id,
        protocolo: a.protocolo,
        data: a.data_agendamento,
        horario_inicio: a.horario_inicio,
        horario_fim: a.horario_fim,
        status: a.status,
        tipo_servico: a.tipo_servico || 'Não especificado',
        endereco: a.endereco,
        cidade: a.cidade
      }))
    });
  } catch (err) {
    next(err);
  }
}

// Função auxiliar para gerar protocolo único
async function gerarProtocolo() {
  let protocolo;
  let existe = true;
  let tentativas = 0;
  const maxTentativas = 50;

  while (existe && tentativas < maxTentativas) {
    protocolo = Math.floor(Math.random() * 9000) + 1000; // 4 dígitos (1000-9999)
    const cliente = await require('../models/clientes').buscarPorProtocolo(String(protocolo));
    existe = !!cliente;
    tentativas++;
  }

  if (existe) {
    throw new Error('Não foi possível gerar um protocolo único após 50 tentativas');
  }

  return protocolo;
}
