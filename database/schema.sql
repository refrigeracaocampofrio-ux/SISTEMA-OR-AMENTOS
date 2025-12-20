-- Schema para o sistema de orçamentos, ordens de serviço e estoque
CREATE DATABASE IF NOT EXISTS sistema_orcamento DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sistema_orcamento;

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefone VARCHAR(50),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orcamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocolo VARCHAR(50) UNIQUE,
  cliente_id INT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  equipamento VARCHAR(255),
  defeito TEXT,
  validade INT DEFAULT 7,
  garantia INT DEFAULT 90,
  tecnico VARCHAR(255),
  observacoes TEXT,
  data_criacao DATETIME,
  motivo_cancelamento TEXT,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orcamento_id INT NOT NULL,
  nome_peca VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ordens_servico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocolo VARCHAR(50) UNIQUE,
  orcamento_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  data_criacao DATETIME,
  data_conclusao DATETIME,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_peca VARCHAR(255) NOT NULL UNIQUE,
  quantidade INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimentacao_estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estoque_id INT NOT NULL,
  quantidade INT NOT NULL,
  tipo ENUM('entrada','saida') NOT NULL,
  data DATETIME,
  FOREIGN KEY (estoque_id) REFERENCES estoque(id) ON DELETE CASCADE
);
