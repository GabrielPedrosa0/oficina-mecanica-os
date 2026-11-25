-- Estoque mínimo da peça: com o estoque nesse número ou abaixo, a tela de Peças avisa
-- "estoque baixo". Só faz sentido para peça; nos serviços fica 0.
ALTER TABLE item ADD COLUMN estoque_minimo integer NOT NULL DEFAULT 0;
ALTER TABLE item ADD CONSTRAINT ck_item_estoque_minimo CHECK (estoque_minimo >= 0);
