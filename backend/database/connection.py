# Conexão com o banco PostgreSQL (psycopg 3, SQL puro, sem ORM).
# O endereço do banco vem da variável de ambiente DATABASE_URL, por exemplo:
#   postgresql://usuario:senha@localhost:5432/oficina
# As tabelas são criadas pelo script banco/modelo_logico_oficina.sql.
#
# Uso nos repositórios:
#   with conectar() as conexao:
#       linha = conexao.execute("SELECT ... WHERE id_cliente = %s", (id,)).fetchone()
# Ao sair do "with" sem erro, as mudanças são gravadas (commit); com erro, são desfeitas.
import os

import psycopg
from psycopg.rows import dict_row


def conectar():
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("Defina a variável de ambiente DATABASE_URL com o endereço do banco.")
    # dict_row faz cada linha vir como dicionário: {"id": 1, "nome": "Marina", ...}
    return psycopg.connect(url, row_factory=dict_row)
