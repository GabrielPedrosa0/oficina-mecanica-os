-- Modelo lógico da oficina (PostgreSQL) - versão 9
-- Mudanças da v9: o status da OS ganha o valor 'CANCELADA' (o cliente recusou o orçamento).
-- Mudanças da v8: em apontamento, a coluna data_hora vira data (o mesmo nome do modelo
-- conceitual e da API) e o tipo passa a ter os 8 momentos da OS que as telas mostram.
-- Mudanças da v6: peça e serviço viram um catálogo único, a tabela item (com tipo
-- 'PECA' ou 'SERVICO'), e uma associativa só com a OS, os_itens. Saem as tabelas
-- peca, servico, os_pecas e os_servicos. A visão vw_os_total soma só os_itens.
-- os_itens tem chave própria (id_item_os) e a sua descrição. Não há chave composta
-- nem UNIQUE no par (id_os, id_item): a mesma peça pode entrar duas vezes na mesma OS.
-- O catálogo já começa com uma peça e um serviço cadastrados.
-- Mantido da v5: o endereço é feito de colunas de cliente (busca por CEP no ViaCEP).
-- Mantido da v4: quantidade é integer; nenhuma data usa fuso horário.
-- Gerado a partir do modelo conceitual (docs/modelo/modelo_conceitual_oficina.drawio).
--
-- Relação N:N do conceitual que aqui vira tabela:
--   OS N:N Item (Utiliza)       -> os_itens
-- Valor_total é calculado: não é coluna, sai da visão vw_os_total.

BEGIN;

-- ---------------------------------------------------------------
-- Cliente
-- ---------------------------------------------------------------
CREATE TABLE cliente (
    id_cliente            serial        PRIMARY KEY,
    nome                  varchar(120)  NOT NULL,
    cpf_cnpj              varchar(14),
    telefone              varchar(20)   NOT NULL,
    email                 varchar(120),
    cliente_desde         date          NOT NULL DEFAULT CURRENT_DATE,
    cep                   char(8),
    logradouro            varchar(120),
    numero                varchar(10),
    complemento           varchar(60),
    bairro                varchar(80),
    cidade                varchar(80),
    uf                    char(2),
    CONSTRAINT uq_cliente_cpf_cnpj UNIQUE (cpf_cnpj),
    CONSTRAINT uq_cliente_email    UNIQUE (email),
    CONSTRAINT ck_cliente_cpf_cnpj CHECK (cpf_cnpj ~ '^([0-9]{11}|[0-9]{14})$'),
    CONSTRAINT ck_cliente_email    CHECK (email LIKE '%_@_%'),
    CONSTRAINT ck_cliente_cep      CHECK (cep ~ '^[0-9]{8}$'),
    CONSTRAINT ck_cliente_uf       CHECK (uf ~ '^[A-Z]{2}$')
);

