# Testes da gestão de usuários (/api/usuarios): só o perfil ADMIN (o "Gerente" das telas) acessa.
import pytest

from services import auth_service


def cabecalho(client, email, senha):
    token = client.post("/api/auth/login", json={"email": email, "senha": senha}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin(client):
    auth_service.criar_usuario("Gerente", "gerente@oficina.com.br", "senha-gerente", "ADMIN")
    return cabecalho(client, "gerente@oficina.com.br", "senha-gerente")


def test_so_admin_acessa(client, admin):
    assert client.get("/api/usuarios").status_code == 401
    recepcao = cabecalho(client, "teste@oficina.com.br", "senha-de-teste")
    assert client.get("/api/usuarios", headers=recepcao).status_code == 403
    assert client.get("/api/usuarios", headers=admin).status_code == 200


def test_cadastra_edita_e_exclui(client, admin):
    r = client.post("/api/usuarios", headers=admin,
                    json={"nome": "Rafael", "email": "Rafael@Oficina.com.br", "perfil": "MECANICO", "senha": "12345678"})
    assert r.status_code == 201 and r.json()["email"] == "rafael@oficina.com.br" and "senha" not in r.text
    novo = r.json()
    assert client.post("/api/usuarios", headers=admin, json={**novo, "senha": "12345678"}).status_code == 409
    assert client.post("/api/usuarios", headers=admin,
                       json={"nome": "X", "email": "x@x.com", "perfil": "MECANICO"}).status_code == 422
    r = client.put(f"/api/usuarios/{novo['id']}", headers=admin, json={**novo, "perfil": "RECEPCAO"})
    assert r.json()["perfil"] == "RECEPCAO"
    # Senha nova no PUT passa a valer no login.
    client.put(f"/api/usuarios/{novo['id']}", headers=admin, json={**novo, "senha": "outra-senha"})
    assert client.post("/api/auth/login", json={"email": novo["email"], "senha": "outra-senha"}).status_code == 200
    assert client.delete(f"/api/usuarios/{novo['id']}", headers=admin).status_code == 204


def test_admin_nao_tira_o_proprio_perfil(client, admin):
    eu = client.get("/api/auth/me", headers=admin).json()
    r = client.put(f"/api/usuarios/{eu['id']}", headers=admin, json={**eu, "perfil": "RECEPCAO"})
    assert r.status_code == 409
    assert client.delete(f"/api/usuarios/{eu['id']}", headers=admin).status_code == 409
