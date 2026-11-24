# Testes das regras dos mecânicos (services/mecanico_service.py).
# Técnicas: partição de equivalência (valores válidos e inválidos) e
# análise de valor limite (os valores na beirada de cada regra).
# O repositório começa com 2 exemplos: Rafael Lima (id 1) e Joana Alves (id 2).
import pytest

from repositories import ordem_servico_repository

CORPO = {"nome": "Carlos Souza", "cpf": "529.982.247-25", "telefone": "85 9 0000-0011",
         "hora_inicio_expediente": "08:00", "hora_fim_expediente": "17:00"}


# A lista já traz os 2 exemplos, em ordem de nome.
def test_listar(client):
    nomes = [m["nome"] for m in client.get("/api/mecanicos").json()]
    assert nomes == ["Joana Alves", "Rafael Lima"]


# Consultar um exemplo pelo id.
def test_consultar(client):
    r = client.get("/api/mecanicos/1")
    assert r.status_code == 200
    assert r.json()["hora_inicio_expediente"] == "08:00:00"


# Cadastro válido: nome limpo, CPF só com dígitos e telefone formatado.
def test_cadastrar(client):
    r = client.post("/api/mecanicos", json={**CORPO, "nome": "  Carlos Souza "})
    assert r.status_code == 201
    m = r.json()
    assert m["id"] == 3
    assert m["nome"] == "Carlos Souza"
    assert m["cpf"] == "52998224725"
    assert m["telefone"] == "(85) 90000-0011"


# Só o nome é obrigatório; CPF, telefone e expediente podem ficar vazios.
def test_so_nome(client):
    r = client.post("/api/mecanicos", json={"nome": "Carlos", "cpf": "", "telefone": ""})
    assert r.status_code == 201
    assert r.json()["cpf"] is None
    assert r.json()["telefone"] is None


# Nome: vazio ou acima de 120 é inválido; 1 e 120 caracteres são os limites válidos.
@pytest.mark.parametrize("nome, status", [
    ("", 422), ("   ", 422), ("A", 201), ("A" * 120, 201), ("A" * 121, 422),
], ids=["vazio", "espacos", "1-char", "120-chars", "121-chars"])
def test_nome(client, nome, status):
    assert client.post("/api/mecanicos", json={**CORPO, "nome": nome}).status_code == status


# CPF: precisa ter exatamente 11 dígitos (10 e 12 são os vizinhos inválidos).
@pytest.mark.parametrize("cpf, status", [
    ("52998224725", 201), ("529.982.247-25", 201), ("5299822472", 422),
    ("529982247251", 422), ("abc", 422),
], ids=["11-digitos", "com-pontuacao", "10-digitos", "12-digitos", "letras"])
def test_cpf(client, cpf, status):
    assert client.post("/api/mecanicos", json={**CORPO, "cpf": cpf}).status_code == status


# CPF repetido (mesmo com pontuação diferente) não pode.
def test_cpf_repetido(client):
    r = client.post("/api/mecanicos", json={**CORPO, "cpf": "123.456.789-01"})
    assert r.status_code == 409


# Telefone: 10 ou 11 dígitos (fixo ou celular); 9 e 12 são inválidos.
@pytest.mark.parametrize("telefone, esperado", [
    ("8532000000", "(85) 3200-0000"), ("85900000011", "(85) 90000-0011"),
    ("853200000", None), ("859000000111", None),
], ids=["10-digitos", "11-digitos", "9-digitos", "12-digitos"])
def test_telefone(client, telefone, esperado):
    r = client.post("/api/mecanicos", json={**CORPO, "telefone": telefone})
    if esperado is None:
        assert r.status_code == 422
    else:
        assert r.json()["telefone"] == esperado


# Expediente: o fim tem de ser depois do início. Igual é o limite inválido;
# um minuto depois é o primeiro válido.
@pytest.mark.parametrize("inicio, fim, status", [
    ("08:00", "17:00", 201), ("08:00", "08:01", 201), ("08:00", "08:00", 422),
    ("08:00", "07:59", 422), ("08:00", None, 201),
], ids=["normal", "1-minuto", "igual", "antes", "sem-fim"])
def test_expediente(client, inicio, fim, status):
    corpo = {**CORPO, "hora_inicio_expediente": inicio, "hora_fim_expediente": fim}
    assert client.post("/api/mecanicos", json=corpo).status_code == status


# Atualizar troca os dados e pode manter o próprio CPF.
def test_atualizar(client):
    r = client.put("/api/mecanicos/1", json={**CORPO, "nome": "Rafael L.", "cpf": "12345678901"})
    assert r.status_code == 200
    assert r.json()["nome"] == "Rafael L."
    assert client.get("/api/mecanicos/1").json()["nome"] == "Rafael L."


# Atualizar com o CPF de outro mecânico não pode.
def test_atualizar_cpf_de_outro(client):
    r = client.put("/api/mecanicos/1", json={**CORPO, "cpf": "10987654321"})
    assert r.status_code == 409


# Excluir remove o mecânico.
def test_excluir(client):
    assert client.delete("/api/mecanicos/2").status_code == 204
    assert client.get("/api/mecanicos/2").status_code == 404


# Excluir mecânico com OS: a OS fica com o mecânico "A definir" (None).
def test_excluir_com_os(client, os_corpo):
    os_id = client.post("/api/ordens-servico", json=os_corpo).json()["id"]
    assert client.delete("/api/mecanicos/1").status_code == 204
    assert ordem_servico_repository.buscar(os_id)["mecanico_id"] is None


# Id que não existe responde 404 em consultar, atualizar e excluir.
@pytest.mark.parametrize("metodo", ["get", "put", "delete"], ids=["consultar", "atualizar", "excluir"])
def test_nao_encontrado(client, metodo):
    if metodo == "put":
        r = client.put("/api/mecanicos/99", json=CORPO)
    else:
        r = getattr(client, metodo)("/api/mecanicos/99")
    assert r.status_code == 404
