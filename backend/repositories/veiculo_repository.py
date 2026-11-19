# Veículos gravados no PostgreSQL (tabela veiculo).
# Apelidos para a API: id_veiculo vira "id", km_atual vira "quilometragem"
# e id_cliente vira "cliente_id".
from database.connection import conectar

COLUNAS = """id_veiculo AS id, placa, chassi, marca, modelo, ano,
             km_atual AS quilometragem, id_cliente AS cliente_id"""


def reiniciar():
    with conectar() as conexao:
        conexao.execute("TRUNCATE veiculo RESTART IDENTITY CASCADE")


def listar():
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM veiculo ORDER BY id_veiculo").fetchall()


def buscar(id: int | None):
    if id is None:
        return None
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM veiculo WHERE id_veiculo = %s", (id,)).fetchone()


# Veículos cuja placa contém o texto buscado (para GET /api/veiculos?placa=).
# "qrs-4f" acha QRS4F21: tiramos tudo que não é letra ou número e passamos para maiúsculas.
def listar_por_placa(placa: str):
    busca = "".join(c for c in placa.upper() if c.isalnum())
    if busca == "":
        return []
    with conectar() as conexao:
        return conexao.execute(
            f"SELECT {COLUNAS} FROM veiculo WHERE placa LIKE %s ORDER BY id_veiculo",
            (f"%{busca}%",),
        ).fetchall()


def listar_por_cliente(cliente_id: int):
    with conectar() as conexao:
        return conexao.execute(
            f"SELECT {COLUNAS} FROM veiculo WHERE id_cliente = %s ORDER BY id_veiculo", (cliente_id,)
        ).fetchall()


def buscar_por_placa(placa: str):
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM veiculo WHERE placa = %s", (placa,)).fetchone()


def buscar_por_chassi(chassi: str):
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM veiculo WHERE chassi = %s", (chassi,)).fetchone()


def criar(dados: dict):
    with conectar() as conexao:
        return conexao.execute(
            f"""INSERT INTO veiculo (placa, chassi, marca, modelo, ano, km_atual, id_cliente)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING {COLUNAS}""",
            (dados["placa"], dados.get("chassi"), dados["marca"], dados["modelo"], dados.get("ano"),
             dados.get("quilometragem"), dados["cliente_id"]),
        ).fetchone()


def atualizar(id: int, dados: dict):
    with conectar() as conexao:
        return conexao.execute(
            f"""UPDATE veiculo
                   SET placa = %s, chassi = %s, marca = %s, modelo = %s, ano = %s,
                       km_atual = %s, id_cliente = %s
                 WHERE id_veiculo = %s
             RETURNING {COLUNAS}""",
            (dados["placa"], dados.get("chassi"), dados["marca"], dados["modelo"], dados.get("ano"),
             dados.get("quilometragem"), dados["cliente_id"], id),
        ).fetchone()


def excluir(id: int):
    with conectar() as conexao:
        conexao.execute("DELETE FROM veiculo WHERE id_veiculo = %s", (id,))
