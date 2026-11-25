import pytest

from tests.conftest import definir_status

# O item_id aponta para o catálogo: 1 = Peça e 2 = Serviço já vêm cadastrados.
ITEM = {"item_id": 2, "descricao": "Troca de pastilhas de freio", "quantidade": 1, "valor_unitario": 150.0}


@pytest.fixture
def os_(client, os_corpo):
    return client.post("/api/ordens-servico", json=os_corpo).json()


def novo_item(client, os_id=1, **mudanca):
    return client.post(f"/api/ordens-servico/{os_id}/itens", json={**ITEM, **mudanca})


def test_adicionar_item(client, os_):
    r = novo_item(client)
    assert r.status_code == 201
    # Na resposta, o tipo, o código e o tempo vêm do catálogo (o item 2 é o Serviço).
    assert r.json() == {"id": 1, "os_id": 1, **ITEM, "tipo": "SERVICO", "codigo": None, "tempo_estimado_min": None}


def test_descricao_e_valor_sao_ajustados(client, os_):
    r = novo_item(client, descricao="  Filtro de óleo  ", valor_unitario=35.456)
    assert r.json()["descricao"] == "Filtro de óleo"
    assert r.json()["valor_unitario"] == 35.46


def test_listar_itens_so_da_os_pedida(client, os_, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)  # OS 2
    novo_item(client, 1)
    novo_item(client, 1, item_id=1, descricao="Pastilhas dianteiras", valor_unitario=190)
    novo_item(client, 2, descricao="Alinhamento")
    r = client.get("/api/ordens-servico/1/itens")
    assert r.status_code == 200
    assert [i["descricao"] for i in r.json()] == ["Troca de pastilhas de freio", "Pastilhas dianteiras"]
    assert [i["tipo"] for i in r.json()] == ["SERVICO", "PECA"]
    assert client.get("/api/ordens-servico/2/itens").json()[0]["descricao"] == "Alinhamento"


def test_os_sem_itens_devolve_lista_vazia(client, os_):
    assert client.get("/api/ordens-servico/1/itens").json() == []


def test_os_inexistente_404_em_todas_as_rotas_de_itens(client):
    esperado = "Ordem de serviço não encontrada."
    for r in (client.get("/api/ordens-servico/99/itens"),
              client.post("/api/ordens-servico/99/itens", json=ITEM),
              client.put("/api/ordens-servico/99/itens/1", json=ITEM),
              client.delete("/api/ordens-servico/99/itens/1")):
        assert r.status_code == 404
        assert r.json()["detail"] == esperado


@pytest.mark.parametrize("mudanca, trecho", [
    ({"descricao": "   "}, "descrição"),
    ({"item_id": 99}, "catálogo"),
])
def test_item_invalido_422(client, os_, mudanca, trecho):
    r = novo_item(client, **mudanca)
    assert r.status_code == 422
    assert trecho in r.json()["detail"]


def test_campos_obrigatorios_e_invalidos_422(client, os_):
    url = "/api/ordens-servico/1/itens"
    assert client.post(url, json={"item_id": 1, "valor_unitario": 10}).status_code == 422
    assert client.post(url, json={"descricao": "Óleo", "valor_unitario": 10}).status_code == 422
    assert client.post(url, json={"item_id": 1, "descricao": "Óleo"}).status_code == 422
    assert novo_item(client, quantidade=0).status_code == 422
    assert novo_item(client, valor_unitario=-10).status_code == 422
    assert novo_item(client, valor_unitario="caro").status_code == 422


# Item de valor zero (ex.: cortesia) entra na OS: quem decide o preço é o catálogo.
def test_item_valor_zero(client, os_):
    r = novo_item(client, valor_unitario=0)
    assert r.status_code == 201
    assert r.json()["valor_unitario"] == 0.0


# A mesma peça pode entrar mais de uma vez na mesma OS.
def test_mesma_peca_duas_vezes(client, os_):
    novo_item(client, item_id=1, descricao="Pastilhas", valor_unitario=95)
    r = novo_item(client, item_id=1, descricao="Pastilhas", valor_unitario=95)
    assert r.status_code == 201
    assert len(client.get("/api/ordens-servico/1/itens").json()) == 2


def test_atualizar_item(client, os_):
    novo_item(client)
    r = client.put("/api/ordens-servico/1/itens/1", json={**ITEM, "descricao": "Troca de óleo", "valor_unitario": 200})
    assert r.status_code == 200
    assert r.json()["descricao"] == "Troca de óleo"
    assert r.json()["valor_unitario"] == 200.0
    assert client.get("/api/ordens-servico/1/itens").json()[0]["descricao"] == "Troca de óleo"


def test_atualizar_item_invalido_422_e_nao_altera(client, os_):
    novo_item(client)
    assert client.put("/api/ordens-servico/1/itens/1", json={**ITEM, "valor_unitario": -10}).status_code == 422
    assert client.get("/api/ordens-servico/1/itens").json()[0]["valor_unitario"] == 150.0


def test_item_inexistente_ou_de_outra_os_404(client, os_, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)  # OS 2
    novo_item(client, 1)
    for r in (client.put("/api/ordens-servico/1/itens/99", json=ITEM),
              client.delete("/api/ordens-servico/1/itens/99"),
              client.put("/api/ordens-servico/2/itens/1", json=ITEM),   # o item 1 é da OS 1
              client.delete("/api/ordens-servico/2/itens/1")):
        assert r.status_code == 404
        assert r.json()["detail"] == "Item não encontrado."
    assert len(client.get("/api/ordens-servico/1/itens").json()) == 1


def test_excluir_item(client, os_):
    novo_item(client)
    assert client.delete("/api/ordens-servico/1/itens/1").status_code == 204
    assert client.get("/api/ordens-servico/1/itens").json() == []
    assert client.delete("/api/ordens-servico/1/itens/1").status_code == 404


# Regra da OS só leitura: entregue ou cancelada não aceita incluir, editar nem excluir
# item (409, e nada muda). Nos outros status pode. O item entra antes de a OS fechar.
@pytest.mark.parametrize("status, esperado", [
    ("ORCAMENTO", None),
    ("EM_SERVICO", None),
    ("AGUARDANDO_PECA", None),
    ("PRONTA", None),
    ("ENTREGUE", "A OS já foi entregue: ela é só para leitura."),
    ("CANCELADA", "A OS foi cancelada: ela é só para leitura."),
])
def test_os_fechada(client, os_, status, esperado):
    novo_item(client)
    definir_status(1, status)
    respostas = (novo_item(client),
                 client.put("/api/ordens-servico/1/itens/1", json={**ITEM, "valor_unitario": 200}),
                 client.delete("/api/ordens-servico/1/itens/1"))
    if esperado is None:
        assert [r.status_code for r in respostas] == [201, 200, 204]
    else:
        assert [r.status_code for r in respostas] == [409, 409, 409]
        assert all(r.json()["detail"] == esperado for r in respostas)
        assert [i["valor_unitario"] for i in client.get("/api/ordens-servico/1/itens").json()] == [150.0]
