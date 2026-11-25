# Veículos no banco (tabela veiculo). Na API, km_atual se chama "quilometragem"
# e id_cliente se chama "cliente_id".
from core.texto import placa_confere
from database.tabela import Tabela

tabela = Tabela(
    "veiculo", "id_veiculo",
    {"placa": "placa", "chassi": "chassi", "marca": "marca", "modelo": "modelo", "ano": "ano",
     "quilometragem": "km_atual", "cliente_id": "id_cliente"},
    # chassi é char(17): o banco completa com espaços um chassi mais curto.
    leitura={"chassi": "rtrim(chassi)"},
)


# Só para os testes: apaga todos os veículos (e, em cascata, as OS).
def reiniciar():
    tabela.esvaziar()


def listar():
    return tabela.listar()


def buscar(id: int):
    return tabela.buscar(id)


# Veículos cuja placa contém o texto buscado (para GET /api/veiculos?placa=).
# A comparação ignora "-", espaço e maiúsculas (core/texto.py), por isso é feita aqui.
def listar_por_placa(placa: str):
    return [v for v in tabela.listar() if placa_confere(v["placa"], placa)]


def listar_por_cliente(cliente_id: int):
    return tabela.listar("id_cliente = %s", (cliente_id,))


def criar(dados: dict):
    return tabela.criar(dados)


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)


def buscar_por_placa(placa: str):
    return tabela.buscar_por("placa = %s", (placa,))


def buscar_por_chassi(chassi: str):
    return tabela.buscar_por("rtrim(chassi) = %s", (chassi.strip(),))


# Só para os testes: grava o veículo com um id escolhido.
def criar_com_id(id: int, dados: dict):
    return tabela.criar_com_id(id, dados)
