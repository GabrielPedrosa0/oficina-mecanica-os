# Regras dos veículos: validar, não repetir placa, conferir o cliente
# e não excluir veículo que tem ordem de serviço.
import re

from fastapi import HTTPException

from core.texto import normalizar
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


# O veículo com o que a lista de veículos mostra: o nome do dono e a OS em aberto (nem entregue
# nem cancelada), se houver. Para listas, `clientes` e `abertas` vêm prontos (uma consulta só).
def veiculo_completo(veiculo, clientes=None, abertas=None):
    if clientes is None:
        cliente = cliente_repository.buscar(veiculo.get("cliente_id"))
        clientes = {cliente["id"]: cliente} if cliente else {}
    if abertas is None:
        abertas = ordens_abertas_por_veiculo()
    aberta = abertas.get(veiculo["id"])
    return {
        **veiculo,
        "cliente_nome": (clientes.get(veiculo.get("cliente_id")) or {}).get("nome"),
        "status_os_aberta": aberta["status"] if aberta else None,
        "os_aberta_id": aberta["id"] if aberta else None,
    }


# {veiculo_id: OS aberta mais recente}
def ordens_abertas_por_veiculo():
    abertas = {}
    status = ("ORCAMENTO", "EM_SERVICO", "AGUARDANDO_PECA", "PRONTA")
    for ordem in sorted(ordem_servico_repository.listar_por_status(*status),
                        key=lambda o: (o["data_abertura"], o["id"])):
        abertas[ordem["veiculo_id"]] = ordem
    return abertas


# Busca por placa (?placa=) ou geral (?busca=): placa, chassi, marca, modelo ou nome do cliente.
def listar_veiculos(placa: str | None = None, busca: str | None = None):
    lista = veiculo_repository.listar_por_placa(placa) if placa else veiculo_repository.listar()
    clientes = {c["id"]: c for c in cliente_repository.listar()}
    abertas = ordens_abertas_por_veiculo()
    completos = [veiculo_completo(v, clientes, abertas) for v in lista]
    if busca:
        termo = normalizar(busca)
        completos = [v for v in completos
                     if any(termo in normalizar(v.get(campo)) for campo in
                            ("placa", "chassi", "marca", "modelo", "cliente_nome"))]
    return completos


def consultar_veiculo(id: int):
    veiculo = veiculo_repository.buscar(id)
    if veiculo is None:
        raise HTTPException(status_code=404, detail="Veículo não encontrado.")
    return veiculo_completo(veiculo)


# Placa e chassi não se repetem (UNIQUE no banco). `id` é o do próprio veículo, na atualização.
def conferir_repetidos(dados, id: int | None = None):
    outro = veiculo_repository.buscar_por_placa(dados["placa"])
    if outro is not None and outro["id"] != id:
        raise HTTPException(status_code=409, detail="Já existe um veículo com essa placa.")
    if dados.get("chassi"):
        outro = veiculo_repository.buscar_por_chassi(dados["chassi"])
        if outro is not None and outro["id"] != id:
            raise HTTPException(status_code=409, detail="Já existe um veículo com esse chassi.")


def cadastrar_veiculo(entrada: Veiculo):
    dados = validar(entrada)
    conferir_repetidos(dados)
    return veiculo_repository.criar(dados)


def atualizar_veiculo(id: int, entrada: Veiculo):
    consultar_veiculo(id)
    dados = validar(entrada)
    conferir_repetidos(dados, id)
    return veiculo_repository.atualizar(id, dados)


def excluir_veiculo(id: int):
    consultar_veiculo(id)
    if ordem_servico_repository.existe_do_veiculo(id):
        raise HTTPException(status_code=409, detail="O veículo tem ordens de serviço e não pode ser excluído.")
    veiculo_repository.excluir(id)
