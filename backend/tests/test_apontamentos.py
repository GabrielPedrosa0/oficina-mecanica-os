from datetime import datetime

import pytest

from services import dashboard_service

AGORA = datetime(2026, 11, 21, 10, 15, 0)
APONTAMENTO = {"tipo": "EXECUCAO", "descricao": "Óleo e filtros trocados; testando vazamentos."}


# Fixa o "agora" para a data do apontamento ser conhecida.
@pytest.fixture(autouse=True)
def relogio(monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: AGORA)


@pytest.fixture
def os_(client, os_corpo):
    return client.post("/api/ordens-servico", json=os_corpo).json()


def registrar(client, os_id=1, **mudanca):
    return client.post(f"/api/ordens-servico/{os_id}/apontamentos", json={**APONTAMENTO, **mudanca})


def listar(client, os_id=1):
    return client.get(f"/api/ordens-servico/{os_id}/apontamentos")


# Registrar devolve 201 com o apontamento completo: a OS vem do endereço e a data é a de agora.
def test_registrar(client, os_):
    r = registrar(client)
    assert r.status_code == 201
    assert r.json() == {"id": 1, "os_id": 1, "data": "2026-11-21T10:15:00", **APONTAMENTO}
    assert listar(client).json() == [r.json()]


# OS sem apontamentos devolve lista vazia.
def test_listar_vazia(client, os_):
    r = listar(client)
    assert r.status_code == 200
    assert r.json() == []


# A lista vem do mais novo para o mais antigo; com a mesma data, o registrado por último vem primeiro.
def test_listar_ordem(client, os_, monkeypatch):
    registrar(client, descricao="Primeiro")
    monkeypatch.setattr(dashboard_service, "agora", lambda: datetime(2026, 11, 21, 11, 0, 0))
    registrar(client, descricao="Segundo")
    registrar(client, descricao="Terceiro")  # mesma data do segundo
    assert [a["descricao"] for a in listar(client).json()] == ["Terceiro", "Segundo", "Primeiro"]


# Cada OS só vê os seus apontamentos.
def test_listar_so_da_os(client, os_, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)  # OS 2
    registrar(client, 1, descricao="Da OS 1")
    registrar(client, 2, descricao="Da OS 2")
    assert [a["descricao"] for a in listar(client, 1).json()] == ["Da OS 1"]
    assert [a["descricao"] for a in listar(client, 2).json()] == ["Da OS 2"]


# OS que não existe: 404 ao listar e ao registrar.
def test_os_inexistente(client):
    for r in (listar(client, 99), registrar(client, 99)):
        assert r.status_code == 404
        assert r.json()["detail"] == "Ordem de serviço não encontrada."


# Tipo: só os 5 que a pessoa escolhe (válidos). Os 3 que o sistema registra sozinho,
# um que não existe e um em minúsculas são recusados com 422.
@pytest.mark.parametrize("tipo, esperado", [
    ("DIAGNOSTICO", 201),
    ("APROVACAO", 201),
    ("EXECUCAO", 201),
    ("PECA", 201),
    ("OBSERVACAO", 201),
    ("ABERTURA", 422),
    ("ORCAMENTO", 422),
    ("ENTREGA", 422),
    ("CONSERTO", 422),
    ("execucao", 422),
])
def test_tipo(client, os_, tipo, esperado):
    assert registrar(client, tipo=tipo).status_code == esperado


# "O que foi feito": de 1 a 500 letras é válido; vazio, só espaços e 501 letras são 422.
# Os espaços das pontas não contam (são tirados antes de gravar).
@pytest.mark.parametrize("descricao, esperado", [
    ("", 422),
    ("   ", 422),
    ("a", 201),
    ("a" * 500, 201),
    ("  " + "a" * 500 + "  ", 201),
    ("a" * 501, 422),
])
def test_descricao(client, os_, descricao, esperado):
    r = registrar(client, descricao=descricao)
    assert r.status_code == esperado
    if esperado == 201:
        assert r.json()["descricao"] == descricao.strip()
    else:
        assert listar(client).json() == []


# As mensagens de erro da descrição vêm em português, prontas para a tela mostrar.
def test_descricao_mensagens(client, os_):
    assert registrar(client, descricao="  ").json()["detail"] == "Escreva o que foi feito."
    assert registrar(client, descricao="a" * 501).json()["detail"] == "O que foi feito deve ter até 500 letras."


# Tipo ou descrição faltando no corpo: 422.
def test_campos_obrigatorios(client, os_):
    url = "/api/ordens-servico/1/apontamentos"
    assert client.post(url, json={"tipo": "EXECUCAO"}).status_code == 422
    assert client.post(url, json={"descricao": "Troca de óleo"}).status_code == 422


# OS entregue é só para leitura (409); nos outros status pode registrar.
@pytest.mark.parametrize("status, esperado", [
    ("ORCAMENTO", 201),
    ("EM_SERVICO", 201),
    ("AGUARDANDO_PECA", 201),
    ("PRONTA", 201),
    ("ENTREGUE", 409),
])
def test_os_entregue(client, os_corpo, status, esperado):
    client.post("/api/ordens-servico", json={**os_corpo, "status": status})
    r = registrar(client)
    assert r.status_code == esperado
    if esperado == 409:
        assert r.json()["detail"] == "A OS já foi entregue: os apontamentos são só para leitura."
        assert listar(client).status_code == 200  # ler continua permitido


# OS cancelada também é só para leitura (409), mas ler continua permitido.
def test_os_cancelada(client, os_corpo):
    client.post("/api/ordens-servico", json={**os_corpo, "status": "CANCELADA"})
    r = registrar(client)
    assert r.status_code == 409
    assert r.json()["detail"] == "A OS foi cancelada: os apontamentos são só para leitura."
    assert listar(client).status_code == 200
