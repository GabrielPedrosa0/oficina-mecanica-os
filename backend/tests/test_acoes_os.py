from datetime import datetime

import pytest

from services import dashboard_service
from tests.conftest import definir_valor_total


def nova_os(client, os_corpo, **mudanca):
    return client.post("/api/ordens-servico", json={**os_corpo, **mudanca}).json()


def mudar(client, status, id=1):
    return client.patch(f"/api/ordens-servico/{id}/status", json={"status": status})


# --- Status (PATCH) ---

def test_caminho_completo_da_os(client, os_corpo):
    nova_os(client, os_corpo, status="ORCAMENTO")
    for status in ("EM_SERVICO", "AGUARDANDO_PECA", "EM_SERVICO", "PRONTA", "ENTREGUE"):
        r = mudar(client, status)
        assert r.status_code == 200
        assert r.json()["status"] == status
    assert client.get("/api/ordens-servico/1").json()["status"] == "ENTREGUE"


def test_status_devolve_a_os_completa(client, os_corpo):
    nova_os(client, os_corpo)
    os_ = mudar(client, "PRONTA").json()
    assert os_["placa"] == "QRS4F21"
    assert os_["cliente_nome"] == "Marina Souza"
    assert os_["mecanico_id"] == 1  # os outros campos ficam como estavam


# Cancelar: o cliente recusou o orçamento. A OS fica guardada como histórico.
def test_cancelar(client, os_corpo):
    nova_os(client, os_corpo, status="ORCAMENTO")
    r = mudar(client, "CANCELADA")
    assert r.status_code == 200
    assert r.json()["status"] == "CANCELADA"
    assert client.get("/api/ordens-servico/1").json()["status"] == "CANCELADA"


@pytest.mark.parametrize("de, para", [
    ("ORCAMENTO", "PRONTA"),
    ("ORCAMENTO", "ENTREGUE"),
    ("EM_SERVICO", "ENTREGUE"),
    ("EM_SERVICO", "ORCAMENTO"),
    ("EM_SERVICO", "EM_SERVICO"),
    ("AGUARDANDO_PECA", "PRONTA"),
    ("PRONTA", "ORCAMENTO"),
    ("ENTREGUE", "EM_SERVICO"),
    ("ENTREGUE", "PRONTA"),
    # Só se cancela no ORCAMENTO; e de CANCELADA não se sai.
    ("EM_SERVICO", "CANCELADA"),
    ("AGUARDANDO_PECA", "CANCELADA"),
    ("PRONTA", "CANCELADA"),
    ("ENTREGUE", "CANCELADA"),
    ("CANCELADA", "ORCAMENTO"),
    ("CANCELADA", "EM_SERVICO"),
])
def test_transicao_proibida_409_e_nao_altera(client, os_corpo, de, para):
    nova_os(client, os_corpo, status=de)
    r = mudar(client, para)
    assert r.status_code == 409
    assert r.json()["detail"] == f"Não é possível mudar a OS de {de} para {para}."
    assert client.get("/api/ordens-servico/1").json()["status"] == de


def test_status_invalido_ou_ausente_422(client, os_corpo):
    nova_os(client, os_corpo)
    assert mudar(client, "QUEBRADA").status_code == 422
    assert client.patch("/api/ordens-servico/1/status", json={}).status_code == 422


def test_acoes_em_os_inexistente_404(client):
    for r in (mudar(client, "PRONTA", 99),
              client.post("/api/ordens-servico/99/marcar-pronta"),
              client.post("/api/ordens-servico/99/enviar-orcamento")):
        assert r.status_code == 404
        assert r.json()["detail"] == "Ordem de serviço não encontrada."


# --- Entregar: data de conclusão ---

def test_entregar_grava_a_data_de_conclusao(client, os_corpo, monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: datetime(2026, 11, 20, 10, 30, 0))
    nova_os(client, os_corpo, status="PRONTA")
    r = mudar(client, "ENTREGUE")
    assert r.json()["data_conclusao"] == "2026-11-20T10:30:00"


