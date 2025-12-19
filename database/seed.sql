USE sistema_orcamento;

INSERT INTO clientes (nome, email, telefone) VALUES ('João Silva','joao@example.com','11999990000');
INSERT INTO clientes (nome, email, telefone) VALUES ('Maria Souza','maria@example.com','11988880000');

INSERT INTO estoque (nome_peca, quantidade) VALUES ('Compressor', 10), ('Filtro', 50), ('Termostato', 20);

-- Exemplo de orçamento
INSERT INTO orcamentos (cliente_id, valor_total, status, data_criacao) VALUES (1, 250.00, 'PENDENTE', NOW());
INSERT INTO orcamento_itens (orcamento_id, nome_peca, quantidade, valor_unitario) VALUES (1, 'Compressor', 1, 200.00), (1, 'Filtro', 1, 20.00);
