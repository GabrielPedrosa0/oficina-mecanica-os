# Regras dos veículos: validar, não repetir placa, conferir o cliente
# e não excluir veículo que tem ordem de serviço.
import re

from fastapi import HTTPException

from repositories import cliente_repository, ordem_servico_repository, veiculo_repository
from schemas.veiculo_schema import Veiculo

# Placa no formato antigo ABC1234 ou no Mercosul ABC1D23.
PLACA = re.compile(r"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$")


# Confere os campos e devolve os dados prontos, com a placa em maiúsculas e sem "-".
def validar(entrada: Veiculo):
    placa = entrada.placa.upper().replace("-", "").strip()
    if not PLACA.match(placa):
        raise HTTPException(status_code=422, detail="Placa inválida. Use ABC1234 ou ABC1D23.")
    if entrada.marca.strip() == "" or entrada.modelo.strip() == "":
        raise HTTPException(status_code=422, detail="Marca e modelo são obrigatórios.")
    if entrada.ano is not None and (entrada.ano < 1900 or entrada.ano > 2100):
        raise HTTPException(status_code=422, detail="Ano inválido.")
    if entrada.quilometragem is not None and entrada.quilometragem < 0:
        raise HTTPException(status_code=422, detail="A quilometragem não pode ser negativa.")
    if entrada.cliente_id is not None and cliente_repository.buscar(entrada.cliente_id) is None:
        raise HTTPException(status_code=422, detail="Cliente não encontrado.")
    return {**entrada.model_dump(), "placa": placa}


def listar_veiculos(placa: str | None = None):
    if placa:
        return veiculo_repository.listar_por_placa(placa)
    return veiculo_repository.listar()


def consultar_veiculo(id: int):
    veiculo = veiculo_repository.buscar(id)
    if veiculo is None:
        raise HTTPException(status_code=404, detail="Veículo não encontrado.")
    return veiculo


def cadastrar_veiculo(entrada: Veiculo):
    dados = validar(entrada)
    if veiculo_repository.buscar_por_placa(dados["placa"]) is not None:
        raise HTTPException(status_code=409, detail="Já existe um veículo com essa placa.")
    return veiculo_repository.criar(dados)


def atualizar_veiculo(id: int, entrada: Veiculo):
    consultar_veiculo(id)
    dados = validar(entrada)
    outro = veiculo_repository.buscar_por_placa(dados["placa"])
    if outro is not None and outro["id"] != id:
        raise HTTPException(status_code=409, detail="Já existe um veículo com essa placa.")
    return veiculo_repository.atualizar(id, dados)


def excluir_veiculo(id: int):
    consultar_veiculo(id)
    if ordem_servico_repository.existe_do_veiculo(id):
        raise HTTPException(status_code=409, detail="O veículo tem ordens de serviço e não pode ser excluído.")
    veiculo_repository.excluir(id)
