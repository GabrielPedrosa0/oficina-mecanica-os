from fastapi import APIRouter

from schemas.catalogo_schema import ServicoCatalogo
from services import catalogo_service

router = APIRouter(prefix="/api/servicos", tags=["Catálogo de serviços"])


# GET /api/servicos  ·  GET /api/servicos?busca=oleo
@router.get("")
def listar_servicos(busca: str | None = None):
    return catalogo_service.listar_servicos(busca)


@router.get("/{id}")
def consultar_servico(id: int):
    return catalogo_service.buscar_servico(id)


@router.post("", status_code=201)
def cadastrar_servico(entrada: ServicoCatalogo):
    return catalogo_service.cadastrar_servico(entrada)


@router.put("/{id}")
def atualizar_servico(id: int, entrada: ServicoCatalogo):
    return catalogo_service.atualizar_servico(id, entrada)


@router.delete("/{id}", status_code=204)
def excluir_servico(id: int):
    catalogo_service.excluir_servico(id)
