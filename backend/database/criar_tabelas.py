# Cria as tabelas no banco do DATABASE_URL a partir de banco/modelo_logico_oficina.sql.
#
#   cd backend
#   python -m database.criar_tabelas              # só as tabelas
#   python -m database.criar_tabelas --exemplos   # e também os 2 mecânicos de exemplo
#
# Se as tabelas já existem, não faz nada (não apaga dados).
import sys
from pathlib import Path

from database.connection import consultar_um, pool

PASTA_BANCO = Path(__file__).resolve().parents[2] / "banco"
MODELO = PASTA_BANCO / "modelo_logico_oficina.sql"
EXEMPLOS = PASTA_BANCO / "dados_exemplo.sql"


def rodar_arquivo(arquivo: Path):
    with pool().connection() as conexao:
        conexao.execute(arquivo.read_text(encoding="utf-8"))


def criar(com_exemplos=False):
    if consultar_um("SELECT to_regclass('public.os') AS tabela")["tabela"] is not None:
        print("As tabelas já existem: nada a fazer.")
    else:
        rodar_arquivo(MODELO)
        print("Tabelas criadas.")
        if com_exemplos:
            rodar_arquivo(EXEMPLOS)
            print("Dados de exemplo inseridos.")


if __name__ == "__main__":
    criar(com_exemplos="--exemplos" in sys.argv)
