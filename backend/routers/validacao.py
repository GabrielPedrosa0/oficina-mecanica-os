# Modo validação. Gerar link e exportar exigem login; as rotas da sessão são abertas, porque
# o participante não tem login (ele só tem o link do aplicador).
from fastapi import APIRouter, Depends, Response

from schemas.validacao_schema import Evento, Feedback, NovaSessao, NovoAplicador, Perfil
from services import auth_service, validacao_service

router = APIRouter(prefix="/api/validacao", tags=["Validação"])


# POST /api/validacao/aplicadores
@router.post("/aplicadores", status_code=201)
def criar_aplicador(entrada: NovoAplicador, _usuario=Depends(auth_service.usuario_atual)):
    return validacao_service.criar_aplicador(entrada)


# POST /api/validacao/sessoes
@router.post("/sessoes", status_code=201)
def criar_sessao(entrada: NovaSessao):
    return validacao_service.criar_sessao(entrada)


# PUT /api/validacao/sessoes/{id}/perfil
@router.put("/sessoes/{id}/perfil")
def gravar_perfil(id: int, entrada: Perfil):
    return validacao_service.gravar_perfil(id, entrada)


# POST /api/validacao/sessoes/{id}/eventos
@router.post("/sessoes/{id}/eventos", status_code=201)
def gravar_eventos(id: int, eventos: list[Evento]):
    return validacao_service.gravar_eventos(id, eventos)


# POST /api/validacao/sessoes/{id}/feedback
@router.post("/sessoes/{id}/feedback", status_code=201)
def gravar_feedback(id: int, entrada: Feedback):
    return validacao_service.gravar_feedback(id, entrada)


def arquivo_csv(conteudo, nome):
    return Response(content=conteudo, media_type="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="{nome}"'})


# GET /api/validacao/exportar/sessoes
@router.get("/exportar/sessoes")
def exportar_sessoes(_usuario=Depends(auth_service.usuario_atual)):
    return arquivo_csv(validacao_service.exportar_sessoes(), "validacao-sessoes.csv")


# GET /api/validacao/exportar/eventos
@router.get("/exportar/eventos")
def exportar_eventos(_usuario=Depends(auth_service.usuario_atual)):
    return arquivo_csv(validacao_service.exportar_eventos(), "validacao-eventos.csv")
