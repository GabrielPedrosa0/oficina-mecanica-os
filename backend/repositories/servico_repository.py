# Catálogo de serviços (mão de obra): as linhas da tabela item com tipo 'SERVICO'.
# Na API: preco_base é a coluna preco.
# O serviço genérico do sistema (id 2, "Serviço") não aparece aqui: ele serve para lançar na OS
# um serviço que não está no catálogo.
from database.tabela import Tabela
from repositories import item_repository

GENERICO = 2

tabela = Tabela("item", "id_item", {
    "tipo": "tipo", "descricao": "descricao", "tempo_estimado_min": "tempo_estimado_min", "preco_base": "preco",
})

FILTRO = "tipo = 'SERVICO' AND id_item <> %s"


def reiniciar():
    item_repository.reiniciar()


def listar():
    return tabela.listar(FILTRO, (GENERICO,))


def buscar(id: int):
    return tabela.buscar_por(f"{FILTRO} AND id_item = %s", (GENERICO, id))


def buscar_por_descricao(descricao: str):
    return tabela.buscar_por(f"{FILTRO} AND lower(descricao) = lower(%s)", (GENERICO, descricao))


def criar(dados: dict):
    return tabela.criar({**dados, "tipo": "SERVICO"})


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)
