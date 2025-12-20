const pool = require('../services/db');

// Listar todos os agendamentos
async function listarTodos() {
  const [rows] = await pool.query(
    `SELECT a.*, 
            CASE WHEN a.cliente_id IS NOT NULL THEN 'sim' ELSE 'nao' END as cliente_cadastrado
     FROM agendamentos a
     ORDER BY a.data_agendamento DESC, a.horario_inicio DESC`
  );
  return rows;
}

// Buscar agendamento por ID
async function buscarPorId(id) {
  const [rows] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
  return rows[0];
}

// Buscar agendamentos por data
async function buscarPorData(data) {
  const [rows] = await pool.query(
    'SELECT * FROM agendamentos WHERE data_agendamento = ? ORDER BY horario_inicio',
    [data]
  );
  return rows;
}

// Buscar agendamentos por email
async function buscarPorEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM agendamentos WHERE email = ? ORDER BY data_agendamento DESC',
    [email]
  );
  return rows;
}

// Buscar agendamentos por protocolo (4 dígitos)
async function buscarPorProtocolo(protocolo) {
  const [rows] = await pool.query(
    'SELECT * FROM agendamentos WHERE protocolo = ? ORDER BY data_agendamento DESC',
    [protocolo]
  );
  return rows;
}

// Buscar agendamentos por telefone
async function buscarPorTelefone(telefone) {
  const telefoneLimpo = String(telefone).replace(/\D/g, '');
  const [rows] = await pool.query(
    'SELECT * FROM agendamentos WHERE REPLACE(REPLACE(REPLACE(telefone, "(", ""), ")", ""), "-", "") = ? ORDER BY data_agendamento DESC',
    [telefoneLimpo]
  );
  return rows;
}

// Verificar disponibilidade de horário - APENAS 1 PESSOA POR HORÁRIO
async function verificarDisponibilidade(data, horarioInicio, horarioFim, idExcluir = null) {
  // Verifica se já existe algum agendamento que conflita com o horário solicitado
  let query = `
    SELECT COUNT(*) as count 
    FROM agendamentos 
    WHERE data_agendamento = ? 
    AND status NOT IN ('cancelado')
    AND (
      (horario_inicio = ? AND horario_fim = ?) OR
      (horario_inicio < ? AND horario_fim > ?) OR
      (horario_inicio < ? AND horario_fim > ?) OR
      (horario_inicio >= ? AND horario_fim <= ?)
    )
  `;
  
  const params = [data, horarioInicio, horarioFim, horarioFim, horarioInicio, horarioFim, horarioInicio, horarioInicio, horarioFim];
  
  if (idExcluir) {
    query += ' AND id != ?';
    params.push(idExcluir);
  }
  
  const [rows] = await pool.query(query, params);
  // Retorna true se count = 0 (disponível), false se count > 0 (ocupado)
  return rows[0].count === 0;
}

// Criar novo agendamento
async function criar(dados) {
  const {
    nome, email, telefone, endereco, complemento, cidade, estado, cep,
    data_agendamento, horario_inicio, horario_fim, tipo_servico, descricao_problema
  } = dados;
  
  const [result] = await pool.query(
    `INSERT INTO agendamentos 
     (nome, email, telefone, endereco, complemento, cidade, estado, cep,
      data_agendamento, horario_inicio, horario_fim, tipo_servico, descricao_problema, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [nome, email, telefone, endereco, complemento, cidade, estado, cep,
     data_agendamento, horario_inicio, horario_fim, tipo_servico, descricao_problema]
  );
  
  return result.insertId;
}

// Atualizar agendamento
async function atualizar(id, dados) {
  const fields = [];
  const values = [];
  
  const allowedFields = [
    'nome', 'email', 'telefone', 'endereco', 'complemento', 'cidade', 'estado', 'cep',
    'data_agendamento', 'horario_inicio', 'horario_fim', 'tipo_servico', 
    'descricao_problema', 'status', 'cliente_id'
  ];
  
  allowedFields.forEach(field => {
    if (dados[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(dados[field]);
    }
  });
  
  if (fields.length === 0) {return false;}
  
  values.push(id);
  await pool.query(
    `UPDATE agendamentos SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  
  return true;
}

// Deletar agendamento
async function deletar(id) {
  await pool.query('DELETE FROM agendamentos WHERE id = ?', [id]);
  return true;
}

// Atualizar status
async function atualizarStatus(id, status) {
  await pool.query('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id]);
  return true;
}

// Vincular cliente existente ao agendamento
async function vincularCliente(agendamentoId, clienteId) {
  await pool.query('UPDATE agendamentos SET cliente_id = ? WHERE id = ?', [clienteId, agendamentoId]);
  return true;
}

module.exports = {
  listarTodos,
  buscarPorId,
  buscarPorData,
  buscarPorEmail,
  buscarPorProtocolo,
  buscarPorTelefone,
  verificarDisponibilidade,
  criar,
  atualizar,
  deletar,
  atualizarStatus,
  vincularCliente
};
