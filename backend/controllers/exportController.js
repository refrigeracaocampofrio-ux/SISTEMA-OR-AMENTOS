const clientesModel = require('../models/clientes');
const orcamentosModel = require('../models/orcamentos');
const ordensModel = require('../models/ordens');

function toCSV(rows, headers) {
  const headerLine = headers.join(',');
  const dataLines = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
  return [headerLine, ...dataLines].join('\n');
}

async function csv(req, res, next) {
  try {
    const [clientes, orcamentos, ordens] = await Promise.all([
      clientesModel.listar(),
      orcamentosModel.listAll(),
      ordensModel.listAll(),
    ]);

    const blocoClientes = toCSV(clientes, Object.keys(clientes[0] || { nome: '', email: '', telefone: '' }));
    const blocoOrc = toCSV(orcamentos, Object.keys(orcamentos[0] || { protocolo: '', valor_total: '', status: '' }));
    const blocoOS = toCSV(ordens, Object.keys(ordens[0] || { protocolo: '', status: '' }));

    const conteudo = ['# Clientes', blocoClientes, '\n# Orcamentos', blocoOrc, '\n# Ordens', blocoOS].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dados-sistema.csv"');
    res.send(conteudo);
  } catch (err) {
    next(err);
  }
}

async function excel(req, res, next) {
  // Para simplificar, entregar CSV com mime de planilha
  return csv(req, res, next);
}

async function pdf(req, res) {
  res.status(501).json({ error: 'PDF não implementado ainda' });
}

module.exports = { csv, excel, pdf };