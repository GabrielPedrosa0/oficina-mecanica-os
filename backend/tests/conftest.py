# Fixtures dos testes de ordens de serviço, apontamentos, clientes, mecânicos, busca, exportação
# e autenticação.
#
# Os testes usam um PostgreSQL só deles, o do TEST_DATABASE_URL (no ambiente ou no backend/.env).
# No começo, as tabelas desse banco são APAGADAS e criadas de novo a partir de
# banco/modelo_logico_oficina.sql mais as migrações de banco/migracoes/; antes de cada teste,
# elas são esvaziadas.
# Por isso ele nunca pode ser o banco de verdade (DATABASE_URL). Sem TEST_DATABASE_URL, os
# testes são pulados.
#
# O app de teste monta só os routers desses módulos, sem depender do main.py.
# Os routers entram na ordem "ruim" de propósito (ordens antes da exportação): a rota
# /api/ordens-servico/exportar precisa funcionar em qualquer ordem.
import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from database import connection, erros, migrar
from database.criar_tabelas import MODELO, rodar_arquivo
from repositories import (
    acao_os_repository, apontamento_repository, cliente_repository, item_os_repository, item_repository,
    mecanico_repository, ordem_servico_repository, veiculo_repository,
)
from routers import (
    acoes_os, agenda, apontamentos, autenticacao, busca, clientes, exportacao, itens, itens_os, mecanicos,
    ordens_servico, pecas, servicos, usuarios, veiculos,
)
from services import auth_service

connection._carregar_env()
URL_TESTE = os.environ.get("TEST_DATABASE_URL")


@pytest.fixture(scope="session", autouse=True)
def banco_de_teste():
    if not URL_TESTE:
        pytest.skip("Defina TEST_DATABASE_URL (um banco só para testes) para rodar os testes.")
    if URL_TESTE == os.environ.get("DATABASE_URL"):
        pytest.exit("TEST_DATABASE_URL é igual ao DATABASE_URL: os testes apagariam o banco de verdade.")
    connection.usar_url(URL_TESTE)
    connection.executar("DROP SCHEMA public CASCADE")
    connection.executar("CREATE SCHEMA public")
    rodar_arquivo(MODELO)
    migrar.aplicar_pendentes()
    yield


@pytest.fixture(autouse=True)
def limpar_dados(banco_de_teste):
    for repositorio in (acao_os_repository, apontamento_repository, cliente_repository, item_os_repository,
                        item_repository, mecanico_repository, ordem_servico_repository, veiculo_repository):
        repositorio.reiniciar()
    auth_service.tabela.esvaziar()
    auth_service.tokens_recuperacao.clear()
    auth_service.criar_usuario("Usuário", "teste@oficina.com.br", "senha-de-teste")


@pytest.fixture
def client():
    app = FastAPI()
    erros.registrar(app)
    for router in (ordens_servico.router, itens_os.router, acoes_os.router, apontamentos.router, clientes.router,
                   busca.router, autenticacao.router, exportacao.router, mecanicos.router, itens.router,
                   agenda.router, servicos.router, pecas.router, usuarios.router, veiculos.router):
        app.include_router(router)
    return TestClient(app)


@pytest.fixture
def cliente(client):
    return client.post("/api/clientes", json={"nome": "Marina Souza", "telefone": "85900000001",
                                              "email": "marina@exemplo.com"}).json()


# Os veículos entram direto no repositório: as rotas de veículos são do Integrante 1.
def novo_veiculo(id, placa, marca, modelo, cliente_id, quilometragem=82300):
    return veiculo_repository.criar_com_id(id, {"placa": placa, "marca": marca, "modelo": modelo, "ano": 2022,
                                                "quilometragem": quilometragem, "cliente_id": cliente_id})


# O valor total da OS vem da soma dos itens (visão vw_os_total). Para um teste que só precisa
# de um total, lança uma peça com esse valor (peça não muda a coluna "Serviço" da OS).
def definir_valor_total(os_id, valor):
    item_os_repository.criar({"os_id": os_id, "item_id": 1, "descricao": "Peça de teste",
                              "quantidade": 1, "valor_unitario": valor})


# Muda o status direto no banco, sem passar pelas regras de transição.
def definir_status(os_id, status):
    ordem_servico_repository.atualizar(os_id, {"status": status})


@pytest.fixture
def veiculo(cliente):
    return novo_veiculo(1, "QRS4F21", "Volkswagen", "Gol 1.6", cliente["id"])


@pytest.fixture
def os_corpo(veiculo):
    return {"veiculo_id": veiculo["id"], "quilometragem": 82300, "problema_relatado": "Barulho ao frear",
            "mecanico_id": 1, "data_abertura": "2026-11-11T08:10:00",
            "data_previsao": "2026-11-11T17:00:00", "status": "EM_SERVICO"}
