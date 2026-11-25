from datetime import datetime, timedelta

from database.connection import consultar
from services import auth_service

LOGIN = {"email": "teste@oficina.com.br", "senha": "senha-de-teste"}


def entrar(client):
    return client.post("/api/auth/login", json=LOGIN).json()["access_token"]


def test_login_e_me(client):
    r = client.post("/api/auth/login", json={**LOGIN, "email": " TESTE@oficina.com.br "})
    assert r.status_code == 200
    corpo = r.json()
    assert corpo["token_type"] == "bearer"
    assert "senha" not in str(corpo["usuario"]) and "hash" not in str(corpo["usuario"])
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {corpo['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "teste@oficina.com.br"


def test_login_invalido_tem_a_mesma_mensagem(client):
    errada = client.post("/api/auth/login", json={**LOGIN, "senha": "errada"})
    desconhecido = client.post("/api/auth/login", json={"email": "x@y.com", "senha": "qualquer"})
    assert errada.status_code == desconhecido.status_code == 401
    assert errada.json() == desconhecido.json()


def test_me_sem_token_ou_com_token_ruim_401(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer inventado"}).status_code == 401


def test_me_com_sessao_expirada_401(client, monkeypatch):
    token = entrar(client)
    depois = datetime.now() + timedelta(hours=auth_service.HORAS_DA_SESSAO, seconds=1)
    monkeypatch.setattr(auth_service, "agora", lambda: depois)
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


# Um token alterado (ex.: trocando o id do usuário) perde a assinatura e não vale.
def test_token_alterado_401(client):
    token = entrar(client)
    conteudo, assinatura = token.split(".")
    falso = auth_service._b64(b"2.9999999999") + "." + assinatura
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {falso}"}).status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {conteudo}.x"}).status_code == 401


def test_senha_nao_fica_em_texto_puro(client):
    assert "senha-de-teste" not in str(consultar("SELECT * FROM usuario"))


# Com o banco sem usuários, o primeiro login cria o usuário inicial (ADMIN_EMAIL/ADMIN_SENHA).
def test_usuario_inicial(client, monkeypatch):
    auth_service.tabela.esvaziar()
    monkeypatch.setenv("ADMIN_EMAIL", "dono@oficina.com.br")
    monkeypatch.setenv("ADMIN_SENHA", "senha-inicial")
    r = client.post("/api/auth/login", json={"email": "dono@oficina.com.br", "senha": "senha-inicial"})
    assert r.status_code == 200
    assert r.json()["usuario"]["perfil"] == "ADMIN"


def test_esqueci_senha_responde_igual_para_qualquer_email(client):
    existe = client.post("/api/auth/esqueci-senha", json={"email": "teste@oficina.com.br"})
    nao_existe = client.post("/api/auth/esqueci-senha", json={"email": "ninguem@oficina.com.br"})
    assert existe.status_code == nao_existe.status_code == 200
    assert existe.json() == nao_existe.json()
    assert len(auth_service.tokens_recuperacao) == 1
    assert next(iter(auth_service.tokens_recuperacao)) not in existe.text


def test_esqueci_senha_com_email_invalido_422(client):
    assert client.post("/api/auth/esqueci-senha", json={"email": "abc"}).status_code == 422
