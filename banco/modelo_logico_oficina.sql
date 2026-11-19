-- Modelo lógico da oficina (PostgreSQL) - versão 4
-- Mudanças da v4: endereco ganha id próprio (id_endereco); cliente aponta para ele
-- por id_endereco; quantidade é integer em os_pecas e os_servicos; nenhuma data usa fuso horário.
-- Gerado a partir do modelo conceitual (modelo_relacional_oficina.drawio, página "Oficina · conceitual, sem especialidade")
-- e da versão em andamento model.pgerd (cliente, veiculo, os, peca, os_pecas).
--
-- Relações N:N do conceitual que aqui viram tabela:
--   OS N:N Serviço (Inclui)     -> os_servicos
--   OS N:N Peça (Utiliza)       -> os_pecas
-- Valor_total é calculado: não é coluna, sai da visão vw_os_total.

BEGIN;

-- ---------------------------------------------------------------
-- Endereço (tem id próprio; o CEP é só uma coluna comum)
-- ---------------------------------------------------------------
CREATE TABLE endereco (
    id_endereco  serial        PRIMARY KEY,
    cep          char(8)       NOT NULL,
    rua          varchar(120)  NOT NULL,
    bairro       varchar(80),
    cidade       varchar(80)   NOT NULL,
    uf           char(2)       NOT NULL,
    CONSTRAINT ck_endereco_cep CHECK (cep ~ '^[0-9]{8}$'),
    CONSTRAINT ck_endereco_uf  CHECK (uf ~ '^[A-Z]{2}$')
);

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
    id_endereco           integer,
    numero_endereco       varchar(10),
    complemento_endereco  varchar(60),
    CONSTRAINT uq_cliente_cpf_cnpj UNIQUE (cpf_cnpj),
    CONSTRAINT uq_cliente_email    UNIQUE (email),
    CONSTRAINT ck_cliente_cpf_cnpj CHECK (cpf_cnpj ~ '^([0-9]{11}|[0-9]{14})$'),
    CONSTRAINT ck_cliente_email    CHECK (email LIKE '%_@_%'),
    CONSTRAINT fk_cliente_endereco FOREIGN KEY (id_endereco)
        REFERENCES endereco (id_endereco) ON UPDATE CASCADE ON DELETE RESTRICT
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
        ('ORCAMENTO', 'EM_SERVICO', 'AGUARDANDO_PECA', 'PRONTA', 'ENTREGUE')),
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
-- Serviço (catálogo) e a relação N:N com a OS (Inclui)
-- ---------------------------------------------------------------
CREATE TABLE servico (
    id_servico          serial         PRIMARY KEY,
    descricao           varchar(120)   NOT NULL,
    preco_base          numeric(10,2)  NOT NULL DEFAULT 0,
    tempo_estimado_min  integer,
    CONSTRAINT uq_servico_descricao UNIQUE (descricao),
    CONSTRAINT ck_servico_preco CHECK (preco_base >= 0),
    CONSTRAINT ck_servico_tempo CHECK (tempo_estimado_min > 0)
);

CREATE TABLE os_servicos (
    id_os          integer        NOT NULL,
    id_servico     integer        NOT NULL,
    quantidade     integer        NOT NULL DEFAULT 1,
    valor_cobrado  numeric(10,2)  NOT NULL,
    CONSTRAINT pk_os_servicos PRIMARY KEY (id_os, id_servico),
    CONSTRAINT ck_os_servicos_qtd   CHECK (quantidade > 0),
    CONSTRAINT ck_os_servicos_valor CHECK (valor_cobrado >= 0),
    CONSTRAINT fk_os_servicos_os FOREIGN KEY (id_os)
        REFERENCES os (id_os) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_os_servicos_servico FOREIGN KEY (id_servico)
        REFERENCES servico (id_servico) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------
-- Peça (estoque) e a relação N:N com a OS (Utiliza)
-- ---------------------------------------------------------------
CREATE TABLE peca (
    id_peca      serial         PRIMARY KEY,
    codigo       varchar(20)    NOT NULL,   -- era varchar(7); "OLE-5W30-4L" tem 11
    descricao    varchar(80)    NOT NULL,
    preco_venda  numeric(10,2)  NOT NULL DEFAULT 0,
    qtd_estoque  integer        NOT NULL DEFAULT 0,
    CONSTRAINT uq_peca_codigo UNIQUE (codigo),
    CONSTRAINT ck_peca_preco   CHECK (preco_venda >= 0),
    CONSTRAINT ck_peca_estoque CHECK (qtd_estoque >= 0)
);

CREATE TABLE os_pecas (
    id_os           integer        NOT NULL,
    id_peca         integer        NOT NULL,
    quantidade      integer        NOT NULL DEFAULT 1,
    valor_unitario  numeric(10,2)  NOT NULL,
    CONSTRAINT pk_os_pecas PRIMARY KEY (id_os, id_peca),
    CONSTRAINT ck_os_pecas_qtd   CHECK (quantidade > 0),
    CONSTRAINT ck_os_pecas_valor CHECK (valor_unitario >= 0),
    CONSTRAINT fk_os_pecas_os FOREIGN KEY (id_os)
        REFERENCES os (id_os) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_os_pecas_peca FOREIGN KEY (id_peca)
        REFERENCES peca (id_peca) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------
-- Apontamento (registro de diagnóstico/execução da OS)
-- ---------------------------------------------------------------
CREATE TABLE apontamento (
    id_apontamento  serial       PRIMARY KEY,
    id_os           integer      NOT NULL,
    data_hora       timestamp    NOT NULL DEFAULT LOCALTIMESTAMP,
    tipo            varchar(20)  NOT NULL,
    descricao       text         NOT NULL,
    CONSTRAINT ck_apontamento_tipo CHECK (tipo IN ('DIAGNOSTICO', 'EXECUCAO', 'OBSERVACAO')),
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
CREATE INDEX ix_cliente_endereco      ON cliente (id_endereco);
CREATE INDEX ix_veiculo_cliente       ON veiculo (id_cliente);
CREATE INDEX ix_os_veiculo            ON os (id_veiculo);
CREATE INDEX ix_os_mecanico           ON os (id_mecanico);
CREATE INDEX ix_os_status             ON os (status);
CREATE INDEX ix_os_servicos_servico   ON os_servicos (id_servico);
CREATE INDEX ix_os_pecas_peca         ON os_pecas (id_peca);
CREATE INDEX ix_apontamento_os        ON apontamento (id_os);

-- ---------------------------------------------------------------
-- Valor total da OS (atributo calculado do conceitual)
-- ---------------------------------------------------------------
CREATE VIEW vw_os_total AS
SELECT o.id_os,
       COALESCE((SELECT sum(s.quantidade * s.valor_cobrado)  FROM os_servicos s WHERE s.id_os = o.id_os), 0)
     + COALESCE((SELECT sum(p.quantidade * p.valor_unitario) FROM os_pecas    p WHERE p.id_os = o.id_os), 0)
       AS valor_total
FROM os o;

COMMIT;
