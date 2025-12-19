const agendamentosModel = require('../models/agendamentos');
const clientesModel = require('../models/clientes');
const emailService = require('../services/email');

// Listar todos os agendamentos
async function listar(req, res, next) {
  try {
    const agendamentos = await agendamentosModel.listarTodos();
    res.json(agendamentos);
  } catch (err) {
    next(err);
  }
}

// Buscar agendamento por ID
async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const agendamento = await agendamentosModel.buscarPorId(id);
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json(agendamento);
  } catch (err) {
    next(err);
  }
}

// Obter horários disponíveis para uma data
async function horariosDisponiveis(req, res, next) {
  try {
    const { data } = req.params;
    const dataObj = new Date(data + 'T00:00:00');
    const diaSemana = dataObj.getDay(); // 0 = Domingo, 6 = Sábado
    
    // Definir horários base
    let horarios = [];
    
    if (diaSemana === 0) {
      // Domingo - não atende
      return res.json([]);
    } else if (diaSemana === 6) {
      // Sábado: 09:00 às 14:00 (sem almoço)
      horarios = [
        { inicio: '09:00', fim: '10:00' },
        { inicio: '10:00', fim: '11:00' },
        { inicio: '11:00', fim: '12:00' },
        { inicio: '12:00', fim: '13:00' },
        { inicio: '13:00', fim: '14:00' }
      ];
    } else {
      // Segunda a Sexta: 08:00-11:00, 13:00-17:00
      horarios = [
        { inicio: '08:00', fim: '09:00' },
        { inicio: '09:00', fim: '10:00' },
        { inicio: '10:00', fim: '11:00' },
        { inicio: '13:00', fim: '14:00' },
        { inicio: '14:00', fim: '15:00' },
        { inicio: '15:00', fim: '16:00' },
        { inicio: '16:00', fim: '17:00' }
      ];
    }
    
    // Buscar agendamentos existentes para esta data
    const agendamentosExistentes = await agendamentosModel.buscarPorData(data);
    
    // Filtrar horários disponíveis
    const horariosDisponiveis = [];
    for (const horario of horarios) {
      const disponivel = await agendamentosModel.verificarDisponibilidade(
        data, 
        horario.inicio, 
        horario.fim
      );
      
      if (disponivel) {
        horariosDisponiveis.push(horario);
      }
    }
    
    res.json(horariosDisponiveis);
  } catch (err) {
    next(err);
  }
}

// Criar novo agendamento
async function criar(req, res, next) {
  try {
    const {
      nome, email, telefone, endereco, complemento, cidade, estado, cep,
      data_agendamento, horario_inicio, horario_fim, tipo_servico, descricao_problema
    } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !email || !telefone || !endereco || !cidade || !estado) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }
    
    if (!data_agendamento || !horario_inicio || !horario_fim) {
      return res.status(400).json({ error: 'Data e horário são obrigatórios' });
    }
    
    // Verificar disponibilidade - APENAS 1 PESSOA POR HORÁRIO
    const disponivel = await agendamentosModel.verificarDisponibilidade(
      data_agendamento, 
      horario_inicio, 
      horario_fim
    );
    
    if (!disponivel) {
      return res.status(400).json({ 
        error: 'Este horário já está ocupado. Por favor, selecione outro horário disponível.',
        code: 'HORARIO_OCUPADO'
      });
    }
    
    // Criar agendamento
    const agendamentoId = await agendamentosModel.criar(req.body);
    
    // Verificar se cliente já existe pelo email
    const clienteExistente = await clientesModel.findByEmail(email);
    
    if (clienteExistente) {
      // Vincular ao cliente existente
      await agendamentosModel.vincularCliente(agendamentoId, clienteExistente.id);
    } else {
      // Criar novo cliente
      const novoCliente = await clientesModel.create({
        nome,
        email,
        telefone
      });
      
      // Vincular ao novo cliente
      await agendamentosModel.vincularCliente(agendamentoId, novoCliente.id);
    }
    
    // Enviar email de confirmação
    try {
      await enviarEmailConfirmacao(agendamentoId);
    } catch (emailErr) {
      console.warn('Erro ao enviar email de confirmação:', emailErr.message);
    }
    
    res.status(201).json({ 
      success: true, 
      id: agendamentoId,
      message: 'Agendamento criado com sucesso!' 
    });
  } catch (err) {
    next(err);
  }
}

// Atualizar agendamento
async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const agendamento = await agendamentosModel.buscarPorId(id);
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    // Se mudou data/horário, verificar disponibilidade
    if (req.body.data_agendamento || req.body.horario_inicio || req.body.horario_fim) {
      const data = req.body.data_agendamento || agendamento.data_agendamento;
      const inicio = req.body.horario_inicio || agendamento.horario_inicio;
      const fim = req.body.horario_fim || agendamento.horario_fim;
      
      const disponivel = await agendamentosModel.verificarDisponibilidade(
        data, inicio, fim, id
      );
      
      if (!disponivel) {
        return res.status(400).json({ error: 'Horário não disponível' });
      }
    }
    
    await agendamentosModel.atualizar(id, req.body);
    res.json({ success: true, message: 'Agendamento atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Atualizar status
async function atualizarStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const statusValidos = ['pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    await agendamentosModel.atualizarStatus(id, status);
    res.json({ success: true, message: 'Status atualizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Deletar agendamento
async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    const agendamento = await agendamentosModel.buscarPorId(id);
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    await agendamentosModel.deletar(id);
    res.json({ success: true, message: 'Agendamento deletado com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Função auxiliar para enviar email de confirmação
async function enviarEmailConfirmacao(agendamentoId) {
  const agendamento = await agendamentosModel.buscarPorId(agendamentoId);
  
  const dataFormatada = new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR');
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00a8e8;">Agendamento Confirmado! ❄️</h2>
      <p>Olá <strong>${agendamento.nome}</strong>,</p>
      <p>Seu agendamento foi confirmado com sucesso!</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalhes do Agendamento</h3>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Horário:</strong> ${agendamento.horario_inicio} às ${agendamento.horario_fim}</p>
        <p><strong>Endereço:</strong> ${agendamento.endereco}, ${agendamento.cidade} - ${agendamento.estado}</p>
        ${agendamento.tipo_servico ? `<p><strong>Serviço:</strong> ${agendamento.tipo_servico}</p>` : ''}
        ${agendamento.descricao_problema ? `<p><strong>Descrição:</strong> ${agendamento.descricao_problema}</p>` : ''}
      </div>
      
      <p>Em caso de dúvidas ou necessidade de reagendar, entre em contato conosco.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        RCF Assistência Técnica<br>
        Especialistas em Refrigeração
      </p>
    </div>
  `;
  
  await emailService.enviar({
    para: agendamento.email,
    assunto: `Agendamento Confirmado - ${dataFormatada}`,
    html: htmlContent
  });
}

module.exports = {
  listar,
  buscarPorId,
  horariosDisponiveis,
  criar,
  atualizar,
  atualizarStatus,
  deletar
};
