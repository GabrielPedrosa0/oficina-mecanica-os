from fastapi import APIRouter

from schemas.ordem_servico_schema import OrdemServico, Status
from services import ordem_servico_service

router = APIRouter(prefix="/api/ordens-servico", tags=["Ordens de serviço"])


# GET /api/ordens-servico
# Filtros: ?status=EM_SERVICO  ?placa=QRS4F21  ?cliente=Marina (podem ser combinados)
@router.get("")
def listar_ordens(status: Status | None = None, placa: str | None = None, cliente: str | None = None):
    return ordem_servico_service.listar_ordens(status, placa, cliente)


# GET /api/ordens-servico/1042
# O ":int" faz "exportar" não ser lido como id, em qualquer ordem de registro dos routers.
@router.get("/{id:int}")
def consultar_ordem(id: int):
    return ordem_servico_service.consultar_ordem(id)


# POST /api/ordens-servico
@router.post("", status_code=201)
def cadastrar_ordem(entrada: OrdemServico):
    return ordem_servico_service.cadastrar_ordem(entrada)


# PUT /api/ordens-servico/1042
@router.put("/{id:int}")
def atualizar_ordem(id: int, entrada: OrdemServico):
    return ordem_servico_service.atualizar_ordem(id, entrada)


# DELETE /api/ordens-servico/1042
@router.delete("/{id:int}", status_code=204)
def excluir_ordem(id: int):
    ordem_servico_service.excluir_ordem(id)
