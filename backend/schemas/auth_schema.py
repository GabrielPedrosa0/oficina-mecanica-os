from pydantic import BaseModel


# O corpo de POST /api/auth/login, por exemplo {"email": "voce@oficina.com.br", "senha": "..."}
class Login(BaseModel):
    email: str
    senha: str


# O corpo de POST /api/auth/esqueci-senha
class EsqueciSenha(BaseModel):
    email: str
