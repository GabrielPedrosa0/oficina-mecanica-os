from datetime import date

from fastapi import APIRouter

from services import dashboard_service

router = APIRouter(prefix="/api/agenda", tags=["Agenda"])


# GET /api/agenda?data=2026-11-11  -> OS (não canceladas) com previsão de entrega nesse dia
@router.get("")
def consultar_agenda(data: date | None = None):
    return dashboard_service.listar_agenda(data)