-- ---------------------------------------------------------------
-- Veículo (cada veículo pertence a um cliente)
-- ---------------------------------------------------------------
CREATE TABLE veiculo (
    id_veiculo  serial       PRIMARY KEY,
    id_cliente  integer      NOT NULL,
    placa       varchar(7)   NOT NULL,
    chassi      char(17),
    marca       varchar(40)  NOT NULL,
    modelo      varchar(60)  NOT NULL,
    ano         smallint,
    km_atual    integer,
    CONSTRAINT uq_veiculo_placa  UNIQUE (placa),
    CONSTRAINT uq_veiculo_chassi UNIQUE (chassi),
    -- placa antiga (ABC1234) ou Mercosul (ABC1D23)
    CONSTRAINT ck_veiculo_placa  CHECK (placa ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),
    CONSTRAINT ck_veiculo_ano    CHECK (ano BETWEEN 1900 AND 2100),
    CONSTRAINT ck_veiculo_km     CHECK (km_atual >= 0),
    CONSTRAINT fk_veiculo_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------
-- Mecânico
-- ---------------------------------------------------------------
CREATE TABLE mecanico (
    id_mecanico             serial        PRIMARY KEY,
    nome                    varchar(120)  NOT NULL,
    cpf                     char(11),
    telefone                varchar(20),
    hora_inicio_expediente  time,
    hora_fim_expediente     time,
    CONSTRAINT ck_mecanico_cpf CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT uq_mecanico_cpf UNIQUE (cpf),
    CONSTRAINT ck_mecanico_expediente CHECK (hora_fim_expediente > hora_inicio_expediente)
);

-- ---------------------------------------------------------------
-- Ordem de serviço
-- ---------------------------------------------------------------
CREATE TABLE os (
    id_os                 serial       PRIMARY KEY,
    id_veiculo            integer      NOT NULL,
    id_mecanico           integer,                     -- pode ficar "A definir"
    data_abertura         timestamp    NOT NULL DEFAULT LOCALTIMESTAMP,
    data_previsao         timestamp,
    data_conclusao        timestamp,
    status                varchar(20)  NOT NULL DEFAULT 'ORCAMENTO',
    km_entrada            integer,
    eh_garantia           boolean      NOT NULL DEFAULT false,
    problema_relatado     text,
    observacoes           text,
    orcamento_enviado_em  timestamp,
    CONSTRAINT ck_os_status CHECK (status IN
        ('ORCAMENTO', 'EM_SERVICO', 'AGUARDANDO_PECA', 'PRONTA', 'ENTREGUE', 'CANCELADA')),
    CONSTRAINT ck_os_km        CHECK (km_entrada >= 0),
    CONSTRAINT ck_os_previsao  CHECK (data_previsao  >= data_abertura),
    CONSTRAINT ck_os_conclusao CHECK (data_conclusao >= data_abertura),
    CONSTRAINT ck_os_orcamento CHECK (orcamento_enviado_em >= data_abertura),
    CONSTRAINT fk_os_veiculo FOREIGN KEY (id_veiculo)
        REFERENCES veiculo (id_veiculo) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_os_mecanico FOREIGN KEY (id_mecanico)
        REFERENCES mecanico (id_mecanico) ON UPDATE CASCADE ON DELETE SET NULL
);

-- ---------------------------------------------------------------
-- Item (catálogo único de peças e serviços) e a relação N:N com a OS (Utiliza)
-- ---------------------------------------------------------------
CREATE TABLE item (
    id_item             serial         PRIMARY KEY,
    tipo                varchar(7)     NOT NULL,   -- 'PECA' ou 'SERVICO'
    descricao           varchar(120)   NOT NULL,
    codigo              varchar(20),               -- só peça; "OLE-5W30-4L" tem 11
    preco               numeric(10,2)  NOT NULL DEFAULT 0,
    qtd_estoque         integer,                   -- só peça
    tempo_estimado_min  integer,                   -- só serviço
    CONSTRAINT ck_item_tipo      CHECK (tipo IN ('PECA', 'SERVICO')),
    CONSTRAINT uq_item_descricao UNIQUE (tipo, descricao),
    CONSTRAINT uq_item_codigo    UNIQUE (codigo),
    CONSTRAINT ck_item_preco     CHECK (preco >= 0),
    CONSTRAINT ck_item_estoque   CHECK (qtd_estoque >= 0),
    CONSTRAINT ck_item_tempo     CHECK (tempo_estimado_min > 0)
);

CREATE TABLE os_itens (
    id_item_os      serial         PRIMARY KEY,
    id_os           integer        NOT NULL,
    id_item         integer        NOT NULL,
    descricao       varchar(120)   NOT NULL,   -- o que foi feito ou usado nesta OS
    quantidade      integer        NOT NULL DEFAULT 1,
    valor_unitario  numeric(10,2)  NOT NULL,   -- preço cobrado nesta OS
    CONSTRAINT ck_os_itens_qtd   CHECK (quantidade > 0),
    CONSTRAINT ck_os_itens_valor CHECK (valor_unitario >= 0),
    CONSTRAINT fk_os_itens_os FOREIGN KEY (id_os)
        REFERENCES os (id_os) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_os_itens_item FOREIGN KEY (id_item)
        REFERENCES item (id_item) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- O catálogo começa com uma peça e um serviço cadastrados.
INSERT INTO item (id_item, tipo, descricao) VALUES
    (1, 'PECA',    'Peça'),
    (2, 'SERVICO', 'Serviço');
-- Como os ids 1 e 2 foram dados à mão, o serial passa a contar a partir do 3.
SELECT setval('item_id_item_seq', 2);

-- ---------------------------------------------------------------
-- Apontamento (a linha do tempo da OS: o que aconteceu com o carro, com data e hora)
-- ---------------------------------------------------------------
CREATE TABLE apontamento (
    id_apontamento  serial       PRIMARY KEY,
    id_os           integer      NOT NULL,
    data            timestamp    NOT NULL DEFAULT LOCALTIMESTAMP,
    tipo            varchar(20)  NOT NULL,
    descricao       text         NOT NULL,
    -- ABERTURA, ORCAMENTO e ENTREGA o sistema registra sozinho; os outros a pessoa escolhe.
    CONSTRAINT ck_apontamento_tipo CHECK (tipo IN ('ABERTURA', 'DIAGNOSTICO', 'ORCAMENTO', 'APROVACAO',
                                                   'EXECUCAO', 'PECA', 'ENTREGA', 'OBSERVACAO')),
    CONSTRAINT fk_apontamento_os FOREIGN KEY (id_os)
        REFERENCES os (id_os) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- Usuário (login do sistema; não se liga às outras tabelas)
-- ---------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario  serial        PRIMARY KEY,
    nome        varchar(120)  NOT NULL,
    email       varchar(120)  NOT NULL,
    senha_hash  varchar(255)  NOT NULL,     -- guardar só o hash, nunca a senha
    perfil      varchar(20)   NOT NULL DEFAULT 'RECEPCAO',
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_email  CHECK (email LIKE '%_@_%'),
    CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('ADMIN', 'RECEPCAO', 'MECANICO'))
);

-- ---------------------------------------------------------------
-- Índices nas chaves estrangeiras (o PostgreSQL não cria sozinho)
-- ---------------------------------------------------------------
CREATE INDEX ix_veiculo_cliente       ON veiculo (id_cliente);
CREATE INDEX ix_os_veiculo            ON os (id_veiculo);
CREATE INDEX ix_os_mecanico           ON os (id_mecanico);
CREATE INDEX ix_os_status             ON os (status);
CREATE INDEX ix_os_itens_os           ON os_itens (id_os);
CREATE INDEX ix_os_itens_item         ON os_itens (id_item);
CREATE INDEX ix_apontamento_os        ON apontamento (id_os);

-- ---------------------------------------------------------------
-- Valor total da OS (atributo calculado do conceitual)
-- ---------------------------------------------------------------
CREATE VIEW vw_os_total AS
SELECT o.id_os,
       COALESCE((SELECT sum(i.quantidade * i.valor_unitario) FROM os_itens i WHERE i.id_os = o.id_os), 0)
       AS valor_total
FROM os o;

COMMIT;
