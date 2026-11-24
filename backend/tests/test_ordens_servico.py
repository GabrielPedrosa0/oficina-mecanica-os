# Testes das regras das ordens de serviço (services/ordem_servico_service.py).
# Técnicas: partição de equivalência (valores válidos e inválidos) e
# análise de valor limite (os valores na beirada de cada regra).
# O os_corpo do conftest abre a OS em 11/11/2026 às 08:10.
import pytest

from repositories import ordem_servico_repository
from tests.conftest import novo_veiculo


# Cadastro válido: grava os campos do corpo e junta os dados do veículo e do cliente.
# O valor total ainda é 0, porque a OS não tem peças nem serviços.
def test_cadastrar(client, os_corpo):
    r = client.post("/api/ordens-servico", json={**os_corpo, "problema_relatado": "  Barulho ao frear "})
    assert r.status_code == 201
    o = r.json()
    assert o["id"] == 1
    assert o["problema_relatado"] == "Barulho ao frear"
    assert o["mecanico_id"] == 1
    assert o["eh_garantia"] is False
    assert o["status"] == "EM_SERVICO"
    assert o["placa"] == "QRS4F21"
    assert o["veiculo"] == "Volkswagen Gol 1.6"
    assert o["cliente_nome"] == "Marina Souza"
    assert o["cliente_telefone"] == "(85) 90000-0001"
    assert o["valor_total"] == 0


# Valores padrão: sem status vale ORCAMENTO, sem mecânico fica "A definir" (null)
# e sem data de abertura vale o momento atual.
def test_valores_padrao(client, veiculo):
    r = client.post("/api/ordens-servico", json={"veiculo_id": veiculo["id"], "problema_relatado": "Ruído"})
    assert r.status_code == 201
    assert r.json()["status"] == "ORCAMENTO"
    assert r.json()["mecanico_id"] is None
    assert r.json()["data_abertura"] is not None


# Regra do mecânico: é opcional, mas, se vier, tem que existir.
# Partição válida: sem mecânico (null) e mecânico cadastrado. Inválida: id 99.
@pytest.mark.parametrize("mecanico_id, status", [
    (None, 201),
    (1, 201),
    (99, 422),
], ids=["sem_mecanico", "existente", "inexistente"])
def test_mecanico(client, os_corpo, mecanico_id, status):
    r = client.post("/api/ordens-servico", json={**os_corpo, "mecanico_id": mecanico_id})
    assert r.status_code == status
    if status == 422:
        assert "Mecânico" in r.json()["detail"]


# Regra do veículo, partição inválida: veículo que não existe.
def test_veiculo_inexistente(client, os_corpo):
    r = client.post("/api/ordens-servico", json={**os_corpo, "veiculo_id": 99})
    assert r.status_code == 422
    assert r.json()["detail"] == "Veículo não encontrado."


# Regra do problema relatado, partição válida (limite = 1 caractere)
# e inválida (vazio ou só espaços).
@pytest.mark.parametrize("problema, status", [
    ("X", 201),
    ("", 422),
    ("   ", 422),
], ids=["um-caractere", "vazio", "so-espacos"])
def test_problema(client, os_corpo, problema, status):
    r = client.post("/api/ordens-servico", json={**os_corpo, "problema_relatado": problema})
    assert r.status_code == status


# Regra da quilometragem (não negativa), partição válida: o limite 0, logo acima (1)
# e ausente (vale a do veículo). Partição inválida: logo abaixo do limite (-1).
@pytest.mark.parametrize("km, status, esperado", [
    (0, 201, 0),
    (1, 201, 1),
    (None, 201, 82300),
    (-1, 422, None),
], ids=["0", "1", "do-veiculo", "-1"])
def test_quilometragem(client, os_corpo, km, status, esperado):
    r = client.post("/api/ordens-servico", json={**os_corpo, "quilometragem": km})
    assert r.status_code == status
    if status == 201:
        assert r.json()["quilometragem"] == esperado


# Regra das datas sem fuso horário, partição inválida: com "Z" ou com -03:00.
@pytest.mark.parametrize("campo, data", [
    ("data_abertura", "2026-11-11T08:10:00Z"),
    ("data_previsao", "2026-11-11T17:00:00-03:00"),
    ("data_conclusao", "2026-11-11T17:00:00Z"),
], ids=["abertura-z", "previsao-03", "conclusao-z"])
def test_data_com_fuso(client, os_corpo, campo, data):
    r = client.post("/api/ordens-servico", json={**os_corpo, campo: data})
    assert r.status_code == 422
    assert "fuso horário" in r.json()["detail"]


# Regra "previsão e conclusão não antes da abertura" (08:10:00).
# Limites: 1 segundo antes (inválido), o mesmo momento e 1 segundo depois (válidos).
@pytest.mark.parametrize("campo, data, status", [
    ("data_previsao", "2026-11-11T08:09:59", 422),
    ("data_previsao", "2026-11-11T08:10:00", 201),
    ("data_previsao", "2026-11-11T08:10:01", 201),
    ("data_conclusao", "2026-11-11T08:09:59", 422),
    ("data_conclusao", "2026-11-11T08:10:00", 201),
    ("data_conclusao", "2026-11-11T08:10:01", 201),
], ids=["previsao-antes", "previsao-igual", "previsao-depois",
        "conclusao-antes", "conclusao-igual", "conclusao-depois"])
