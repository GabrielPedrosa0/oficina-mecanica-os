from fastapi import APIRouter, Response

from schemas.ordem_servico_schema import Status
from services import exportacao_service

router = APIRouter(prefix="/api/ordens-servico", tags=["Exportação"])


# GET /api/ordens-servico/exportar  (aceita os mesmos filtros da listagem)
@router.get("/exportar")
def exportar_ordens(status: Status | None = None, placa: str | None = None, cliente: str | None = None):
    return Response(
        content=exportacao_service.gerar_csv(status, placa, cliente),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="ordens-servico.csv"'},
    )
