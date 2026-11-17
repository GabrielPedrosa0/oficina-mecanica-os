from fastapi import APIRouter, Depends

from schemas.auth_schema import EsqueciSenha, Login
from services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


# POST /api/auth/login
@router.post("/login")
def entrar(entrada: Login):
    return auth_service.entrar(entrada)


# POST /api/auth/esqueci-senha
@router.post("/esqueci-senha")
def esqueci_senha(entrada: EsqueciSenha):
    return auth_service.esqueci_senha(entrada)


# GET /api/auth/me
@router.get("/me")
def consultar_usuario_logado(usuario=Depends(auth_service.usuario_atual)):
    return auth_service.usuario_publico(usuario)
