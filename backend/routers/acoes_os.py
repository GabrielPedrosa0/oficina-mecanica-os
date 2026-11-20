from fastapi import APIRouter

from schemas.acao_os_schema import AlterarStatus
from services import acao_os_service

router = APIRouter(prefix="/api/ordens-servico", tags=["Ações da OS"])


# PATCH /api/ordens-servico/1042/status   {"status": "AGUARDANDO_PECA"}
# Só aceita as transições permitidas (409 nas demais).
@router.patch("/{id:int}/status")
def alterar_status(id: int, entrada: AlterarStatus):
    return acao_os_service.mudar_status(id, entrada.status)


# POST /api/ordens-servico/1042/enviar-orcamento
@router.post("/{id:int}/enviar-orcamento")
def enviar_orcamento(id: int):
    return acao_os_service.enviar_orcamento(id)


# POST /api/ordens-servico/1042/marcar-pronta
@router.post("/{id:int}/marcar-pronta")
def marcar_pronta(id: int):
    return acao_os_service.marcar_pronta(id)
