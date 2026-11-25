from fastapi import APIRouter

from schemas.mecanico_schema import Mecanico
from services import mecanico_service

router = APIRouter(prefix="/api/mecanicos", tags=["Mecânicos"])


# GET /api/mecanicos
@router.get("")
def listar_mecanicos(em_expediente: bool = False):
    return mecanico_service.listar_mecanicos(em_expediente)


# GET /api/mecanicos/1
@router.get("/{id}")
def consultar_mecanico(id: int):
    return mecanico_service.consultar_mecanico(id)


# POST /api/mecanicos
@router.post("", status_code=201)
def cadastrar_mecanico(entrada: Mecanico):
    return mecanico_service.cadastrar_mecanico(entrada)


# PUT /api/mecanicos/1
@router.put("/{id}")
def atualizar_mecanico(id: int, entrada: Mecanico):
    return mecanico_service.atualizar_mecanico(id, entrada)


# DELETE /api/mecanicos/1
@router.delete("/{id}", status_code=204)
def excluir_mecanico(id: int):
    mecanico_service.excluir_mecanico(id)
