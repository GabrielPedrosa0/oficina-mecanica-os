# Mensagens no banco (tabela ola_mundo, criada por banco/migracoes/001_ola_mundo.sql).
from database.tabela import Tabela

tabela = Tabela("ola_mundo", "id_ola_mundo", {"mensagem": "mensagem", "criado_em": "criado_em"})


def listar():
    return tabela.listar()


def criar(dados: dict):
    return tabela.criar(dados)
