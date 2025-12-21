const orcamentosModel = require('../models/orcamentos');
const ordensModel = require('../models/ordens');

function parseNumero(valor) {
  const n = parseFloat(valor);
  return Number.isFinite(n) ? n : 0;
}

async function mensal(req, res, next) {
  try {
    const { mes, ano } = req.query;
    if (!mes || !ano) {
      return res.status(400).json({ error: 'Informe mes e ano' });
    }

    const orcamentos = await orcamentosModel.listAll();
    const ordens = await ordensModel.listAll();

    const filtroMes = (d) => {
      const dt = new Date(d);
      return dt.getMonth() + 1 === Number(mes) && dt.getFullYear() === Number(ano);
    };

    const orcamentosFiltrados = orcamentos.filter(o => o.data_criacao && filtroMes(o.data_criacao));
    const ordensFiltradas = ordens.filter(o => o.data_criacao && filtroMes(o.data_criacao));

    const totalOrc = orcamentosFiltrados.length;
    const totalOS = ordensFiltradas.length;
    const valorOrc = orcamentosFiltrados.reduce((s, o) => s + parseNumero(o.valor_total || o.valor), 0);

    res.json({
      mes: Number(mes),
      ano: Number(ano),
      totalOrcamentos: totalOrc,
      totalOrdens: totalOS,
      valorOrcamentos: valorOrc,
      resumoStatus: {
        orcamentos: agruparPorStatus(orcamentosFiltrados, 'status'),
        ordens: agruparPorStatus(ordensFiltradas, 'status')
      }
    });
  } catch (err) {
    next(err);
  }
}

async function financeiro(req, res, next) {
  try {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Informe data_inicio e data_fim' });
    }

    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    const dentro = (d) => {
      const dt = new Date(d);
      return dt >= inicio && dt <= fim;
    };

    const orcamentos = await orcamentosModel.listAll();
    const ordens = await ordensModel.listAll();

    const orcamentosFiltrados = orcamentos.filter(o => o.data_criacao && dentro(o.data_criacao));
    const ordensFiltradas = ordens.filter(o => o.data_criacao && dentro(o.data_criacao));

    const valorOrc = orcamentosFiltrados.reduce((s, o) => s + parseNumero(o.valor_total || o.valor), 0);

    res.json({
      inicio: data_inicio,
      fim: data_fim,
      totalOrcamentos: orcamentosFiltrados.length,
      totalOrdens: ordensFiltradas.length,
      valorOrcamentos: valorOrc,
      resumoStatus: {
        orcamentos: agruparPorStatus(orcamentosFiltrados, 'status'),
        ordens: agruparPorStatus(ordensFiltradas, 'status')
      }
    });
  } catch (err) {
    next(err);
  }
}

function agruparPorStatus(lista, campo) {
  return lista.reduce((acc, item) => {
    const key = item[campo] || 'desconhecido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

module.exports = { mensal, financeiro };