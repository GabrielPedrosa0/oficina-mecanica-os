-- Dados de exemplo para começar a usar o sistema (opcional).
-- Rode depois de modelo_logico_oficina.sql, ou use: python -m database.criar_tabelas --exemplos
INSERT INTO mecanico (nome, cpf, telefone, hora_inicio_expediente, hora_fim_expediente) VALUES
    ('Rafael Lima', '12345678901', '(85) 90000-0009', '08:00', '17:00'),
    ('Joana Alves', '10987654321', '(85) 90000-0010', '09:00', '18:00');
