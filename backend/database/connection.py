# Conexão com o PostgreSQL do Supabase. Integrante 6.
#
# O endereço do banco vem da variável de ambiente DATABASE_URL (Supabase -> Connect).
# Na Vercel, cadastre-a em Settings -> Environment Variables. Localmente, coloque-a no arquivo backend/.env
# (veja .env.example). As tabelas são as de banco/modelo_logico_oficina.sql; para criá-las,
# rode `python -m database.criar_tabelas`.
#
# Os repositories usam só as funções `consultar`, `consultar_um` e `executar` daqui.
import atexit
import os
from pathlib import Path

import psycopg
from psycopg.rows import dict_row
from psycopg.types.numeric import FloatLoader
from psycopg_pool import ConnectionPool

# numeric (preço, valor) chega como float, igual aos dados que a API sempre usou.
psycopg.adapters.register_loader("numeric", FloatLoader)

_pool = None


# Lê o backend/.env (só KEY=valor por linha), sem sobrescrever o que já está no ambiente.
def _carregar_env():
    arquivo = Path(__file__).resolve().parent.parent / ".env"
    if not arquivo.exists():
        return
    for linha in arquivo.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if linha and not linha.startswith("#") and "=" in linha:
            chave, valor = linha.split("=", 1)
            os.environ.setdefault(chave.strip(), valor.strip().strip('"').strip("'"))


def url_do_banco():
    _carregar_env()
    url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
    if not url:
        raise RuntimeError("Banco não configurado: defina DATABASE_URL (veja backend/.env.example).")
    return url


def pool():
    global _pool
    if _pool is None:
        # Na Vercel cada instância é pequena e de vida curta: poucas conexões bastam.
        # prepare_threshold=None: o pooler do Supabase (Supavisor, modo transaction, porta 6543)
        # não aceita comandos preparados. check: o pooler fecha conexões paradas; testa antes de usar.
        _pool = ConnectionPool(
            url_do_banco(),
            min_size=0,
            max_size=int(os.environ.get("DB_MAX_CONEXOES", "5")),
            kwargs={"autocommit": True, "row_factory": dict_row, "prepare_threshold": None},
            check=ConnectionPool.check_connection,
            open=True,
        )
    return _pool


# Todas as linhas como lista de dicionários.
def consultar(sql, parametros=None):
    with pool().connection() as conexao:
        return conexao.execute(sql, parametros).fetchall()


# A primeira linha como dicionário, ou None.
def consultar_um(sql, parametros=None):
    with pool().connection() as conexao:
        return conexao.execute(sql, parametros).fetchone()


# Comando sem retorno (UPDATE, DELETE...). Devolve quantas linhas mudou.
def executar(sql, parametros=None):
    with pool().connection() as conexao:
        return conexao.execute(sql, parametros).rowcount


# Fecha as conexões (ao sair do programa ou ao trocar de banco).
@atexit.register
def fechar():
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


# Troca o banco usado (os testes apontam para um banco só deles).
def usar_url(url):
    fechar()
    os.environ["DATABASE_URL"] = url
