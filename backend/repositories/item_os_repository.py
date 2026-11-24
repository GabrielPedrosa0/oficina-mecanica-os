# Itens das OS (serviços e peças) em memória (dicionário que liga o id ao item). Somem
# quando o servidor reinicia. O banco de dados vem depois.
# Cada item guarda o os_id da OS a que pertence e o item_id do item do catálogo.
itens = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    itens.clear()
    proximo_id = 1


# Os itens de uma OS, na ordem em que foram adicionados.
def listar_da_os(os_id: int):
    return [i for i in itens.values() if i["os_id"] == os_id]


# Se algum item de OS usa esse item do catálogo.
def existe_do_item(item_id: int):
    return any(i["item_id"] == item_id for i in itens.values())


def buscar(id: int):
    return itens.get(id)


def criar(dados: dict):
    global proximo_id
    item = {"id": proximo_id, **dados}
    itens[proximo_id] = item
    proximo_id += 1
    return item


def atualizar(id: int, dados: dict):
    item = {"id": id, **dados}
    itens[id] = item
    return item


def excluir(id: int):
    del itens[id]
