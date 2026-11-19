# Clientes gravados no PostgreSQL (tabela cliente).
# As colunas ganham apelidos (AS) para a API manter os nomes de antes: id_cliente vira "id".
from database.connection import conectar

COLUNAS = """id_cliente AS id, nome, cpf_cnpj, telefone, email, cliente_desde,
             cep, logradouro, numero, complemento, bairro, cidade, uf"""

CAMPOS = ["nome", "cpf_cnpj", "telefone", "email", "cliente_desde",
          "cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"]


# Apaga todos os dados e volta os ids para 1. Usado só nos testes.
# O CASCADE limpa junto as tabelas que dependem do cliente (veículos, OS, itens...).
def reiniciar():
    with conectar() as conexao:
        conexao.execute("TRUNCATE cliente RESTART IDENTITY CASCADE")


def listar():
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM cliente ORDER BY id_cliente").fetchall()


def buscar(id: int | None):
    if id is None:
        return None
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM cliente WHERE id_cliente = %s", (id,)).fetchone()


def buscar_por_email(email: str):
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM cliente WHERE email = %s", (email,)).fetchone()


def buscar_por_cpf_cnpj(cpf_cnpj: str):
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM cliente WHERE cpf_cnpj = %s", (cpf_cnpj,)).fetchone()


def criar(dados: dict):
    with conectar() as conexao:
        return conexao.execute(
            f"""INSERT INTO cliente (nome, cpf_cnpj, telefone, email, cliente_desde,
                                     cep, logradouro, numero, complemento, bairro, cidade, uf)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING {COLUNAS}""",
            [dados[campo] for campo in CAMPOS],
        ).fetchone()


def atualizar(id: int, dados: dict):
    with conectar() as conexao:
        return conexao.execute(
            f"""UPDATE cliente
                   SET nome = %s, cpf_cnpj = %s, telefone = %s, email = %s, cliente_desde = %s,
                       cep = %s, logradouro = %s, numero = %s, complemento = %s,
                       bairro = %s, cidade = %s, uf = %s
                 WHERE id_cliente = %s
             RETURNING {COLUNAS}""",
            [dados[campo] for campo in CAMPOS] + [id],
        ).fetchone()


def excluir(id: int):
    with conectar() as conexao:
        conexao.execute("DELETE FROM cliente WHERE id_cliente = %s", (id,))
