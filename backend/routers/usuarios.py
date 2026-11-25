# Usuários do sistema. Todas as rotas exigem login com o perfil ADMIN (Gerente).
from fastapi import APIRouter, Depends

from schemas.usuario_schema import Usuario
from services import auth_service

router = APIRouter(prefix="/api/usuarios", tags=["Usuários"])


@router.get("")
def listar_usuarios(_admin=Depends(auth_service.exigir_admin)):
    return auth_service.listar_usuarios()


@router.post("", status_code=201)
def cadastrar_usuario(entrada: Usuario, _admin=Depends(auth_service.exigir_admin)):
    return auth_service.cadastrar_usuario(entrada)


@router.put("/{id}")
def atualizar_usuario(id: int, entrada: Usuario, admin=Depends(auth_service.exigir_admin)):
    return auth_service.atualizar_usuario(id, entrada, admin)


@router.delete("/{id}", status_code=204)
def excluir_usuario(id: int, admin=Depends(auth_service.exigir_admin)):
    auth_service.excluir_usuario(id, admin)
