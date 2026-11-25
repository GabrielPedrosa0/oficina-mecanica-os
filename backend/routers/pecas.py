from fastapi import APIRouter

from schemas.catalogo_schema import EntradaEstoque, Peca
from services import catalogo_service

router = APIRouter(prefix="/api/pecas", tags=["Peças e estoque"])


# GET /api/pecas  ·  ?busca=filtro (descrição ou código)  ·  ?estoque_baixo=true
@router.get("")
def listar_pecas(busca: str | None = None, estoque_baixo: bool = False):
    return catalogo_service.listar_pecas(busca, estoque_baixo)


@router.get("/{id}")
def consultar_peca(id: int):
    return catalogo_service.consultar_peca(id)


@router.post("", status_code=201)
def cadastrar_peca(entrada: Peca):
    return catalogo_service.cadastrar_peca(entrada)


# O PUT não muda o estoque (use a entrada de estoque).
@router.put("/{id}")
def atualizar_peca(id: int, entrada: Peca):
    return catalogo_service.atualizar_peca(id, entrada)


@router.delete("/{id}", status_code=204)
def excluir_peca(id: int):
    catalogo_service.excluir_peca(id)


# POST /api/pecas/7/entradas  {"quantidade": 10, "observacao": "Nota 1234"}
@router.post("/{id}/entradas")
def registrar_entrada(id: int, entrada: EntradaEstoque):
    return catalogo_service.registrar_entrada(id, entrada)
