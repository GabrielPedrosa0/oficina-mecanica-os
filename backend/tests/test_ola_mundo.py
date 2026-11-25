import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from repositories import ola_mundo_repository
from routers import ola_mundo


@pytest.fixture
def client_ola():
    ola_mundo_repository.tabela.esvaziar()
    app = FastAPI()
    app.include_router(ola_mundo.router)
    return TestClient(app)


# Grava uma mensagem e ela aparece na lista.
def test_gravar_e_listar(client_ola):
    criada = client_ola.post("/api/ola-mundo", json={"mensagem": "Olá, mundo!"})
    assert criada.status_code == 201
    assert criada.json()["mensagem"] == "Olá, mundo!"
    assert [m["mensagem"] for m in client_ola.get("/api/ola-mundo").json()] == ["Olá, mundo!"]


# Mensagem vazia (abaixo do limite) e com 121 caracteres (acima do limite) são recusadas.
@pytest.mark.parametrize("mensagem", ["  ", "a" * 121])
def test_mensagem_invalida(client_ola, mensagem):
    assert client_ola.post("/api/ola-mundo", json={"mensagem": mensagem}).status_code == 422