def test_datas_depois_da_abertura(client, os_corpo, campo, data, status):
    r = client.post("/api/ordens-servico", json={**os_corpo, campo: data})
    assert r.status_code == status


# Regra do status: só os cinco estados do schema. Partição inválida: outro texto.
@pytest.mark.parametrize("status, codigo", [
    ("ORCAMENTO", 201),
    ("ENTREGUE", 201),
    ("QUEBRADA", 422),
    ("em_servico", 422),
], ids=["orcamento", "entregue", "desconhecido", "minusculo"])
def test_status(client, os_corpo, status, codigo):
    assert client.post("/api/ordens-servico", json={**os_corpo, "status": status}).status_code == codigo


# Campos obrigatórios (veiculo_id e problema_relatado), partição inválida: ausentes.
@pytest.mark.parametrize("campo", ["veiculo_id", "problema_relatado"])
def test_obrigatorio_ausente(client, os_corpo, campo):
    corpo = {k: v for k, v in os_corpo.items() if k != campo}
    assert client.post("/api/ordens-servico", json=corpo).status_code == 422


# Consultar OS existente e inexistente (404).
def test_consultar(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    assert client.get("/api/ordens-servico/1").json()["problema_relatado"] == "Barulho ao frear"
    r = client.get("/api/ordens-servico/99")
    assert r.status_code == 404
    assert r.json()["detail"] == "Ordem de serviço não encontrada."


# Regra da atualização: sem data_abertura no corpo, fica a da OS gravada.
def test_atualizar(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    corpo = {k: v for k, v in os_corpo.items() if k != "data_abertura"}
    r = client.put("/api/ordens-servico/1", json={**corpo, "status": "PRONTA",
                                                  "data_conclusao": "2026-11-11T16:00:00"})
    assert r.status_code == 200
    assert r.json()["status"] == "PRONTA"
    assert r.json()["data_abertura"] == "2026-11-11T08:10:00"


# A atualização também valida: conclusão antes da abertura gravada dá 422.
def test_atualizar_invalido(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    corpo = {k: v for k, v in os_corpo.items() if k != "data_abertura"}
    r = client.put("/api/ordens-servico/1", json={**corpo, "data_conclusao": "2026-11-11T08:09:59"})
    assert r.status_code == 422


# Regra da OS só leitura: entregue ou cancelada não se edita (409, e nada muda).
# Nos outros status a edição passa.
@pytest.mark.parametrize("status, esperado", [
    ("ORCAMENTO", 200),
    ("EM_SERVICO", 200),
    ("AGUARDANDO_PECA", 200),
    ("PRONTA", 200),
    ("ENTREGUE", 409),
    ("CANCELADA", 409),
])
def test_atualizar_os_fechada(client, os_corpo, status, esperado):
    client.post("/api/ordens-servico", json={**os_corpo, "status": status})
    r = client.put("/api/ordens-servico/1", json={**os_corpo, "status": status, "observacoes": "Nova"})
    assert r.status_code == esperado
    gravada = client.get("/api/ordens-servico/1").json()
    assert (gravada["observacoes"] == "Nova") == (esperado == 200)


# Atualizar OS inexistente dá 404.
def test_atualizar_inexistente(client, os_corpo):
    assert client.put("/api/ordens-servico/99", json=os_corpo).status_code == 404


# Excluir dá 204; excluir de novo (OS que não existe mais) dá 404.
def test_excluir(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    assert client.delete("/api/ordens-servico/1").status_code == 204
    assert client.get("/api/ordens-servico/1").status_code == 404
    assert client.delete("/api/ordens-servico/1").status_code == 404


# O DELETE /api/veiculos/{id} usa isto para responder 409.
def test_veiculo_tem_ordens(client, os_corpo, veiculo):
    assert not ordem_servico_repository.existe_do_veiculo(veiculo["id"])
    client.post("/api/ordens-servico", json=os_corpo)
    assert ordem_servico_repository.existe_do_veiculo(veiculo["id"])


# Filtros da listagem: status, placa (parte, minúscula, com traço) e cliente
# (sem acento e sem maiúscula). Partição sem resultado: filtros que não combinam.
@pytest.mark.parametrize("query, esperado", [
    ("", [2, 1]),
    ("?status=EM_SERVICO", [1]),
    ("?placa=qrs-4f21", [1]),
    ("?placa=QRS", [1]),
    ("?cliente=marina", [1]),
    ("?cliente=araujo", [2]),
    ("?status=ENTREGUE&cliente=marina", []),
], ids=["sem-filtro", "status", "placa-com-traco", "placa-parcial", "cliente",
        "cliente-sem-acento", "sem-resultado"])
def test_listar(client, os_corpo, query, esperado):
    client.post("/api/ordens-servico", json=os_corpo)
    outro = client.post("/api/clientes", json={"nome": "Luís Araújo", "telefone": "85900000006"}).json()
    carro = novo_veiculo(2, "BCD8N45", "Toyota", "Corolla", outro["id"])
    client.post("/api/ordens-servico", json={**os_corpo, "veiculo_id": carro["id"], "status": "ENTREGUE"})
    assert [o["id"] for o in client.get(f"/api/ordens-servico{query}").json()] == esperado


# Filtro de status inválido dá 422.
def test_listar_status_invalido(client):
    assert client.get("/api/ordens-servico?status=QUEBRADA").status_code == 422
