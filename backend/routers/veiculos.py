from fastapi import APIRouter

from schemas.veiculo_schema import Veiculo
from services import veiculo_service

router = APIRouter(prefix="/api/veiculos", tags=["Veículos"])


# GET /api/veiculos  ou  GET /api/veiculos?placa=QRS
@router.get("")
def listar_veiculos(placa: str | None = None):
    return veiculo_service.listar_veiculos(placa)


# GET /api/veiculos/1
@router.get("/{id}")
def consultar_veiculo(id: int):
    return veiculo_service.consultar_veiculo(id)


# POST /api/veiculos
@router.post("", status_code=201)
def cadastrar_veiculo(entrada: Veiculo):
    return veiculo_service.cadastrar_veiculo(entrada)


# PUT /api/veiculos/1
@router.put("/{id}")
def atualizar_veiculo(id: int, entrada: Veiculo):
    return veiculo_service.atualizar_veiculo(id, entrada)


# DELETE /api/veiculos/1
@router.delete("/{id}", status_code=204)
def excluir_veiculo(id: int):
    veiculo_service.excluir_veiculo(id)
