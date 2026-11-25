from typing import Literal

from pydantic import BaseModel

# Perfis de acesso (os mesmos do CHECK ck_usuario_perfil do banco). Na tela, ADMIN aparece como "Gerente".
Perfil = Literal["ADMIN", "RECEPCAO", "MECANICO"]


# POST /api/usuarios (senha obrigatória) e PUT /api/usuarios/{id} (senha opcional: vazia mantém a atual)
# {"nome": "Rafael", "email": "rafael@oficina.com.br", "perfil": "MECANICO", "senha": "12345678"}
class Usuario(BaseModel):
    nome: str
    email: str
    perfil: Perfil
    senha: str | None = None
