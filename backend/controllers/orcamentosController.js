const clientesModel = require('../models/clientes');
const orcamentosModel = require('../models/orcamentos');
const itensModel = require('../models/orcamentoItens');
const estoqueModel = require('../models/estoque');
const ordensModel = require('../models/ordens');
const emailer = require('../services/email');
const { gerarTemplateOrcamento, gerarTemplateOSAberta, gerarTemplateCancelamento } = require('../services/emailTemplates');
const { gerarPDFOrcamento } = require('../services/pdfGenerator');
const pool = require('../services/db');

async function criarOrcamento(req, res, next) {
  const {
    cliente,
    itens = [],
    mao_obra = 0,
    equipamento,
    defeito,
    validade,
    garantia,
    tecnico,
    observacoes,
    valor_total,
  } = req.body;
  if (!cliente || (!cliente.id && !cliente.email)) {
    return res.status(400).json({ error: 'Dados do cliente são obrigatórios' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let clienteId = cliente.id;
    if (!clienteId) {
      // Verifica se cliente já existe por email
      const existente = await clientesModel.findByEmail(cliente.email);
      if (existente) {
        clienteId = existente.id;
      } else {
        const created = await clientesModel.createCliente({
          nome: cliente.nome || 'Cliente',
          email: cliente.email,
          telefone: cliente.telefone || null,
        });
        clienteId = created.id;
      }
    }
    const itensNormalizados = Array.isArray(itens) ? itens : [];
    const maoObraValor = Number(mao_obra || 0);
    const totalItens = itensNormalizados.reduce(
      (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
      0,
    );

    const totalCalculado = maoObraValor + totalItens;
    const total = itensNormalizados.length > 0 || maoObraValor ? totalCalculado : Number(valor_total || 0);

    const orc = await orcamentosModel.createOrcamento({
      cliente_id: clienteId,
      valor_total: total,
      status: 'PENDENTE',
      equipamento,
      defeito,
      validade,
      garantia,
      tecnico,
      observacoes,
    });
    for (const it of itensNormalizados) {
      await itensModel.insertItem({
        orcamento_id: orc.id,
        nome_peca: it.nome_peca,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
      });
    }
    await conn.commit();
    
    // Recuperar orçamento completo com todos os dados
    const orcamentoBase = await orcamentosModel.findById(orc.id);
    const itensDoOrcamento = await itensModel.listByOrcamento(orc.id);
    const totalItensSalvos = itensDoOrcamento.reduce(
      (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
      0,
    );
    const maoObraCalculada = totalItensSalvos > 0 ? Math.max(Number(orcamentoBase.valor_total || 0) - totalItensSalvos, 0) : maoObraValor;
    const orcamentoCompleto = { ...orcamentoBase, itens: itensDoOrcamento, mao_obra: maoObraCalculada, valor_total: orcamentoBase.valor_total };
    
    // enviar e-mail
    let emailEnviado = false;
    try {
      const clienteData = await clientesModel.findById(clienteId);
      const htmlTemplate = gerarTemplateOrcamento(orcamentoCompleto, clienteData || cliente);
      await emailer.sendMail({
        to: cliente.email,
        subject: `Novo Orçamento - ${orc.protocolo} - Refrigeração Campo Frio`,
        html: htmlTemplate,
        userEmail: req.user?.email || undefined,
      });
      emailEnviado = true;
      console.log('✅ Email de orçamento enviado para:', cliente.email);
    } catch (e) {
      console.warn('⚠️ Erro ao enviar e-mail:', e.message);
    }
    try {
      await require('../services/googleSheets').logOrcamentoCreate({
        id: orc.id,
        protocolo: orc.protocolo,
        cliente_id: clienteId,
        valor_total: total,
        status: 'PENDENTE',
        equipamento,
        tecnico,
        data_criacao: orcamentoCompleto.data_criacao
      });
    } catch (e) {
      console.warn('Sheets logOrcamentoCreate:', e.message);
    }
    res
      .status(201)
      .json({ id: orc.id, protocolo: orc.protocolo, cliente_id: clienteId, valor_total: total, mao_obra: maoObraCalculada, status: 'PENDENTE', emailEnviado });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

async function atualizarStatus(req, res, next) {
  const { id } = req.params;
  const { status, motivo } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const orc = await orcamentosModel.findById(id);
    if (!orc) {
      await conn.rollback();
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    if (status === 'CANCELADO') {
      if (!motivo) {
        await conn.rollback();
        return res.status(400).json({ error: 'Motivo obrigatório' });
      }
      await orcamentosModel.updateStatus(id, 'CANCELADO', motivo);
      const cliente = await clientesModel.findById(orc.cliente_id);
      try {
        if (cliente?.email) {
          const htmlTemplate = gerarTemplateCancelamento(orc, cliente, motivo);
          await emailer.sendMail({
            to: cliente.email,
            subject: `Orçamento Cancelado - ${orc.protocolo} - Refrigeração Campo Frio`,
            html: htmlTemplate,
            userEmail: req.user?.email || undefined,
          });
        }
      } catch (e) {
        console.warn(e.message);
      }
      await conn.commit();
      return res.json({ id, status: 'CANCELADO' });
    }
    if (status === 'APROVADO') {
      const itens = await itensModel.listByOrcamento(id);
      // verificar estoque
      for (const it of itens) {
        if (!it.nome_peca || it.nome_peca.toLowerCase() === 'mão de obra') {
          continue; // mão de obra não consome estoque
        }
        const p = await estoqueModel.findByName(it.nome_peca);
        if (!p || p.quantidade < it.quantidade) {
          await conn.rollback();
          return res.status(400).json({ error: `Estoque insuficiente: ${it.nome_peca}` });
        }
      }
      // dar baixa
      for (const it of itens) {
        if (!it.nome_peca || it.nome_peca.toLowerCase() === 'mão de obra') {
          continue;
        }
        const p = await estoqueModel.findByName(it.nome_peca);
        if (p) {
          await estoqueModel.updateQuantity(p.id, it.quantidade, 'saida');
          console.log(`✅ Baixa no estoque: ${it.nome_peca} - Qtd: ${it.quantidade}`);
        }
      }
      await orcamentosModel.updateStatus(id, 'APROVADO');
      const ord = await ordensModel.createOrdem({ orcamento_id: id, status: 'EM ANDAMENTO' });
      // Enrich ordem with orçamento details for email template
      const ordDetalhada = {
        ...ord,
        equipamento: orc.equipamento,
        defeito: orc.defeito,
        valor_total: orc.valor_total,
        observacoes: orc.observacoes,
        validade: orc.validade,
        garantia: orc.garantia,
        data_criacao: ord.data_criacao || orc.data_criacao,
      };
      const cliente = await clientesModel.findById(orc.cliente_id);
      try {
        if (cliente?.email) {
          const htmlTemplate = gerarTemplateOSAberta(ordDetalhada, cliente);
          await emailer.sendMail({
            to: cliente.email,
            subject: `Ordem de Serviço Criada - ${ord.protocolo || '#' + ord.id} - Refrigeração Campo Frio`,
            html: htmlTemplate,
            userEmail: req.user?.email || undefined,
          });
        }
      } catch (e) {
        console.warn(e.message);
      }
      try {
        await require('../services/googleSheets').logOrdemCreate({
          id: ord.id,
          protocolo: ord.protocolo,
          orcamento_id: id,
          status: 'EM ANDAMENTO',
          data_criacao: ord.data_criacao
        });
      } catch (e) {
        console.warn('Sheets logOrdemCreate:', e.message);
      }
      await conn.commit();
      return res.json({ id, status: 'APROVADO', ordem_id: ord.id });
    }
    await orcamentosModel.updateStatus(id, status);
    try {
      await require('../services/googleSheets').logOrcamentoStatus(id, status);
    } catch (e) {
      console.warn('Sheets logOrcamentoStatus:', e.message);
    }
    await conn.commit();
    res.json({ id, status });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

async function listar(req, res, next) {
  try {
    const orcamentos = await orcamentosModel.listAll();
    const lista = [];
    for (const o of orcamentos) {
      const cliente = await clientesModel.findById(o.cliente_id);
      const itens = await itensModel.listByOrcamento(o.id);
      const totalItens = itens.reduce(
        (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
        0,
      );
      const maoObraValor = Math.max(Number(o.valor_total || 0) - totalItens, 0);
      lista.push({ ...o, cliente, itens, mao_obra: maoObraValor });
    }
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

async function detalhe(req, res, next) {
  try {
    const { id } = req.params;
    const o = await orcamentosModel.findById(id);
    if (!o) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    const cliente = await clientesModel.findById(o.cliente_id);
    const itens = await itensModel.listByOrcamento(id);
    const totalItens = itens.reduce(
      (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
      0,
    );
    const maoObraValor = Math.max(Number(o.valor_total || 0) - totalItens, 0);
    res.json({ ...o, cliente, itens, mao_obra: maoObraValor });
  } catch (err) {
    next(err);
  }
}

async function gerarPDFOrcamentoController(req, res, next) {
  try {
    const { id } = req.params;
    const o = await orcamentosModel.findById(id);
    if (!o) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    const cliente = await clientesModel.findById(o.cliente_id);
    const itens = await itensModel.listByOrcamento(id);
    const totalItens = itens.reduce(
      (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
      0,
    );
    const maoObraValor = Math.max(Number(o.valor_total || 0) - totalItens, 0);
    const orcamentoCompleto = { ...o, mao_obra: maoObraValor };
    
    const pdfBuffer = await gerarPDFOrcamento(orcamentoCompleto, cliente, itens);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Orcamento-${o.protocolo || o.id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

async function enviarPDFOrcamentoController(req, res, next) {
  try {
    const { id } = req.params;
    const o = await orcamentosModel.findById(id);
    if (!o) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    const cliente = await clientesModel.findById(o.cliente_id);
    if (!cliente || !cliente.email) {
      return res.status(400).json({ error: 'Cliente sem email cadastrado' });
    }
    
    const itens = await itensModel.listByOrcamento(id);
    const totalItens = itens.reduce(
      (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
      0,
    );
    const maoObraValor = Math.max(Number(o.valor_total || 0) - totalItens, 0);
    const orcamentoCompleto = { ...o, mao_obra: maoObraValor, itens };
    
    // Gerar PDF
    const pdfBuffer = await gerarPDFOrcamento(orcamentoCompleto, cliente, itens);
    
    // Usar o template HTML completo do email
    const htmlTemplate = gerarTemplateOrcamento(orcamentoCompleto, cliente);
    
    await emailer.sendMail({
      to: cliente.email,
      subject: `Orçamento ${o.protocolo || o.id} - Refrigeração Campo Frio (PDF Anexo)`,
      html: htmlTemplate,
      attachments: [
        {
          filename: `Orcamento-${o.protocolo || o.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ],
      userEmail: req.user?.email || undefined,
    });
    
    res.json({ success: true, message: 'PDF enviado com sucesso para ' + cliente.email });
  } catch (err) {
    next(err);
  }
}

async function deletarOrcamentoController(req, res, next) {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const orc = await orcamentosModel.findById(id);
    if (!orc) {
      await conn.rollback();
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    // Verificar se existe ordem de serviço vinculada
    const [ordens] = await conn.query('SELECT id FROM ordens_servico WHERE orcamento_id = ?', [id]);
    if (ordens.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Não é possível excluir orçamento com ordem de serviço vinculada' });
    }
    
    // Deletar itens do orçamento primeiro
    await conn.query('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [id]);
    
    // Deletar orçamento
    await conn.query('DELETE FROM orcamentos WHERE id = ?', [id]);
    
    await conn.commit();
    console.log('🗑️ Orçamento deletado:', orc.protocolo || id);
    res.json({ success: true, message: 'Orçamento excluído com sucesso' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

module.exports = { criarOrcamento, atualizarStatus, listar, detalhe, gerarPDFOrcamento: gerarPDFOrcamentoController, enviarPDFOrcamento: enviarPDFOrcamentoController, deletarOrcamento: deletarOrcamentoController };