def test_entregar_mantem_a_data_de_conclusao_que_ja_existe(client, os_corpo, monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: datetime(2026, 11, 20, 10, 30, 0))
    nova_os(client, os_corpo, status="PRONTA", data_conclusao="2026-11-11T16:00:00")
    assert mudar(client, "ENTREGUE").json()["data_conclusao"] == "2026-11-11T16:00:00"


def test_data_de_conclusao_nunca_fica_antes_da_abertura(client, os_corpo, monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: datetime(2026, 11, 1, 8, 0, 0))
    nova_os(client, os_corpo, status="PRONTA")  # aberta em 11/11
    assert mudar(client, "ENTREGUE").json()["data_conclusao"] == "2026-11-11T08:10:00"


def test_os_entregue_entra_no_faturamento_do_painel(client, os_corpo, monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: datetime(2026, 11, 20, 10, 30, 0))
    nova_os(client, os_corpo, status="PRONTA")
    # O valor total não vai no corpo da OS: vem dos itens (aqui, um item de R$ 340).
    definir_valor_total(1, 340)
    assert dashboard_service.obter_resumo(True)["faturamento_mes"] == 0
    mudar(client, "ENTREGUE")
    assert dashboard_service.obter_resumo(True)["faturamento_mes"] == 340.0


# --- Marcar pronta ---

def test_marcar_pronta(client, os_corpo):
    nova_os(client, os_corpo)  # EM_SERVICO
    r = client.post("/api/ordens-servico/1/marcar-pronta")
    assert r.status_code == 200
    assert r.json()["status"] == "PRONTA"
    assert client.get("/api/ordens-servico/1").json()["status"] == "PRONTA"


@pytest.mark.parametrize("de", ["ORCAMENTO", "AGUARDANDO_PECA", "PRONTA", "ENTREGUE", "CANCELADA"])
def test_marcar_pronta_fora_do_momento_409(client, os_corpo, de):
    nova_os(client, os_corpo, status=de)
    r = client.post("/api/ordens-servico/1/marcar-pronta")
    assert r.status_code == 409
    assert client.get("/api/ordens-servico/1").json()["status"] == de


# --- Enviar orçamento ---

# item_id 1 = Peça e 2 = Serviço, os itens que o catálogo já traz.
def adicionar(client, valor, item_id=2, quantidade=1):
    client.post("/api/ordens-servico/1/itens",
                json={"item_id": item_id, "descricao": "Item", "quantidade": quantidade, "valor_unitario": valor})


def test_enviar_orcamento_registra_o_envio_e_soma_os_itens(client, os_corpo, monkeypatch):
    monkeypatch.setattr(dashboard_service, "agora", lambda: datetime(2026, 11, 12, 9, 0, 0))
    nova_os(client, os_corpo, status="ORCAMENTO")
    adicionar(client, 150)
    adicionar(client, 95.25, item_id=1, quantidade=2)  # 2 × 95,25 = 190,50
    r = client.post("/api/ordens-servico/1/enviar-orcamento")
    assert r.status_code == 200
    corpo = r.json()
    assert corpo["orcamento_enviado_em"] == "2026-11-12T09:00:00"
    assert corpo["valor_orcamento"] == 340.5
    assert corpo["id"] == 1 and corpo["status"] == "ORCAMENTO"  # o status não muda


def test_enviar_orcamento_sem_itens_409(client, os_corpo):
    nova_os(client, os_corpo)
    r = client.post("/api/ordens-servico/1/enviar-orcamento")
    assert r.status_code == 409
    assert "ao menos um item" in r.json()["detail"]


@pytest.mark.parametrize("status", ["PRONTA", "ENTREGUE"])
def test_enviar_orcamento_de_os_concluida_409(client, os_corpo, status):
    nova_os(client, os_corpo, status=status)
    adicionar(client, 100)
    assert client.post("/api/ordens-servico/1/enviar-orcamento").status_code == 409


# OS cancelada não tem orçamento para enviar (409).
def test_enviar_orcamento_de_os_cancelada_409(client, os_corpo):
    nova_os(client, os_corpo, status="CANCELADA")
    adicionar(client, 100)
    r = client.post("/api/ordens-servico/1/enviar-orcamento")
    assert r.status_code == 409
    assert r.json()["detail"] == "A OS foi cancelada: não há orçamento para enviar."
