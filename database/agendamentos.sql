-- Tabela de agendamentos de visitas
USE sistema_orcamento;

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  endereco TEXT NOT NULL,
  complemento VARCHAR(255),
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(10),
  data_agendamento DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  tipo_servico VARCHAR(255),
  descricao_problema TEXT,
  status ENUM('pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX idx_data_agendamento ON agendamentos(data_agendamento);
CREATE INDEX idx_status ON agendamentos(status);
CREATE INDEX idx_email ON agendamentos(email);
