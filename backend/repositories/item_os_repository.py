# Itens da OS gravados no PostgreSQL: peças (tabela os_pecas) e serviços (tabela os_servicos).
# A chave de cada item é o par (OS, peça) ou (OS, serviço): a mesma peça não entra duas
# vezes na mesma OS; para mais unidades, aumente a quantidade.
# O valor total da OS sai da visão vw_os_total, não é gravado.
from database.connection import conectar

COLUNAS_PECA = """x.id_os AS ordem_id, x.id_peca AS peca_id, p.codigo, p.descricao,
                  x.quantidade, x.valor_unitario::float AS valor_unitario"""
COLUNAS_SERVICO = """x.id_os AS ordem_id, x.id_servico AS servico_id, s.descricao,
                     x.quantidade, x.valor_cobrado::float AS valor_cobrado"""


# Apaga os itens e também os catálogos de peças e serviços. Usado só nos testes.
def reiniciar():
    with conectar() as conexao:
        conexao.execute("TRUNCATE os_pecas, os_servicos, peca, servico RESTART IDENTITY CASCADE")


# --- Peças ---
def listar_pecas(ordem_id: int):
    with conectar() as conexao:
        return conexao.execute(
            f"""SELECT {COLUNAS_PECA} FROM os_pecas x JOIN peca p ON p.id_peca = x.id_peca
                 WHERE x.id_os = %s ORDER BY p.descricao""", (ordem_id,)).fetchall()


def adicionar_peca(ordem_id: int, dados: dict):
    with conectar() as conexao:
        conexao.execute(
            "INSERT INTO os_pecas (id_os, id_peca, quantidade, valor_unitario) VALUES (%s, %s, %s, %s)",
            (ordem_id, dados["peca_id"], dados["quantidade"], dados["valor_unitario"]))


def remover_peca(ordem_id: int, peca_id: int):
    with conectar() as conexao:
        conexao.execute("DELETE FROM os_pecas WHERE id_os = %s AND id_peca = %s", (ordem_id, peca_id))


# --- Serviços ---
def listar_servicos(ordem_id: int):
    with conectar() as conexao:
        return conexao.execute(
            f"""SELECT {COLUNAS_SERVICO} FROM os_servicos x JOIN servico s ON s.id_servico = x.id_servico
                 WHERE x.id_os = %s ORDER BY s.descricao""", (ordem_id,)).fetchall()


def adicionar_servico(ordem_id: int, dados: dict):
    with conectar() as conexao:
        conexao.execute(
            "INSERT INTO os_servicos (id_os, id_servico, quantidade, valor_cobrado) VALUES (%s, %s, %s, %s)",
            (ordem_id, dados["servico_id"], dados["quantidade"], dados["valor_cobrado"]))


def remover_servico(ordem_id: int, servico_id: int):
    with conectar() as conexao:
        conexao.execute("DELETE FROM os_servicos WHERE id_os = %s AND id_servico = %s", (ordem_id, servico_id))


# --- Catálogos (peca e servico) ---
def criar_peca(codigo: str, descricao: str, preco_venda: float = 0, qtd_estoque: int = 0):
    with conectar() as conexao:
        return conexao.execute(
            """INSERT INTO peca (codigo, descricao, preco_venda, qtd_estoque) VALUES (%s, %s, %s, %s)
               RETURNING id_peca AS id, codigo, descricao, preco_venda::float AS preco_venda, qtd_estoque""",
            (codigo, descricao, preco_venda, qtd_estoque)).fetchone()


def criar_servico(descricao: str, preco_base: float = 0, tempo_estimado_min: int | None = None):
    with conectar() as conexao:
        return conexao.execute(
            """INSERT INTO servico (descricao, preco_base, tempo_estimado_min) VALUES (%s, %s, %s)
               RETURNING id_servico AS id, descricao, preco_base::float AS preco_base, tempo_estimado_min""",
            (descricao, preco_base, tempo_estimado_min)).fetchone()
