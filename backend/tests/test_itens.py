# Testes das regras do catálogo de itens (services/item_service.py).
# Técnicas: partição de equivalência (valores válidos e inválidos) e
# análise de valor limite (os valores na beirada de cada regra).
# O catálogo começa com 2 itens: Peça (id 1, PECA) e Serviço (id 2, SERVICO).
import pytest

PECA = {"tipo": "PECA", "descricao": "Óleo 5W30 4L", "codigo": "ole-5w30-4l", "preco": 45.9, "qtd_estoque": 10}
SERVICO = {"tipo": "SERVICO", "descricao": "Troca de óleo", "preco": 120, "tempo_estimado_min": 30}


# A lista já traz a peça e o serviço iniciais, em ordem de descrição.
def test_listar(client):
    descricoes = [i["descricao"] for i in client.get("/api/itens").json()]
    assert descricoes == ["Peça", "Serviço"]


# Filtro por tipo: só as peças ou só os serviços; tipo desconhecido é recusado.
@pytest.mark.parametrize("tipo, esperado", [
    ("PECA", ["Peça"]),
    ("SERVICO", ["Serviço"]),
    ("OUTRO", None),
])
def test_listar_por_tipo(client, tipo, esperado):
    r = client.get(f"/api/itens?tipo={tipo}")
    if esperado is None:
        assert r.status_code == 422
    else:
        assert [i["descricao"] for i in r.json()] == esperado


# Consultar pelo id; id que não existe responde 404.
@pytest.mark.parametrize("id, status", [(1, 200), (2, 200), (99, 404)])
def test_consultar(client, id, status):
    assert client.get(f"/api/itens/{id}").status_code == status


# Cadastro de peça: descrição limpa, código em maiúsculas e preço com 2 casas.
def test_cadastrar_peca(client):
    r = client.post("/api/itens", json={**PECA, "descricao": "  Óleo 5W30 4L ", "preco": 45.899})
    assert r.status_code == 201
    item = r.json()
    assert item["id"] == 3
    assert item["descricao"] == "Óleo 5W30 4L"
    assert item["codigo"] == "OLE-5W30-4L"
    assert item["preco"] == 45.9


# Cadastro de serviço: sem código e sem estoque.
def test_cadastrar_servico(client):
    r = client.post("/api/itens", json=SERVICO)
    assert r.status_code == 201
    assert r.json()["codigo"] is None
    assert r.json()["qtd_estoque"] is None
    assert r.json()["tempo_estimado_min"] == 30


# Descrição: vazia ou acima de 120 é inválida; 1 e 120 caracteres são os limites válidos.
@pytest.mark.parametrize("descricao, status", [
    ("", 422), ("   ", 422), ("A", 201), ("A" * 120, 201), ("A" * 121, 422),
], ids=["vazia", "espacos", "1-char", "120-chars", "121-chars"])
def test_descricao(client, descricao, status):
    assert client.post("/api/itens", json={**SERVICO, "descricao": descricao}).status_code == status


# Descrição repetida: só conflita no mesmo tipo (maiúsculas não importam).
@pytest.mark.parametrize("tipo, descricao, status", [
    ("SERVICO", "Serviço", 409),
    ("SERVICO", "serviço", 409),
    ("PECA", "Serviço", 201),
])
def test_descricao_repetida(client, tipo, descricao, status):
    assert client.post("/api/itens", json={"tipo": tipo, "descricao": descricao}).status_code == status


# Código: opcional; até 20 caracteres (20 é o limite válido, 21 o inválido).
@pytest.mark.parametrize("codigo, status", [
    (None, 201), ("", 201), ("A", 201), ("A" * 20, 201), ("A" * 21, 422),
], ids=["sem-codigo", "vazio", "1-char", "20-chars", "21-chars"])
def test_codigo(client, codigo, status):
    assert client.post("/api/itens", json={**PECA, "codigo": codigo}).status_code == status


# Código repetido é recusado, mesmo escrito em minúsculas.
def test_codigo_repetido(client):
    client.post("/api/itens", json=PECA)
    outro = {**PECA, "descricao": "Outro óleo", "codigo": "OLE-5W30-4L"}
    assert client.post("/api/itens", json=outro).status_code == 409


# Preço: não negativo (0 e 0,01 válidos; -0,01 inválido).
@pytest.mark.parametrize("preco, status", [(0, 201), (0.01, 201), (-0.01, 422)])
def test_preco(client, preco, status):
    assert client.post("/api/itens", json={**SERVICO, "preco": preco}).status_code == status


# Atualizar: muda os campos e mantém o id; pode manter a própria descrição e o próprio código.
def test_atualizar(client):
    client.post("/api/itens", json=PECA)
    r = client.put("/api/itens/3", json={**PECA, "preco": 50, "qtd_estoque": 8})
    assert r.status_code == 200
    assert r.json()["id"] == 3
    assert r.json()["preco"] == 50
    assert r.json()["qtd_estoque"] == 8


# Atualizar: id que não existe responde 404; descrição de outro item do mesmo tipo responde 409.
@pytest.mark.parametrize("id, corpo, status", [
    (99, {"tipo": "PECA", "descricao": "Filtro"}, 404),
    (1, {"tipo": "SERVICO", "descricao": "Serviço"}, 409),
])
def test_atualizar_invalido(client, id, corpo, status):
    assert client.put(f"/api/itens/{id}", json=corpo).status_code == status


# Excluir: some da lista; excluir de novo responde 404.
def test_excluir(client):
    client.post("/api/itens", json=SERVICO)
    assert client.delete("/api/itens/3").status_code == 204
    assert client.get("/api/itens/3").status_code == 404
    assert client.delete("/api/itens/3").status_code == 404


# Item usado numa OS não pode ser excluído (no banco, ON DELETE RESTRICT).
def test_excluir_em_uso(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    client.post("/api/ordens-servico/1/itens",
                json={"item_id": 1, "descricao": "Pastilhas", "valor_unitario": 95})
    assert client.delete("/api/itens/1").status_code == 409
    assert client.get("/api/itens/1").status_code == 200
