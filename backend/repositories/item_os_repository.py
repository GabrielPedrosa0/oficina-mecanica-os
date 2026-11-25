# Itens das OS (serviços e peças) no banco (tabela os_itens).
# Na API, id_os se chama "os_id" e id_item se chama "item_id".
from database.connection import consultar_um
from database.tabela import Tabela

tabela = Tabela("os_itens", "id_item_os", {
    "os_id": "id_os", "item_id": "id_item", "descricao": "descricao",
    "quantidade": "quantidade", "valor_unitario": "valor_unitario",
})


# Só para os testes: apaga todos os itens das OS.
def reiniciar():
    tabela.esvaziar()


# Os itens de uma OS, na ordem em que foram adicionados.
def listar_da_os(os_id: int):
    return tabela.listar("id_os = %s", (os_id,))


# Se algum item de OS usa esse item do catálogo.
def existe_do_item(item_id: int):
    return consultar_um("SELECT 1 FROM os_itens WHERE id_item = %s LIMIT 1", (item_id,)) is not None


def buscar(id: int):
    return tabela.buscar(id)


def criar(dados: dict):
    return tabela.criar(dados)


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)
