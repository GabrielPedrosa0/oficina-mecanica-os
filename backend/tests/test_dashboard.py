# Testes das regras do painel (services/dashboard_service.py).
# Técnicas: partição de equivalência (valores válidos e inválidos) e
# análise de valor limite (os valores na beirada de cada regra).
# O dia fica fixo em 11/11/2026 às 10:00 (horário da oficina).
from datetime import datetime

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from repositories import ordem_servico_repository
from routers import clientes, dashboard, ordens_servico
from services import dashboard_service

AGORA = datetime(2026, 11, 11, 10, 0)


# App só com o que o painel precisa: clientes, ordens e dashboard.
@pytest.fixture
def client():
    app = FastAPI()
    for router in (clientes.router, ordens_servico.router, dashboard.router):
        app.include_router(router)
    return TestClient(app)


@pytest.fixture(autouse=True)
def dia_fixo(monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: AGORA)


# Abre a OS no começo do mês, para qualquer previsão de novembro ser aceita.
def nova_os(client, os_corpo, **mudancas):
    corpo = {**os_corpo, "data_abertura": "2026-11-01T00:00:00", **mudancas}
    r = client.post("/api/ordens-servico", json=corpo)
    assert r.status_code == 201, r.text
    return r.json()


# Resumo sem nenhuma OS: tudo zero.
def test_resumo_vazio(client):
    r = client.get("/api/dashboard/resumo")
    assert r.status_code == 200
    assert r.json() == {
        "em_servico": 0, "em_servico_previsao_hoje": 0, "aguardando_peca": 0,
        "aguardando_peca_atrasadas": 0, "prontas": 0, "faturamento_mes": 0,
        "mes_referencia": "2026-11", "gerado_em": "2026-11-11T10:00:00",
    }


# Regra da contagem por status: cada indicador conta só o seu status.
@pytest.mark.parametrize("status, campo", [
    ("EM_SERVICO", "em_servico"),
    ("AGUARDANDO_PECA", "aguardando_peca"),
    ("PRONTA", "prontas"),
], ids=["em-servico", "aguardando-peca", "pronta"])
def test_resumo_por_status(client, os_corpo, status, campo):
    nova_os(client, os_corpo, status=status)
    nova_os(client, os_corpo, status="ORCAMENTO")   # não entra em nenhum indicador
    r = client.get("/api/dashboard/resumo").json()
    assert r[campo] == 1
    assert r["em_servico"] + r["aguardando_peca"] + r["prontas"] == 1


# Regra "previsão para hoje" (de 00:00 de hoje até antes de 00:00 de amanhã).
# Limites: 1 segundo antes e depois de cada ponta, e sem previsão.
@pytest.mark.parametrize("previsao, conta", [
    ("2026-11-10T23:59:59", 0),
    ("2026-11-11T00:00:00", 1),
    ("2026-11-11T23:59:59", 1),
    ("2026-11-12T00:00:00", 0),
    (None, 0),
], ids=["ontem-23h59", "hoje-00h00", "hoje-23h59", "amanha-00h00", "sem-previsao"])
def test_previsao_hoje(client, os_corpo, previsao, conta):
    nova_os(client, os_corpo, status="EM_SERVICO", data_previsao=previsao)
    assert client.get("/api/dashboard/resumo").json()["em_servico_previsao_hoje"] == conta


# Regra "aguardando peça atrasada": a previsão já passou de agora (10:00).
# Limites: 1 segundo antes (atrasada), o próprio momento (não) e sem previsão (não).
@pytest.mark.parametrize("previsao, conta", [
    ("2026-11-11T09:59:59", 1),
    ("2026-11-11T10:00:00", 0),
    (None, 0),
], ids=["09h59m59", "10h00", "sem-previsao"])
def test_atrasadas(client, os_corpo, previsao, conta):
    nova_os(client, os_corpo, status="AGUARDANDO_PECA", data_previsao=previsao)
    assert client.get("/api/dashboard/resumo").json()["aguardando_peca_atrasadas"] == conta


