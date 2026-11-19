# Clientes em memória (dicionário que liga o id ao cliente). Somem quando o servidor
# reinicia. O banco de dados vem depois.
clientes = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    clientes.clear()
    proximo_id = 1


def listar():
    return list(clientes.values())


def buscar(id: int):
    return clientes.get(id)


def buscar_por_email(email: str):
    return next((c for c in clientes.values() if c["email"] == email), None)


def criar(dados: dict):
    global proximo_id
    cliente = {"id": proximo_id, **dados}
    clientes[proximo_id] = cliente
    proximo_id += 1
    return cliente


def atualizar(id: int, dados: dict):
    cliente = {"id": id, **dados}
    clientes[id] = cliente
    return cliente


def excluir(id: int):
    del clientes[id]
