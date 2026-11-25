# Autenticação. Os usuários ficam na tabela usuario do banco, com a senha guardada só como
# hash (PBKDF2). O acesso é por token "Bearer" assinado: o token carrega o id do usuário e a
# validade, e a assinatura (HMAC) impede que alguém o altere. Assim o token vale em qualquer
# instância do servidor (na Vercel cada requisição pode cair numa diferente) sem precisar
# de uma tabela de sessões.
#
# A assinatura usa a variável de ambiente CHAVE_SECRETA (defina uma na Vercel). Sem ela,
# a chave é derivada do DATABASE_URL, que também é secreto e igual em todas as instâncias.
#
# Nenhuma outra rota exige login por enquanto; para exigir, use
# `Depends(auth_service.usuario_atual)` na rota.
import base64
import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import connection
from database.tabela import Tabela
from schemas.auth_schema import EsqueciSenha, Login
from schemas.usuario_schema import Usuario

HORAS_DA_SESSAO = 8
MINUTOS_DA_RECUPERACAO = 30
ITERACOES = 200_000
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
bearer = HTTPBearer(auto_error=False)

tabela = Tabela("usuario", "id_usuario", {"nome": "nome", "email": "email", "senha_hash": "senha_hash",
                                           "perfil": "perfil"})

# Token de recuperação de senha -> {"usuario_id", "expira_em"}. O envio do e-mail ainda não
# existe, então eles ficam só na memória e nunca vão na resposta.
tokens_recuperacao = {}

# Usado quando o e-mail não existe, para o login levar o mesmo tempo nos dois casos.
HASH_FALSO = None


# Os testes trocam esta função para simular o tempo passando.
def agora():
    return datetime.now()


def chave_secreta():
    chave = os.environ.get("CHAVE_SECRETA")
    if chave:
        return chave.encode()
    return hashlib.sha256(b"oficina-token:" + connection.url_do_banco().encode()).digest()


# Guarda "pbkdf2_sha256$iteracoes$sal$hash" (cabe na coluna senha_hash).
def hash_senha(senha: str, sal: bytes | None = None):
    sal = sal or secrets.token_bytes(16)
    calculado = hashlib.pbkdf2_hmac("sha256", senha.encode(), sal, ITERACOES).hex()
    return f"pbkdf2_sha256${ITERACOES}${sal.hex()}${calculado}"


def senha_confere(senha: str, guardado: str):
    _, iteracoes, sal, esperado = guardado.split("$")
    calculado = hashlib.pbkdf2_hmac("sha256", senha.encode(), bytes.fromhex(sal), int(iteracoes)).hex()
    return hmac.compare_digest(calculado, esperado)


def criar_usuario(nome: str, email: str, senha: str, perfil: str = "RECEPCAO"):
    return tabela.criar({"nome": nome, "email": email.strip().lower(), "senha_hash": hash_senha(senha),
                         "perfil": perfil})


def buscar_por_email(email: str):
    return tabela.buscar_por("email = %s", (email.strip().lower(),))


# Os dados do usuário que podem sair na resposta (nunca o hash).
def usuario_publico(usuario):
    return {"id": usuario["id"], "nome": usuario["nome"], "email": usuario["email"], "perfil": usuario["perfil"]}


# --- Token assinado: base64("id.validade") + "." + assinatura ---
def _b64(dados: bytes):
    return base64.urlsafe_b64encode(dados).rstrip(b"=").decode()


def _de_b64(texto: str):
    return base64.urlsafe_b64decode(texto + "=" * (-len(texto) % 4))


def _assinar(conteudo: str):
    return _b64(hmac.new(chave_secreta(), conteudo.encode(), hashlib.sha256).digest())


def gerar_token(usuario_id: int):
    validade = int((agora() + timedelta(hours=HORAS_DA_SESSAO)).timestamp())
    conteudo = _b64(f"{usuario_id}.{validade}".encode())
    return f"{conteudo}.{_assinar(conteudo)}"


# O id do usuário do token, ou None se o token é inválido, foi alterado ou expirou.
def ler_token(token: str):
    try:
        conteudo, assinatura = token.split(".")
        if not hmac.compare_digest(assinatura, _assinar(conteudo)):
            return None
        usuario_id, validade = _de_b64(conteudo).decode().split(".")
        if int(validade) < agora().timestamp():
            return None
        return int(usuario_id)
    except (ValueError, UnicodeDecodeError):
        return None


# O usuário do token enviado em "Authorization: Bearer <token>", ou 401.
def usuario_atual(credenciais: HTTPAuthorizationCredentials | None = Depends(bearer)):
    negado = HTTPException(status_code=401, detail="Sessão inválida ou expirada. Entre novamente.",
                           headers={"WWW-Authenticate": "Bearer"})
    if credenciais is None:
        raise negado
    usuario_id = ler_token(credenciais.credentials)
    usuario = tabela.buscar(usuario_id) if usuario_id is not None else None
    if usuario is None:
        raise negado
    return usuario


