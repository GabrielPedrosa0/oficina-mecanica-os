from fastapi import APIRouter

from schemas.item_schema import Item, Tipo
from services import item_service

router = APIRouter(prefix="/api/itens", tags=["Catálogo de itens"])


# GET /api/itens  ou  GET /api/itens?tipo=PECA
@router.get("")
def listar_itens(tipo: Tipo | None = None):
    return item_service.listar_itens(tipo)


# GET /api/itens/1
@router.get("/{id}")
def consultar_item(id: int):
    return item_service.consultar_item(id)


# POST /api/itens
@router.post("", status_code=201)
def cadastrar_item(entrada: Item):
    return item_service.cadastrar_item(entrada)


# PUT /api/itens/1
@router.put("/{id}")
def atualizar_item(id: int, entrada: Item):
    return item_service.atualizar_item(id, entrada)


# DELETE /api/itens/1
@router.delete("/{id}", status_code=204)
def excluir_item(id: int):
    item_service.excluir_item(id)
