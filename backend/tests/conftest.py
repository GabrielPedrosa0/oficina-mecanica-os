# Fixtures dos testes de ordens de serviço, clientes, busca, exportação e autenticação.
# Os testes usam um PostgreSQL de verdade, com as tabelas de banco/modelo_logico_oficina.sql.
# Antes de rodar, defina DATABASE_URL apontando para um banco DE TESTE (ele é apagado
# a cada teste), por exemplo:
#   export DATABASE_URL=postgresql://oficina:oficina@localhost:5432/oficina_teste
# O app de teste monta só os routers desses módulos, sem depender do main.py.
# Os routers entram na ordem "ruim" de propósito (ordens antes da exportação): a rota
# /api/ordens-servico/exportar precisa funcionar em qualquer ordem.
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from repositories import (cliente_repository, item_os_repository, mecanico_repository,
                          ordem_servico_repository, veiculo_repository)
from routers import autenticacao, busca, clientes, exportacao, ordens_servico
from services import auth_service


@pytest.fixture(autouse=True)
def limpar_dados():
    for repositorio in (cliente_repository, ordem_servico_repository, veiculo_repository,
                        mecanico_repository, item_os_repository):
        repositorio.reiniciar()
    auth_service.usuarios.clear()
    auth_service.sessoes.clear()
    auth_service.tokens_recuperacao.clear()
    auth_service.proximo_usuario_id = 1
    auth_service.criar_usuario("Usuário", "teste@oficina.com.br", "senha-de-teste")


@pytest.fixture
def client():
    app = FastAPI()
    for router in (ordens_servico.router, clientes.router, busca.router, autenticacao.router, exportacao.router):
        app.include_router(router)
    return TestClient(app)


@pytest.fixture
def cliente(client):
    return client.post("/api/clientes", json={"nome": "Marina Souza", "telefone": "85900000001",
                                              "email": "marina@exemplo.com"}).json()


# Os veículos entram direto no repositório: as rotas de veículos são do Integrante 1.
# O id é dado pelo banco (1, 2, 3... porque cada teste começa com o banco limpo).
def novo_veiculo(placa, marca, modelo, cliente_id, quilometragem=82300):
    return veiculo_repository.criar({"placa": placa, "marca": marca, "modelo": modelo, "ano": 2022,
                                     "quilometragem": quilometragem, "cliente_id": cliente_id})


# O valor total da OS não vai mais no corpo: é a soma dos itens (visão vw_os_total).
# Para os testes, esta função inclui na OS um serviço com o valor pedido.
def cobrar(ordem_id, valor, descricao=None):
    servico = item_os_repository.criar_servico(descricao or f"Serviço de teste da OS {ordem_id}")
    item_os_repository.adicionar_servico(ordem_id, {"servico_id": servico["id"], "quantidade": 1,
                                                    "valor_cobrado": valor})


@pytest.fixture
def veiculo(cliente):
    return novo_veiculo("QRS4F21", "Volkswagen", "Gol 1.6", cliente["id"])


@pytest.fixture
def mecanico():
    return mecanico_repository.criar({"nome": "Rafael"})


@pytest.fixture
def os_corpo(veiculo, mecanico):
    return {"veiculo_id": veiculo["id"], "quilometragem": 82300, "problema_relatado": "Barulho ao frear",
            "mecanico_id": mecanico["id"], "data_abertura": "2026-11-11T08:10:00",
            "data_previsao": "2026-11-11T17:00:00", "status": "EM_SERVICO"}