def entrar(entrada: Login):
    global HASH_FALSO
    garantir_usuario_inicial()
    usuario = buscar_por_email(entrada.email)
    if HASH_FALSO is None:
        HASH_FALSO = hash_senha(secrets.token_hex(8))
    confere = senha_confere(entrada.senha, usuario["senha_hash"] if usuario else HASH_FALSO)
    # A mesma mensagem para e-mail desconhecido e senha errada, para não revelar quem tem conta.
    if usuario is None or not confere:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    return {"access_token": gerar_token(usuario["id"]), "token_type": "bearer", "usuario": usuario_publico(usuario)}


# Responde igual exista o e-mail ou não.
def esqueci_senha(entrada: EsqueciSenha):
    email = entrada.email.strip().lower()
    if not EMAIL.match(email):
        raise HTTPException(status_code=422, detail="E-mail inválido.")
    usuario = buscar_por_email(email)
    if usuario is not None:
        tokens_recuperacao[secrets.token_urlsafe(32)] = {
            "usuario_id": usuario["id"],
            "expira_em": agora() + timedelta(minutes=MINUTOS_DA_RECUPERACAO)}
    return {"mensagem": "Se o e-mail estiver cadastrado, enviaremos as instruções para recuperar a senha."}


# Com a tabela usuario vazia (banco novo), cria o primeiro usuário: e-mail e senha vêm de
# ADMIN_EMAIL e ADMIN_SENHA. Sem elas, usa-se o par abaixo. Troque antes de publicar.
def garantir_usuario_inicial():
    if connection.consultar_um("SELECT 1 FROM usuario LIMIT 1") is None:
        criar_usuario(os.environ.get("ADMIN_NOME", "Administrador"),
                      os.environ.get("ADMIN_EMAIL", "recepcao@oficina.com.br"),
                      os.environ.get("ADMIN_SENHA", "oficina123"), perfil="ADMIN")


# ------------------------------------------------------------------ Gestão de usuários (/api/usuarios)

# Só o perfil ADMIN (o "Gerente" das telas) gerencia usuários.
def exigir_admin(usuario=Depends(usuario_atual)):
    if usuario["perfil"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Só o perfil Gerente pode gerenciar usuários.")
    return usuario


def buscar_usuario(id: int):
    usuario = tabela.buscar(id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return usuario


def validar_usuario(entrada: Usuario, id: int | None = None):
    nome = entrada.nome.strip()
    if nome == "":
        raise HTTPException(status_code=422, detail="O nome é obrigatório.")
    if len(nome) > 120:
        raise HTTPException(status_code=422, detail="O nome pode ter no máximo 120 caracteres.")
    email = entrada.email.strip().lower()
    if not EMAIL.match(email) or len(email) > 120:
        raise HTTPException(status_code=422, detail="E-mail inválido.")
    repetido = buscar_por_email(email)
    if repetido is not None and repetido["id"] != id:
        raise HTTPException(status_code=409, detail="Já existe um usuário com esse e-mail.")
    senha = entrada.senha or ""
    if id is None and senha == "":
        raise HTTPException(status_code=422, detail="Informe a senha.")
    if senha and len(senha) < 8:
        raise HTTPException(status_code=422, detail="A senha precisa ter pelo menos 8 caracteres.")
    return nome, email, senha


def listar_usuarios():
    return [usuario_publico(u) for u in sorted(tabela.listar(), key=lambda u: u["nome"].lower())]


def cadastrar_usuario(entrada: Usuario):
    nome, email, senha = validar_usuario(entrada)
    return usuario_publico(criar_usuario(nome, email, senha, entrada.perfil))


# O Gerente não pode tirar de si mesmo o perfil ADMIN (ficaria sem acesso a esta tela).
def atualizar_usuario(id: int, entrada: Usuario, quem_pede):
    buscar_usuario(id)
    nome, email, senha = validar_usuario(entrada, id)
    if id == quem_pede["id"] and entrada.perfil != "ADMIN":
        raise HTTPException(status_code=409, detail="Você não pode tirar o seu próprio perfil de Gerente.")
    dados = {"nome": nome, "email": email, "perfil": entrada.perfil}
    if senha:
        dados["senha_hash"] = hash_senha(senha)
    return usuario_publico(tabela.atualizar(id, dados))


# O token é assinado e não fica guardado: depois de excluído, o usuário cai no 401 na próxima
# chamada, porque usuario_atual não o encontra mais na tabela.
def excluir_usuario(id: int, quem_pede):
    buscar_usuario(id)
    if id == quem_pede["id"]:
        raise HTTPException(status_code=409, detail="Você não pode excluir o seu próprio usuário.")
    tabela.excluir(id)
