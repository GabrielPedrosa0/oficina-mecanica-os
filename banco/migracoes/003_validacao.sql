-- Modo validação: teste de usabilidade remoto, sem moderador.
-- Estas tabelas guardam só a pesquisa. O que o participante cadastra nas tarefas (cliente,
-- veículo, OS, item) vai para as tabelas normais do sistema; o evento da chamada à API guarda
-- o id devolvido, e é por ele que a análise liga as duas coisas.

-- A prova de conceito (001_ola_mundo.sql) já cumpriu o papel: sai do banco.
DROP TABLE ola_mundo;

-- Quem manda o link para os participantes. O código vai no link: /validacao?a=CODIGO
CREATE TABLE aplicador (
    id_aplicador serial      PRIMARY KEY,
    codigo       varchar(8)  NOT NULL UNIQUE,
    nome         varchar(60) NOT NULL,
    criado_em    timestamptz NOT NULL DEFAULT now()
);

-- Uma pessoa fazendo o teste (ou uma persona, nas rodadas automáticas).
-- Nasce no "Aceito participar"; o perfil chega depois, na tela seguinte.
-- Os valores do perfil são os códigos do schema (ex.: faixa_etaria = '30_A_44').
CREATE TABLE sessao_validacao (
    id_sessao           serial       PRIMARY KEY,
    id_aplicador        integer      NOT NULL REFERENCES aplicador,
    origem              varchar(7)   NOT NULL DEFAULT 'PESSOA',
    faixa_etaria        varchar(20),
    uso_apps            varchar(20),
    sistema_gestao      varchar(20),
    relacao_oficina     varchar(20),
    familiaridade_carro varchar(20),
    habito_formularios  varchar(20),
    tipo_aparelho       varchar(10),
    largura_tela        integer,
    altura_tela         integer,
    navegador           varchar(300),
    iniciada_em         timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_sessao_origem CHECK (origem IN ('PESSOA', 'PERSONA'))
);

-- Tudo o que acontece na tela: toques, erros de formulário, troca de tela, pausas e cada
-- chamada à API (método, caminho, status e o id devolvido).
-- tarefa: 0 fora das tarefas (perfil, feedback...), 1 a 4 durante T1 a T4.
-- instante: o relógio do aparelho (dá a duração certa); recebido_em: o relógio do servidor.
CREATE TABLE evento_validacao (
    id_evento   bigserial    PRIMARY KEY,
    id_sessao   integer      NOT NULL REFERENCES sessao_validacao,
    tarefa      smallint     NOT NULL DEFAULT 0,
    tipo        varchar(20)  NOT NULL,
    tela        varchar(120),
    componente  varchar(80),
    texto       varchar(200),
    metodo      varchar(6),
    caminho     varchar(120),
    status      smallint,
    id_registro integer,
    instante    timestamptz  NOT NULL,
    recebido_em timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_evento_tarefa CHECK (tarefa BETWEEN 0 AND 4)
);

CREATE INDEX ix_evento_sessao ON evento_validacao (id_sessao, instante);

-- O questionário do fim: as 10 afirmações do SUS (1 = discordo totalmente, 5 = concordo
-- totalmente) e as duas perguntas abertas. Uma resposta por sessão.
CREATE TABLE resposta_feedback (
    id_sessao     integer     PRIMARY KEY REFERENCES sessao_validacao,
    sus_1         smallint    NOT NULL CHECK (sus_1 BETWEEN 1 AND 5),
    sus_2         smallint    NOT NULL CHECK (sus_2 BETWEEN 1 AND 5),
    sus_3         smallint    NOT NULL CHECK (sus_3 BETWEEN 1 AND 5),
    sus_4         smallint    NOT NULL CHECK (sus_4 BETWEEN 1 AND 5),
    sus_5         smallint    NOT NULL CHECK (sus_5 BETWEEN 1 AND 5),
    sus_6         smallint    NOT NULL CHECK (sus_6 BETWEEN 1 AND 5),
    sus_7         smallint    NOT NULL CHECK (sus_7 BETWEEN 1 AND 5),
    sus_8         smallint    NOT NULL CHECK (sus_8 BETWEEN 1 AND 5),
    sus_9         smallint    NOT NULL CHECK (sus_9 BETWEEN 1 AND 5),
    sus_10        smallint    NOT NULL CHECK (sus_10 BETWEEN 1 AND 5),
    mais_dificil  text,
    mudaria       text,
    respondida_em timestamptz NOT NULL DEFAULT now()
);
