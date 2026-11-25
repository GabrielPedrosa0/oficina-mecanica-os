from fastapi import APIRouter

from schemas.ola_mundo_schema import OlaMundo
from services import ola_mundo_service

router = APIRouter(prefix="/api/ola-mundo", tags=["Olá, mundo"])


# GET /api/ola-mundo
@router.get("")
def listar_mensagens():
    return ola_mundo_service.listar_mensagens()


# POST /api/ola-mundo
@router.post("", status_code=201)
def gravar_mensagem(entrada: OlaMundo):
    return ola_mundo_service.gravar_mensagem(entrada)
