from pydantic import BaseModel

from schemas.ordem_servico_schema import Status


# O corpo de PATCH /api/ordens-servico/{id}/status, por exemplo {"status": "AGUARDANDO_PECA"}.
# Um status que não existe na lista é recusado com 422 pelo próprio FastAPI.
# motivo é opcional; se vier (ex.: ao cancelar), fica anotado na linha do tempo da OS.
class AlterarStatus(BaseModel):
    status: Status
    motivo: str | None = None