# Regra do faturamento: soma o valor total das OS ENTREGUE concluídas neste mês.
# Limites do mês (1 segundo antes e depois de cada ponta), sem conclusão e outro status.
# O valor total vem dos itens da OS; aqui ele entra direto na OS gravada.
@pytest.mark.parametrize("status, conclusao, faturamento", [
    ("ENTREGUE", "2026-10-31T23:59:59", 0),
    ("ENTREGUE", "2026-11-01T00:00:00", 100.10),
    ("ENTREGUE", "2026-11-30T23:59:59", 100.10),
    ("ENTREGUE", "2026-12-01T00:00:00", 0),
    ("ENTREGUE", None, 0),
    ("PRONTA", "2026-11-05T00:00:00", 0),
], ids=["outubro-fim", "novembro-inicio", "novembro-fim", "dezembro-inicio", "sem-conclusao", "nao-entregue"])
def test_faturamento(client, os_corpo, status, conclusao, faturamento):
    abertura = "2026-10-01T00:00:00"
    os_ = nova_os(client, os_corpo, status=status, data_abertura=abertura, data_previsao=None,
                  data_conclusao=conclusao)
    ordem_servico_repository.ordens[os_["id"]]["valor_total"] = 100.10
    assert client.get("/api/dashboard/resumo").json()["faturamento_mes"] == faturamento


# Regra de quem vê o faturamento: quem não pode ver recebe null.
def test_faturamento_escondido(client, os_corpo):
    client.app.dependency_overrides[dashboard_service.pode_ver_faturamento] = lambda: False
    assert client.get("/api/dashboard/resumo").json()["faturamento_mes"] is None


# Entregas de hoje: só OS abertas com previsão hoje, da mais cedo para a mais tarde,
# com placa, cliente e resumo do serviço (sem serviço, o problema relatado).
def test_entregas_hoje(client, os_corpo):
    nova_os(client, os_corpo, data_previsao="2026-11-11T17:00:00")
    nova_os(client, os_corpo, data_previsao="2026-11-11T11:30:00", problema_relatado="Freio rangendo")
    nova_os(client, os_corpo, data_previsao="2026-11-12T09:00:00")    # amanhã
    nova_os(client, os_corpo, status="ENTREGUE", data_previsao="2026-11-11T12:00:00")  # já entregue
    r = client.get("/api/dashboard/entregas-hoje").json()
    assert r["data"] == "2026-11-11"
    assert r["total"] == 2
    assert r["mensagem_vazia"] is None
    assert [o["id"] for o in r["itens"]] == [2, 1]
    assert r["itens"][0]["servico_resumo"] == "Freio rangendo"
    assert r["itens"][0]["placa"] == "QRS4F21"
    assert r["itens"][0]["cliente_nome"] == "Marina Souza"


# Entregas de hoje sem nenhuma: lista vazia e o texto do estado vazio.
def test_entregas_hoje_vazia(client):
    r = client.get("/api/dashboard/entregas-hoje").json()
    assert r["itens"] == [] and r["total"] == 0
    assert r["mensagem_vazia"] == "Nenhuma entrega prevista para hoje."


# Regra das páginas (5 entregas): tem_mais é true enquanto sobra item.
# Limites: a página que termina no 4º item (sobra 1) e a que termina no 5º (não sobra).
@pytest.mark.parametrize("query, ids, tem_mais", [
    ("?limite=2", [1, 2], True),
    ("?limite=4", [1, 2, 3, 4], True),
    ("?limite=5", [1, 2, 3, 4, 5], False),
    ("?limite=2&offset=4", [5], False),
    ("?offset=5", [], False),
], ids=["primeira-pagina", "sobra-1", "exata", "ultima-pagina", "depois-do-fim"])
def test_entregas_paginas(client, os_corpo, query, ids, tem_mais):
    for hora in range(11, 16):
        nova_os(client, os_corpo, data_previsao=f"2026-11-11T{hora}:00:00")
    r = client.get(f"/api/dashboard/entregas-hoje{query}").json()
    assert [o["id"] for o in r["itens"]] == ids
    assert r["tem_mais"] is tem_mais


