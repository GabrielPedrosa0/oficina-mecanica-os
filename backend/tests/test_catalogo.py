# Testes das telas Serviços e Peças (/api/servicos e /api/pecas), da agenda e dos filtros
# acrescentados para o frontend (mecânicos em expediente, veículos com OS aberta, OS em garantia).
# Serviços e peças ficam na tabela item: o id deles é o item_id dos itens da OS.
from datetime import datetime

from services import mecanico_service


def test_servicos_busca_sem_acento_e_sem_o_generico(client):
    client.post("/api/servicos", json={"descricao": "Troca de óleo e filtro", "tempo_estimado_min": 40,
                                       "preco_base": 120})
    client.post("/api/servicos", json={"descricao": "Alinhamento", "preco_base": 160})
    # O serviço genérico do sistema (id 2) não aparece na tela de serviços.
    assert [s["descricao"] for s in client.get("/api/servicos").json()] == ["Alinhamento", "Troca de óleo e filtro"]
    assert [s["descricao"] for s in client.get("/api/servicos?busca=oleo").json()] == ["Troca de óleo e filtro"]
    assert client.post("/api/servicos", json={"descricao": "X", "preco_base": -1}).status_code == 422
    assert client.post("/api/servicos", json={"descricao": "alinhamento"}).status_code == 409
    assert client.get("/api/servicos/2").status_code == 404


def test_servico_usado_em_os_nao_exclui(client, os_corpo):
    s = client.post("/api/servicos", json={"descricao": "Alinhamento", "preco_base": 160}).json()
    os_ = client.post("/api/ordens-servico", json=os_corpo).json()
    client.post(f"/api/ordens-servico/{os_['id']}/itens",
                json={"item_id": s["id"], "descricao": "Alinhamento", "valor_unitario": 160})
    assert client.delete(f"/api/servicos/{s['id']}").status_code == 409


def test_pecas_estoque_baixo_entrada_e_codigo_repetido(client):
    p = client.post("/api/pecas", json={"codigo": "pst-dia-0451", "descricao": "Pastilha", "estoque": 3,
                                        "estoque_minimo": 4, "preco_venda": 140}).json()
    assert p["codigo"] == "PST-DIA-0451" and p["estoque_baixo"] is True
    assert len(client.get("/api/pecas?estoque_baixo=true").json()) == 1
    assert client.post("/api/pecas", json={"codigo": "PST-DIA-0451", "descricao": "Y"}).status_code == 409
    assert client.post(f"/api/pecas/{p['id']}/entradas", json={"quantidade": 0}).status_code == 422
    r = client.post(f"/api/pecas/{p['id']}/entradas", json={"quantidade": 10}).json()
    assert r["estoque"] == 13 and r["estoque_baixo"] is False
    # O PUT não mexe no estoque.
    r = client.put(f"/api/pecas/{p['id']}", json={**p, "estoque": 0, "preco_venda": 150}).json()
    assert r["estoque"] == 13 and r["preco_venda"] == 150
    # A peça aparece no catálogo geral, com os nomes de /api/itens.
    item = client.get(f"/api/itens/{p['id']}").json()
    assert item["tipo"] == "PECA" and item["qtd_estoque"] == 13


def test_mecanicos_em_expediente_e_os_em_servico(client, os_corpo, monkeypatch):
    # Rafael (id 1): 08:00–17:00; Joana (id 2): 09:00–18:00.
    monkeypatch.setattr(mecanico_service, "agora", lambda: datetime(2026, 11, 11, 8, 30))
    assert [m["nome"] for m in client.get("/api/mecanicos?em_expediente=true").json()] == ["Rafael Lima"]
    client.post("/api/ordens-servico", json=os_corpo)  # EM_SERVICO com o mecânico 1
    assert client.get("/api/mecanicos/1").json()["os_em_servico"] == 1
    assert client.get("/api/mecanicos/2").json()["os_em_servico"] == 0


def test_veiculo_mostra_dono_e_os_aberta(client, os_corpo, veiculo):
    os_ = client.post("/api/ordens-servico", json=os_corpo).json()
    v = client.get("/api/veiculos").json()[0]
    assert v["cliente_nome"] == "Marina Souza"
    assert v["os_aberta_id"] == os_["id"] and v["status_os_aberta"] == "EM_SERVICO"
    assert [x["placa"] for x in client.get("/api/veiculos?busca=marina").json()] == ["QRS4F21"]
    assert client.get("/api/veiculos?busca=fusca").json() == []


def test_filtro_garantia_e_agenda(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    garantia = client.post("/api/ordens-servico", json={**os_corpo, "eh_garantia": True}).json()
    assert [o["id"] for o in client.get("/api/ordens-servico?garantia=true").json()] == [garantia["id"]]
    agenda = client.get("/api/agenda?data=2026-11-11").json()
    assert agenda["total"] == 2
    assert client.get("/api/agenda?data=2026-11-12").json()["total"] == 0


def test_cancelar_com_motivo_anota_na_linha_do_tempo(client, os_corpo):
    os_ = client.post("/api/ordens-servico", json={**os_corpo, "status": "ORCAMENTO"}).json()
    r = client.patch(f"/api/ordens-servico/{os_['id']}/status",
                     json={"status": "CANCELADA", "motivo": "Cliente desistiu"})
    assert r.status_code == 200 and r.json()["status"] == "CANCELADA"
    apontamentos = client.get(f"/api/ordens-servico/{os_['id']}/apontamentos").json()
    assert apontamentos[0]["tipo"] == "OBSERVACAO" and "Cliente desistiu" in apontamentos[0]["descricao"]
