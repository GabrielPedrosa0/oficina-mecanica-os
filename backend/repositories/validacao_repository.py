# As tabelas do modo validação (criadas por banco/migracoes/003_validacao.sql).
from database.connection import consultar, executar
from database.tabela import Tabela

aplicadores = Tabela("aplicador", "id_aplicador", {"codigo": "codigo", "nome": "nome", "criado_em": "criado_em"})

sessoes = Tabela("sessao_validacao", "id_sessao", {
    "aplicador_id": "id_aplicador", "origem": "origem",
    "faixa_etaria": "faixa_etaria", "uso_apps": "uso_apps", "sistema_gestao": "sistema_gestao",
    "relacao_oficina": "relacao_oficina", "familiaridade_carro": "familiaridade_carro",
    "habito_formularios": "habito_formularios",
    "tipo_aparelho": "tipo_aparelho", "largura_tela": "largura_tela", "altura_tela": "altura_tela",
    "navegador": "navegador", "iniciada_em": "iniciada_em",
})

# A chave da resposta é a própria sessão (uma resposta por sessão).
respostas = Tabela("resposta_feedback", "id_sessao", {
    "sessao_id": "id_sessao", **{f"sus_{n}": f"sus_{n}" for n in range(1, 11)},
    "mais_dificil": "mais_dificil", "mudaria": "mudaria", "respondida_em": "respondida_em",
})

# Colunas do evento_validacao, na ordem do INSERT.
COLUNAS_EVENTO = ["id_sessao", "tarefa", "tipo", "tela", "componente", "texto", "metodo", "caminho", "status",
                  "id_registro", "instante"]


# Só para os testes: apaga tudo da validação.
def reiniciar():
    executar("TRUNCATE aplicador, sessao_validacao, evento_validacao, resposta_feedback RESTART IDENTITY")


def criar_aplicador(dados: dict):
    return aplicadores.criar(dados)


def buscar_aplicador_por_codigo(codigo: str):
    return aplicadores.buscar_por("codigo = %s", (codigo,))


def criar_sessao(dados: dict):
    return sessoes.criar(dados)


def buscar_sessao(id: int):
    return sessoes.buscar(id)


def atualizar_sessao(id: int, dados: dict):
    return sessoes.atualizar(id, dados)


# Grava o lote inteiro num INSERT só: INSERT ... VALUES (%s, ...), (%s, ...), ...
# Cada evento é um dicionário com as chaves de COLUNAS_EVENTO.
def criar_eventos(eventos: list[dict]):
    if not eventos:
        return 0
    linha = "(" + ", ".join(["%s"] * len(COLUNAS_EVENTO)) + ")"
    sql = (f"INSERT INTO evento_validacao ({', '.join(COLUNAS_EVENTO)}) VALUES "
           + ", ".join([linha] * len(eventos)))
    valores = [evento[coluna] for evento in eventos for coluna in COLUNAS_EVENTO]
    return executar(sql, valores)


def criar_resposta(dados: dict):
    return respostas.criar(dados)


def buscar_resposta(sessao_id: int):
    return respostas.buscar(sessao_id)


# Uma linha por sessão, com o nome do aplicador e as respostas do feedback (vazias se a pessoa
# não chegou ao fim).
def listar_sessoes_com_feedback():
    colunas_sus = ", ".join(f"r.sus_{n}" for n in range(1, 11))
    return consultar(f"""
        SELECT s.id_sessao AS sessao, a.codigo AS aplicador_codigo, a.nome AS aplicador, s.origem,
               s.faixa_etaria, s.uso_apps, s.sistema_gestao, s.relacao_oficina, s.familiaridade_carro,
               s.habito_formularios, s.tipo_aparelho, s.largura_tela, s.altura_tela, s.navegador,
               s.iniciada_em, {colunas_sus}, r.mais_dificil, r.mudaria, r.respondida_em
          FROM sessao_validacao s
          JOIN aplicador a ON a.id_aplicador = s.id_aplicador
          LEFT JOIN resposta_feedback r ON r.id_sessao = s.id_sessao
         ORDER BY s.id_sessao""")


def listar_eventos():
    return consultar(f"""
        SELECT id_evento, {', '.join(COLUNAS_EVENTO)}, recebido_em
          FROM evento_validacao
         ORDER BY id_sessao, instante, id_evento""")
