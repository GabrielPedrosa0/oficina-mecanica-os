# Fixtures dos testes de ordens de serviço, apontamentos, clientes, mecânicos, busca, exportação
# e autenticação.
# O app de teste monta só os routers desses módulos, sem depender do main.py.
# Os routers entram na ordem "ruim" de propósito (ordens antes da exportação): a rota
# /api/ordens-servico/exportar precisa funcionar em qualquer ordem.
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from repositories import (
    acao_os_repository, apontamento_repository, cliente_repository, item_os_repository, item_repository,
    mecanico_repository, ordem_servico_repository, veiculo_repository,
)
from routers import (
    acoes_os, apontamentos, autenticacao, busca, clientes, exportacao, itens, itens_os, mecanicos, ordens_servico,
)
from services import auth_service


@pytest.fixture(autouse=True)
def limpar_dados():
    for repositorio in (acao_os_repository, apontamento_repository, cliente_repository, item_os_repository,
                        item_repository, mecanico_repository, ordem_servico_repository, veiculo_repository):
        repositorio.reiniciar()
    auth_service.usuarios.clear()
    auth_service.sessoes.clear()
    auth_service.tokens_recuperacao.clear()
    auth_service.proximo_usuario_id = 1
    auth_service.criar_usuario("Usuário", "teste@oficina.com.br", "senha-de-teste")


@pytest.fixture
def client():
    app = FastAPI()
    for router in (ordens_servico.router, itens_os.router, acoes_os.router, apontamentos.router, clientes.router,
                   busca.router, autenticacao.router, exportacao.router, mecanicos.router, itens.router):
        app.include_router(router)
    return TestClient(app)


@pytest.fixture
def cliente(client):
    return client.post("/api/clientes", json={"nome": "Marina Souza", "telefone": "85900000001",
                                              "email": "marina@exemplo.com"}).json()


# Os veículos entram direto no repositório: as rotas de veículos são do Integrante 1.
def novo_veiculo(id, placa, marca, modelo, cliente_id, quilometragem=82300):
    veiculo = {"id": id, "placa": placa, "marca": marca, "modelo": modelo, "ano": 2022,
               "quilometragem": quilometragem, "cliente_id": cliente_id}
    veiculo_repository.veiculos[id] = veiculo
    return veiculo


@pytest.fixture
def veiculo(cliente):
    return novo_veiculo(1, "QRS4F21", "Volkswagen", "Gol 1.6", cliente["id"])


@pytest.fixture
def os_corpo(veiculo):
    return {"veiculo_id": veiculo["id"], "quilometragem": 82300, "problema_relatado": "Barulho ao frear",
            "mecanico_id": 1, "data_abertura": "2026-11-11T08:10:00",
            "data_previsao": "2026-11-11T17:00:00", "status": "EM_SERVICO"}