# Ordens recentes: só as abertas, da abertura mais nova para a mais antiga.
def test_ordens_recentes(client, os_corpo):
    nova_os(client, os_corpo, data_abertura="2026-11-09T08:00:00", data_previsao=None)
    nova_os(client, os_corpo, data_abertura="2026-11-11T08:00:00", data_previsao=None, status="ORCAMENTO")
    nova_os(client, os_corpo, data_abertura="2026-11-10T08:00:00", data_previsao=None, status="ENTREGUE")
    nova_os(client, os_corpo, data_abertura="2026-11-10T08:00:00", data_previsao=None, status="PRONTA")
    r = client.get("/api/dashboard/ordens-recentes").json()
    assert [o["id"] for o in r["itens"]] == [2, 4, 1]
    assert r["total"] == 3
    assert [o["id"] for o in client.get("/api/dashboard/ordens-recentes?limite=1").json()["itens"]] == [2]


# Regra dos limites das listas. Entregas: limite de 1 a 100 e offset a partir de 0.
# Recentes: limite de 1 a 50. Os valores na beirada passam; logo fora, 422.
@pytest.mark.parametrize("url, status", [
    ("/api/dashboard/entregas-hoje?limite=1", 200),
    ("/api/dashboard/entregas-hoje?limite=100", 200),
    ("/api/dashboard/entregas-hoje?limite=0", 422),
    ("/api/dashboard/entregas-hoje?limite=101", 422),
    ("/api/dashboard/entregas-hoje?offset=0", 200),
    ("/api/dashboard/entregas-hoje?offset=-1", 422),
    ("/api/dashboard/ordens-recentes?limite=1", 200),
    ("/api/dashboard/ordens-recentes?limite=50", 200),
    ("/api/dashboard/ordens-recentes?limite=0", 422),
    ("/api/dashboard/ordens-recentes?limite=51", 422),
], ids=["entregas-limite-1", "entregas-limite-100", "entregas-limite-0", "entregas-limite-101",
        "offset-0", "offset-menos-1", "recentes-limite-1", "recentes-limite-50",
        "recentes-limite-0", "recentes-limite-51"])
def test_limites(client, url, status):
    assert client.get(url).status_code == status


# Regra do resumo do serviço: até 60 caracteres fica igual; com 61 é cortado e termina com "…".
@pytest.mark.parametrize("tamanho, cortado", [(60, False), (61, True)], ids=["60", "61"])
def test_resumo_do_servico(client, os_corpo, tamanho, cortado):
    nova_os(client, os_corpo, problema_relatado="x" * tamanho)
    resumo = client.get("/api/dashboard/ordens-recentes").json()["itens"][0]["servico_resumo"]
    assert len(resumo) <= 60
    assert resumo.endswith("…") is cortado


# Limites do dia e do mês, inclusive na virada de dezembro para janeiro.
@pytest.mark.parametrize("funcao, momento, esperado", [
    ("limites_do_mes", datetime(2026, 11, 15, 9, 0), (datetime(2026, 11, 1), datetime(2026, 12, 1))),
    ("limites_do_mes", datetime(2026, 12, 15, 9, 0), (datetime(2026, 12, 1), datetime(2027, 1, 1))),
    ("limites_do_dia", datetime(2026, 11, 30, 23, 59), (datetime(2026, 11, 30), datetime(2026, 12, 1))),
    ("limites_do_dia", datetime(2026, 12, 31, 0, 0), (datetime(2026, 12, 31), datetime(2027, 1, 1))),
], ids=["mes-comum", "dezembro", "ultimo-dia-do-mes", "ultimo-dia-do-ano"])
def test_viradas(funcao, momento, esperado):
    assert getattr(dashboard_service, funcao)(momento) == esperado
