# Veículos em memória (dicionário que liga o id ao veículo). Somem quando o servidor
# reinicia. O banco de dados vem depois.
#
# ATENÇÃO, Integrante 1: este arquivo é seu. Aqui está só o MÍNIMO que as ordens de
# serviço, os clientes e a busca precisam LER. Complete com criar, atualizar e excluir,
# mantendo o dicionário `veiculos` e as funções abaixo (outros módulos chamam elas).
from core.texto import placa_confere

veiculos = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    veiculos.clear()
    proximo_id = 1


def listar():
    return list(veiculos.values())


def buscar(id: int):
    return veiculos.get(id)


# Veículos cuja placa contém o texto buscado (para GET /api/veiculos?placa=).
def listar_por_placa(placa: str):
    return [v for v in veiculos.values() if placa_confere(v["placa"], placa)]


def listar_por_cliente(cliente_id: int):
    return [v for v in veiculos.values() if v.get("cliente_id") == cliente_id]


def criar(dados: dict):
    global proximo_id
    veiculo = {"id": proximo_id, **dados}
    veiculos[proximo_id] = veiculo
    proximo_id += 1
    return veiculo


def atualizar(id: int, dados: dict):
    veiculo = {"id": id, **dados}
    veiculos[id] = veiculo
    return veiculo


def excluir(id: int):
    del veiculos[id]


def buscar_por_placa(placa: str):
    for veiculo in veiculos.values():
        if veiculo["placa"] == placa:
            return veiculo
    return None
