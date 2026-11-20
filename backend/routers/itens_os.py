from fastapi import APIRouter

from schemas.item_os_schema import ItemOS
from services import item_os_service

router = APIRouter(prefix="/api/ordens-servico", tags=["Itens da OS"])


# GET /api/ordens-servico/1042/itens
@router.get("/{os_id:int}/itens")
def listar_itens(os_id: int):
    return item_os_service.listar_itens(os_id)


# POST /api/ordens-servico/1042/itens
@router.post("/{os_id:int}/itens", status_code=201)
def cadastrar_item(os_id: int, entrada: ItemOS):
    return item_os_service.cadastrar_item(os_id, entrada)


# PUT /api/ordens-servico/1042/itens/3
@router.put("/{os_id:int}/itens/{item_id:int}")
def atualizar_item(os_id: int, item_id: int, entrada: ItemOS):
    return item_os_service.atualizar_item(os_id, item_id, entrada)


# DELETE /api/ordens-servico/1042/itens/3
@router.delete("/{os_id:int}/itens/{item_id:int}", status_code=204)
def excluir_item(os_id: int, item_id: int):
    item_os_service.excluir_item(os_id, item_id)
