# Testes do painel. O dia fica fixo em 11/11/2026 às 10:00 (horário da oficina), o mesmo dia das datas do os_corpo do conftest.
from datetime import datetime

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers import clientes, dashboard, ordens_servico
from services import dashboard_service
from tests.conftest import cobrar

AGORA = datetime(2026, 11, 11, 10, 0)


# App só com o que o painel precisa: clientes (para o fixture `cliente`), ordens e dashboard. Substitui o `client` do conftest só neste arquivo.
@pytest.fixture
def client():
    app = FastAPI()
    for router in (clientes.router, ordens_servico.router, dashboard.router):
        app.include_router(router)
    return TestClient(app)


@pytest.fixture(autouse=True)
def dia_fixo(monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: AGORA)


# valor_total e servico não vão no corpo da OS: viram um serviço incluído na OS.
def nova_os(client, os_corpo, valor_total=None, servico=None, **mudancas):
    r = client.post("/api/ordens-servico", json={**os_corpo, **mudancas})
    assert r.status_code == 201, r.text
    if valor_total is not None or servico is not None:
        cobrar(r.json()["id"], valor_total or 0, servico)
    return r.json()


def test_resumo_conta_por_status_e_soma_faturamento_do_mes(client, os_corpo):
    nova_os(client, os_corpo)   # em serviço, previsão hoje
    nova_os(client, os_corpo, data_previsao="2026-11-12T17:00:00")  # em serviço, amanhã
    nova_os(client, os_corpo, status="AGUARDANDO_PECA", data_abertura="2026-11-05T08:00:00",
            data_previsao="2026-11-10T17:00:00")      # atrasada
    nova_os(client, os_corpo, status="AGUARDANDO_PECA", data_previsao="2026-11-14T17:00:00")
    nova_os(client, os_corpo, status="PRONTA")
    nova_os(client, os_corpo, status="ENTREGUE", data_abertura="2026-11-02T08:00:00",
            data_previsao=None, data_conclusao="2026-11-03T16:00:00", valor_total=1000.10)
    nova_os(client, os_corpo, status="ENTREGUE", data_abertura="2026-10-20T08:00:00",
            data_previsao=None, data_conclusao="2026-10-31T16:00:00", valor_total=500) # mês passado
    nova_os(client, os_corpo, status="ENTREGUE", valor_total=99)  # sem conclusão

    r = client.get("/api/dashboard/resumo")
    assert r.status_code == 200
    assert r.json() == {
        "em_servico": 2, "em_servico_previsao_hoje": 1,
        "aguardando_peca": 2, "aguardando_peca_atrasadas": 1,
        "prontas": 1, "faturamento_mes": 1000.10,
        "mes_referencia": "2026-11", "gerado_em": "2026-11-11T10:00:00",
    }


def test_resumo_sem_ordens(client):
    r = client.get("/api/dashboard/resumo").json()
    assert r["em_servico"] == r["aguardando_peca"] == r["prontas"] == 0
    assert r["faturamento_mes"] == 0


def test_resumo_esconde_faturamento_de_quem_nao_pode_ver(client, os_corpo):
    client.app.dependency_overrides[dashboard_service.pode_ver_faturamento] = lambda: False
    assert client.get("/api/dashboard/resumo").json()["faturamento_mes"] is None


def test_entregas_de_hoje_em_ordem_de_previsao(client, os_corpo):
    nova_os(client, os_corpo, data_previsao="2026-11-11T17:00:00", servico="Troca de óleo")
    nova_os(client, os_corpo, data_previsao="2026-11-11T11:30:00", problema_relatado="Freio rangendo")
    nova_os(client, os_corpo, data_previsao="2026-11-12T09:00:00")  # amanhã
    nova_os(client, os_corpo, status="ENTREGUE", data_conclusao="2026-11-11T09:00:00") # já entregue

    r = client.get("/api/dashboard/entregas-hoje").json()
    assert r["data"] == "2026-11-11"
    assert r["total"] == 2
    assert r["tem_mais"] is False
    assert r["mensagem_vazia"] is None
    assert [o["id"] for o in r["itens"]] == [2, 1]
    assert [o["servico_resumo"] for o in r["itens"]] == ["Freio rangendo", "Troca de óleo"]
    assert r["itens"][0]["placa"] == "QRS4F21"
    assert r["itens"][0]["cliente_nome"] == "Marina Souza"


def test_entregas_de_hoje_paginadas(client, os_corpo):
    for hora in range(11, 16):
        nova_os(client, os_corpo, data_previsao=f"2026-11-11T{hora}:00:00")

    primeira = client.get("/api/dashboard/entregas-hoje?limite=2").json()
    assert [o["id"] for o in primeira["itens"]] == [1, 2]
    assert primeira["total"] == 5 and primeira["tem_mais"] is True

    ultima = client.get("/api/dashboard/entregas-hoje?limite=2&offset=4").json()
    assert [o["id"] for o in ultima["itens"]] == [5]
    assert ultima["tem_mais"] is False


def test_entregas_de_hoje_vazia(client):
    r = client.get("/api/dashboard/entregas-hoje").json()
    assert r["itens"] == [] and r["total"] == 0
    assert r["mensagem_vazia"] == "Nenhuma entrega prevista para hoje."


def test_ordens_recentes_ignoram_entregues(client, os_corpo):
    nova_os(client, os_corpo, data_abertura="2026-11-09T08:00:00")
    nova_os(client, os_corpo, data_abertura="2026-11-11T08:00:00", status="ORCAMENTO")
    nova_os(client, os_corpo, data_abertura="2026-11-10T08:00:00", status="ENTREGUE",
            data_conclusao="2026-11-10T18:00:00")
    nova_os(client, os_corpo, data_abertura="2026-11-10T08:00:00", status="PRONTA")

    r = client.get("/api/dashboard/ordens-recentes").json()
    assert [o["id"] for o in r["itens"]] == [2, 4, 1]
    assert r["total"] == 3

    assert [o["id"] for o in client.get("/api/dashboard/ordens-recentes?limite=1").json()["itens"]] == [2]


@pytest.mark.parametrize("url", [
    "/api/dashboard/entregas-hoje?limite=0",
    "/api/dashboard/entregas-hoje?limite=101",
    "/api/dashboard/entregas-hoje?offset=-1",
    "/api/dashboard/ordens-recentes?limite=51",
])
def test_limites_invalidos(client, url):
    assert client.get(url).status_code == 422


def test_servico_longo_e_resumido(client, os_corpo):
    nova_os(client, os_corpo, servico="Revisão completa " * 7)  # 119 letras (a coluna aceita 120)
    resumo = client.get("/api/dashboard/ordens-recentes").json()["itens"][0]["servico_resumo"]
    assert len(resumo) <= 60 and resumo.endswith("…")


def test_virada_do_mes_e_do_ano():
    assert dashboard_service.limites_do_mes(datetime(2026, 12, 15, 9, 0)) == (
        datetime(2026, 12, 1), datetime(2027, 1, 1))
    assert dashboard_service.limites_do_dia(datetime(2026, 11, 30, 23, 59)) == (
        datetime(2026, 11, 30), datetime(2026, 12, 1))