# Mecânicos gravados no PostgreSQL (tabela mecanico).
# Por enquanto só o que as ordens de serviço precisam: criar, listar e buscar.
from database.connection import conectar

COLUNAS = "id_mecanico AS id, nome, cpf, telefone, hora_inicio_expediente, hora_fim_expediente"


def reiniciar():
    with conectar() as conexao:
        conexao.execute("TRUNCATE mecanico RESTART IDENTITY CASCADE")


def listar():
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM mecanico ORDER BY nome").fetchall()


def buscar(id: int | None):
    if id is None:
        return None
    with conectar() as conexao:
        return conexao.execute(f"SELECT {COLUNAS} FROM mecanico WHERE id_mecanico = %s", (id,)).fetchone()


def criar(dados: dict):
    with conectar() as conexao:
        return conexao.execute(
            f"""INSERT INTO mecanico (nome, cpf, telefone, hora_inicio_expediente, hora_fim_expediente)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING {COLUNAS}""",
            (dados["nome"], dados.get("cpf"), dados.get("telefone"),
             dados.get("hora_inicio_expediente"), dados.get("hora_fim_expediente")),
        ).fetchone()
