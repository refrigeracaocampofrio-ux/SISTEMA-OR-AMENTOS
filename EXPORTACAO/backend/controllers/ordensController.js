const ordensModel = require('../models/ordens');
const orcamentosModel = require('../models/orcamentos');
const clientesModel = require('../models/clientes');
const emailer = require('../services/email');
const { gerarPDFOrdemServico } = require('../services/pdfGenerator');

async function atualizarStatus(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status obrigatório' });
  }
  try {
    const ordem = await ordensModel.findById(id);
    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }
    await ordensModel.updateStatus(id, status);
    if (status === 'CONCLUIDO' || status === 'CONCLUIDO') {
      const orc = await orcamentosModel.findById(ordem.orcamento_id);
      const cliente = await clientesModel.findById(orc.cliente_id);
      try {
        if (cliente?.email) {
          await emailer.sendMail({
            to: cliente.email,
            subject: 'Ordem concluída',
            html: `<p>Ordem #${id} concluída. Garantia: 90 dias. Formas de pagamento: cartão, pix, dinheiro.</p>`,
            userEmail: req.user?.email || undefined,
          });
        }
      } catch (e) {
        console.warn(e.message);
      }
    }
    res.json({ id, status });
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const ordens = await ordensModel.listAll();
    const lista = [];
    for (const o of ordens) {
      const orc = await orcamentosModel.findById(o.orcamento_id);
      const cliente = await clientesModel.findById(orc.cliente_id);
      lista.push({ ...o, orcamento: orc, cliente });
    }
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

async function gerarPDFOrdemController(req, res, next) {
  try {
    const { id } = req.params;
    const ordem = await ordensModel.findById(id);
    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }
    const orc = await orcamentosModel.findById(ordem.orcamento_id);
    const cliente = await clientesModel.findById(orc.cliente_id);
    
    const ordemCompleta = { ...ordem, equipamento: orc.equipamento };
    const pdfBuffer = await gerarPDFOrdemServico(ordemCompleta, cliente);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OS-${ordem.protocolo || ordem.id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

async function enviarPDFOrdemController(req, res, next) {
  try {
    const { id } = req.params;
    const ordem = await ordensModel.findById(id);
    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }
    const orc = await orcamentosModel.findById(ordem.orcamento_id);
    const cliente = await clientesModel.findById(orc.cliente_id);
    
    if (!cliente || !cliente.email) {
      return res.status(400).json({ error: 'Cliente sem email cadastrado' });
    }
    
    const ordemCompleta = { ...ordem, equipamento: orc.equipamento };
    const pdfBuffer = await gerarPDFOrdemServico(ordemCompleta, cliente);
    
    await emailer.sendMail({
      to: cliente.email,
      subject: `Ordem de Serviço ${ordem.protocolo || ordem.id} - Refrigeração Campo Frio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #27ae60; color: white; padding: 20px; text-align: center;">
            <h1>Refrigeração Campo Frio</h1>
            <p>Ordem de Serviço</p>
          </div>
          <div style="padding: 20px; background: white;">
            <p>Prezado(a) ${cliente.nome},</p>
            <p>Segue em anexo a ordem de serviço em formato PDF.</p>
            <p><strong>Protocolo:</strong> ${ordem.protocolo || ordem.id}</p>
            <p><strong>Status:</strong> ${ordem.status}</p>
            <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipe Refrigeração Campo Frio</strong></p>
          </div>
          <div style="padding: 15px; background: #f0f0f0; text-align: center; font-size: 12px; color: #666;">
            <p>AVENIDA ANTONIO DI GIOIA 50 JARDIM CALIFORNIA CAMPO LIMPO PAULISTA</p>
            <p>CNPJ: 44.334.358/0001-26 | Tel: (11) 98016-3597</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `OS-${ordem.protocolo || ordem.id}.pdf`,
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

async function deletarOrdemController(req, res, next) {
  try {
    const { id } = req.params;
    const ordem = await ordensModel.findById(id);
    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }
    
    // Deletar ordem
    await require('../services/db').query('DELETE FROM ordens_servico WHERE id = ?', [id]);
    
    console.log('🗑️ Ordem de serviço deletada:', ordem.protocolo || id);
    res.json({ success: true, message: 'Ordem de serviço excluída com sucesso' });
  } catch (err) {
    next(err);
  }
}

module.exports = { atualizarStatus, listar, gerarPDFOrdem: gerarPDFOrdemController, enviarPDFOrdem: enviarPDFOrdemController, deletarOrdem: deletarOrdemController };
