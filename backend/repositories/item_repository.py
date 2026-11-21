# Catálogo de itens (peças e serviços) em memória (dicionário que liga o id ao item).
# Somem quando o servidor reinicia. O banco de dados vem depois.
# O catálogo começa com uma peça e um serviço, como no banco; reiniciar() volta para eles.
itens = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    itens.clear()
    itens[1] = {"id": 1, "tipo": "PECA", "descricao": "Peça", "codigo": None, "preco": 0.0,
                "qtd_estoque": None, "tempo_estimado_min": None}
    itens[2] = {"id": 2, "tipo": "SERVICO", "descricao": "Serviço", "codigo": None, "preco": 0.0,
                "qtd_estoque": None, "tempo_estimado_min": None}
    proximo_id = 3


def listar():
    return list(itens.values())


def buscar(id: int):
    return itens.get(id)


def buscar_por_descricao(tipo: str, descricao: str):
    return next((i for i in itens.values()
                 if i["tipo"] == tipo and i["descricao"].lower() == descricao.lower()), None)


def buscar_por_codigo(codigo: str):
    return next((i for i in itens.values() if i["codigo"] == codigo), None)


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


# Começa já com a peça e o serviço.
reiniciar()
