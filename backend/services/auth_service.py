# Autenticação (opcional). A senha é guardada com hash (PBKDF2) e o acesso é por token
# "Bearer". Nenhuma outra rota exige login por enquanto; para exigir, use
# `Depends(auth_service.usuario_atual)` na rota.
import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas.auth_schema import EsqueciSenha, Login

HORAS_DA_SESSAO = 8
MINUTOS_DA_RECUPERACAO = 30
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
bearer = HTTPBearer(auto_error=False)

usuarios = {}
sessoes = {}               # token de acesso -> {"usuario_id", "expira_em"}
tokens_recuperacao = {}    # token de recuperação de senha -> {"usuario_id", "expira_em"}
proximo_usuario_id = 1

# Usado quando o e-mail não existe, para o login levar o mesmo tempo nos dois casos.
SAL_FALSO = secrets.token_bytes(16)


def hash_senha(senha: str, sal: bytes):
    return hashlib.pbkdf2_hmac("sha256", senha.encode(), sal, 200_000).hex()


def criar_usuario(nome: str, email: str, senha: str, perfil: str = "Recepção"):
    global proximo_usuario_id
    sal = secrets.token_bytes(16)
    usuarios[proximo_usuario_id] = {"id": proximo_usuario_id, "nome": nome, "email": email.lower(),
                                    "perfil": perfil, "sal": sal, "senha_hash": hash_senha(senha, sal)}
    proximo_usuario_id += 1


# Os dados do usuário que podem sair na resposta (nunca o hash).
def usuario_publico(usuario):
    return {"id": usuario["id"], "nome": usuario["nome"], "email": usuario["email"], "perfil": usuario["perfil"]}


# O usuário do token enviado em "Authorization: Bearer <token>", ou 401.
def usuario_atual(credenciais: HTTPAuthorizationCredentials | None = Depends(bearer)):
    negado = HTTPException(status_code=401, detail="Sessão inválida ou expirada. Entre novamente.",
                           headers={"WWW-Authenticate": "Bearer"})
    if credenciais is None:
        raise negado
    sessao = sessoes.get(credenciais.credentials)
    if sessao is None or sessao["expira_em"] < datetime.now() or sessao["usuario_id"] not in usuarios:
        sessoes.pop(credenciais.credentials, None)
        raise negado
    return usuarios[sessao["usuario_id"]]


def entrar(entrada: Login):
    usuario = next((u for u in usuarios.values() if u["email"] == entrada.email.strip().lower()), None)
    hash_calculado = hash_senha(entrada.senha, usuario["sal"] if usuario else SAL_FALSO)
    # A mesma mensagem para e-mail desconhecido e senha errada, para não revelar quem tem conta.
    if usuario is None or not hmac.compare_digest(hash_calculado, usuario["senha_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    token = secrets.token_urlsafe(32)
    sessoes[token] = {"usuario_id": usuario["id"], "expira_em": datetime.now() + timedelta(hours=HORAS_DA_SESSAO)}
    return {"access_token": token, "token_type": "bearer", "usuario": usuario_publico(usuario)}


# Responde igual exista o e-mail ou não. O envio do e-mail com o link ainda não existe:
# o token de recuperação fica só na memória e nunca vai na resposta.
def esqueci_senha(entrada: EsqueciSenha):
    email = entrada.email.strip().lower()
    if not EMAIL.match(email):
        raise HTTPException(status_code=422, detail="E-mail inválido.")
    usuario = next((u for u in usuarios.values() if u["email"] == email), None)
    if usuario is not None:
        tokens_recuperacao[secrets.token_urlsafe(32)] = {
            "usuario_id": usuario["id"],
            "expira_em": datetime.now() + timedelta(minutes=MINUTOS_DA_RECUPERACAO)}
    return {"mensagem": "Se o e-mail estiver cadastrado, enviaremos as instruções para recuperar a senha."}


# Usuário de desenvolvimento: o e-mail e a senha vêm de ADMIN_EMAIL e ADMIN_SENHA.
# Sem elas, usa-se o par abaixo. Troque antes de publicar.
def criar_usuario_inicial():
    criar_usuario("Usuário", os.environ.get("ADMIN_EMAIL", "recepcao@oficina.com.br"),
                  os.environ.get("ADMIN_SENHA", "oficina123"))


criar_usuario_inicial()
