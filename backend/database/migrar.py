# Leva o banco do DATABASE_URL até a versão atual.
#
#   cd backend
#   python -m database.migrar              # cria as tabelas (se faltarem) e aplica as migrações novas
#   python -m database.migrar --exemplos   # idem; num banco vazio, também insere os 2 mecânicos de exemplo
#
# 1. Se o banco está vazio, cria as tabelas de banco/modelo_logico_oficina.sql (como criar_tabelas).
# 2. Aplica, em ordem de nome, cada arquivo .sql de banco/migracoes/ que ainda não foi aplicado.
#    Os já aplicados ficam anotados na tabela `migracao`, então rodar de novo não repete nada.
#
# Cada migração roda numa transação: se der erro, nada dela fica no banco, ela não é anotada
# e as seguintes não rodam. O GitHub Actions (.github/workflows/migrar-banco.yml) roda este
# script sozinho quando um arquivo novo chega em banco/migracoes/ na main.
import sys
from pathlib import Path

from database.connection import pool
from database.criar_tabelas import PASTA_BANCO, criar

PASTA_MIGRACOES = PASTA_BANCO / "migracoes"

# Número qualquer, só para duas execuções ao mesmo tempo não aplicarem a mesma migração.
TRAVA = 7_340_215


def pendentes(pasta: Path = PASTA_MIGRACOES):
    arquivos = sorted(pasta.glob("*.sql"))
    with pool().connection() as conexao:
        conexao.execute("""CREATE TABLE IF NOT EXISTS migracao (
                               nome        varchar(200) PRIMARY KEY,
                               aplicada_em timestamptz  NOT NULL DEFAULT now())""")
        aplicadas = {linha["nome"] for linha in conexao.execute("SELECT nome FROM migracao").fetchall()}
    return [arquivo for arquivo in arquivos if arquivo.name not in aplicadas]


# Aplica as migrações pendentes e devolve os nomes das que aplicou.
def aplicar_pendentes(pasta: Path = PASTA_MIGRACOES):
    aplicadas = []
    for arquivo in pendentes(pasta):
        with pool().connection() as conexao, conexao.transaction():
            conexao.execute("SELECT pg_advisory_xact_lock(%s)", (TRAVA,))
            # Outra execução pode ter aplicado esta enquanto esperávamos a trava.
            if conexao.execute("SELECT 1 FROM migracao WHERE nome = %s", (arquivo.name,)).fetchone():
                continue
            print(f"Aplicando {arquivo.name}...", flush=True)
            conexao.execute(arquivo.read_text(encoding="utf-8"))
            conexao.execute("INSERT INTO migracao (nome) VALUES (%s)", (arquivo.name,))
        aplicadas.append(arquivo.name)
    return aplicadas


if __name__ == "__main__":
    criar(com_exemplos="--exemplos" in sys.argv)
    feitas = aplicar_pendentes()
    print(f"{len(feitas)} migração(ões) aplicada(s)." if feitas else "Nenhuma migração nova: o banco já está em dia.")
