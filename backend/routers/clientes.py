from fastapi import APIRouter

from schemas.cliente_schema import Cliente
from services import cliente_service

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])


# GET /api/clientes  ou  GET /api/clientes?nome=Marina
@router.get("")
def listar_clientes(nome: str | None = None):
    return cliente_service.listar_clientes(nome)


# GET /api/clientes/1
@router.get("/{id}")
def consultar_cliente(id: int):
    return cliente_service.consultar_cliente(id)


# POST /api/clientes
@router.post("", status_code=201)
def cadastrar_cliente(entrada: Cliente):
    return cliente_service.cadastrar_cliente(entrada)


# PUT /api/clientes/1
@router.put("/{id}")
def atualizar_cliente(id: int, entrada: Cliente):
    return cliente_service.atualizar_cliente(id, entrada)


# DELETE /api/clientes/1
@router.delete("/{id}", status_code=204)
def excluir_cliente(id: int):
    cliente_service.excluir_cliente(id)


# GET /api/clientes/1/veiculos
@router.get("/{id}/veiculos")
def listar_veiculos_do_cliente(id: int):
    return cliente_service.listar_veiculos_do_cliente(id)


# GET /api/clientes/1/historico
@router.get("/{id}/historico")
def consultar_historico_do_cliente(id: int):
    return cliente_service.consultar_historico_do_cliente(id)
