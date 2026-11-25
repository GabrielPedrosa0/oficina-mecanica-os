-- Prova de conceito: uma tabela nova entrando pelas migrações.
CREATE TABLE ola_mundo (
    id_ola_mundo serial       PRIMARY KEY,
    mensagem     varchar(120) NOT NULL,
    criado_em    timestamptz  NOT NULL DEFAULT now()
);
