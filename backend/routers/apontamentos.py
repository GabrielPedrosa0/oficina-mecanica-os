from fastapi import APIRouter

from schemas.apontamento_schema import Apontamento
from services import apontamento_service

router = APIRouter(prefix="/api/ordens-servico", tags=["Apontamentos da OS"])


# GET /api/ordens-servico/1042/apontamentos  (do mais novo para o mais antigo)
@router.get("/{os_id:int}/apontamentos")
def listar_apontamentos(os_id: int):
    return apontamento_service.listar_apontamentos(os_id)


# POST /api/ordens-servico/1042/apontamentos   {"tipo": "DIAGNOSTICO", "descricao": "..."}
@router.post("/{os_id:int}/apontamentos", status_code=201)
def registrar_apontamento(os_id: int, entrada: Apontamento):
    return apontamento_service.registrar_apontamento(os_id, entrada)
