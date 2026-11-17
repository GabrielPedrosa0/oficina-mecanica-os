# Ordens de serviço em memória (dicionário que liga o id à ordem). Somem quando o
# servidor reinicia. O banco de dados vem depois.
ordens = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    ordens.clear()
    proximo_id = 1


def listar():
    return list(ordens.values())


def buscar(id: int):
    return ordens.get(id)


def criar(dados: dict):
    global proximo_id
    ordem = {"id": proximo_id, **dados}
    ordens[proximo_id] = ordem
    proximo_id += 1
    return ordem


def atualizar(id: int, dados: dict):
    ordem = {"id": id, **dados}
    ordens[id] = ordem
    return ordem


def excluir(id: int):
    del ordens[id]


# True se o veículo tem alguma ordem. O Integrante 1 usa isto no DELETE /api/veiculos/{id}
# para responder 409 ("não é possível excluir: o veículo possui ordens de serviço").
def existe_do_veiculo(veiculo_id: int):
    return any(o["veiculo_id"] == veiculo_id for o in ordens.values())


def listar_por_veiculos(veiculo_ids):
    return [o for o in ordens.values() if o["veiculo_id"] in veiculo_ids]
