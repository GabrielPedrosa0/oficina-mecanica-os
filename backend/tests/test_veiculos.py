# Testes das regras de veículos (services/veiculo_service.py).
# O client do conftest não monta o router de veículos, então aqui criamos
# um app pequeno só com ele. O cliente dono do veículo vem da fixture "cliente".
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from repositories import ordem_servico_repository
from routers import veiculos


@pytest.fixture
def api():
    app = FastAPI()
    app.include_router(veiculos.router)
    return TestClient(app)


# Um corpo válido de veículo, igual ao exemplo do schema.
@pytest.fixture
def corpo(cliente):
    return {"placa": "QRS4F21", "chassi": "9BWZZZ377VT004251", "marca": "Volkswagen",
            "modelo": "Gol 1.6", "ano": 2022, "quilometragem": 82300, "cliente_id": cliente["id"]}


# Cadastrar deixa a placa maiúscula e sem traço.
def test_cadastrar(api, corpo):
    r = api.post("/api/veiculos", json={**corpo, "placa": "qrs-4f21"})
    assert r.status_code == 201
    assert r.json()["placa"] == "QRS4F21"
    assert r.json()["chassi"] == "9BWZZZ377VT004251"


# Regra da placa, partição válida: formato antigo, Mercosul e
# minúsculas/traço (que o serviço corrige). Todas têm 7 caracteres.
@pytest.mark.parametrize("placa", ["ABC1234", "ABC1D23", "abc-1d23"],
                         ids=["antiga", "mercosul", "minuscula_com_traco"])
def test_placa_valida(api, corpo, placa):
    r = api.post("/api/veiculos", json={**corpo, "placa": placa})
    assert r.status_code == 201


# Regra da placa, partição inválida: vazia, limites de tamanho
# (6 e 8 caracteres) e formato errado (números no começo, símbolo).
@pytest.mark.parametrize("placa", ["", "ABC123", "ABC12345", "12ABCDE", "ABC@123"],
                         ids=["vazia", "6_caracteres", "8_caracteres", "numeros_no_inicio", "simbolo"])
def test_placa_invalida(api, corpo, placa):
    r = api.post("/api/veiculos", json={**corpo, "placa": placa})
    assert r.status_code == 422
    assert "Placa" in r.json()["detail"]


# Regra marca/modelo obrigatórios, partição válida: o limite é 1 caractere.
@pytest.mark.parametrize("campo", ["marca", "modelo"])
def test_marca_modelo_validos(api, corpo, campo):
    r = api.post("/api/veiculos", json={**corpo, campo: "X"})
    assert r.status_code == 201


# Regra marca/modelo obrigatórios, partição inválida: vazio ou só espaços.
@pytest.mark.parametrize("campo, valor", [
    ("marca", ""),
    ("marca", "   "),
    ("modelo", ""),
    ("modelo", "   "),
], ids=["marca_vazia", "marca_espacos", "modelo_vazio", "modelo_espacos"])
def test_marca_modelo_vazios(api, corpo, campo, valor):
    r = api.post("/api/veiculos", json={**corpo, campo: valor})
    assert r.status_code == 422
    assert "Marca" in r.json()["detail"]


# Regra do ano (1900 a 2100), partição válida: os limites, um valor
# do meio e o ano ausente (no schema o ano é opcional).
@pytest.mark.parametrize("ano", [1900, 1901, 2022, 2099, 2100, None],
                         ids=["1900", "1901", "2022", "2099", "2100", "sem_ano"])
def test_ano_valido(api, corpo, ano):
    r = api.post("/api/veiculos", json={**corpo, "ano": ano})
    assert r.status_code == 201


# Regra do ano, partição inválida: logo abaixo e logo acima dos limites.
@pytest.mark.parametrize("ano", [1899, 2101], ids=["1899", "2101"])
def test_ano_invalido(api, corpo, ano):
    r = api.post("/api/veiculos", json={**corpo, "ano": ano})
    assert r.status_code == 422
    assert "Ano" in r.json()["detail"]


# Regra da quilometragem (não negativa), partição válida: o limite 0,
# logo acima (1), um valor comum e a quilometragem ausente (opcional).
@pytest.mark.parametrize("km", [0, 1, 82300, None], ids=["0", "1", "82300", "sem_km"])
def test_km_valida(api, corpo, km):
    r = api.post("/api/veiculos", json={**corpo, "quilometragem": km})
    assert r.status_code == 201


# Regra da quilometragem, partição inválida: logo abaixo do limite.
def test_km_negativa(api, corpo):
    r = api.post("/api/veiculos", json={**corpo, "quilometragem": -1})
    assert r.status_code == 422
    assert "quilometragem" in r.json()["detail"]


# Regra do chassi: é opcional, então veículo sem chassi é aceito.
def test_sem_chassi(api, corpo):
    r = api.post("/api/veiculos", json={**corpo, "chassi": None})
    assert r.status_code == 201


# Regra do dono, partição inválida: cliente que não existe.
def test_cliente_inexistente(api, corpo):
    r = api.post("/api/veiculos", json={**corpo, "cliente_id": 99})
    assert r.status_code == 422
    assert "Cliente" in r.json()["detail"]


# Regra do dono, partição inválida: sem cliente_id (o schema recusa).
@pytest.mark.parametrize("remover", [True, False], ids=["ausente", "nulo"])
def test_sem_cliente(api, corpo, remover):
    sem_dono = {**corpo}
    if remover:
        del sem_dono["cliente_id"]
    else:
        sem_dono["cliente_id"] = None
    assert api.post("/api/veiculos", json=sem_dono).status_code == 422


# Placa repetida dá 409.
def test_placa_repetida(api, corpo):
    api.post("/api/veiculos", json=corpo)
    r = api.post("/api/veiculos", json={**corpo, "placa": "qrs-4f21"})
    assert r.status_code == 409


# Listar e filtrar por placa.
def test_listar(api, corpo):
    api.post("/api/veiculos", json=corpo)
    api.post("/api/veiculos", json={**corpo, "placa": "ABC1234", "chassi": None})
    assert len(api.get("/api/veiculos").json()) == 2
    assert [v["placa"] for v in api.get("/api/veiculos?placa=QRS").json()] == ["QRS4F21"]


# Consultar veículo inexistente dá 404.
def test_consultar_inexistente(api):
    assert api.get("/api/veiculos/99").status_code == 404


# Atualizar pode manter a própria placa, mas não usar a de outro.
def test_atualizar(api, corpo):
    id = api.post("/api/veiculos", json=corpo).json()["id"]
    api.post("/api/veiculos", json={**corpo, "placa": "ABC1234", "chassi": None})
    r = api.put(f"/api/veiculos/{id}", json={**corpo, "modelo": "Gol 1.0"})
    assert r.status_code == 200
    assert r.json()["modelo"] == "Gol 1.0"
    assert api.put(f"/api/veiculos/{id}", json={**corpo, "placa": "ABC1234"}).status_code == 409
    assert api.put("/api/veiculos/99", json=corpo).status_code == 404


# Excluir veículo com OS dá 409.
def test_excluir_com_os(api, corpo):
    id = api.post("/api/veiculos", json=corpo).json()["id"]
    # A OS entra direto no repositório: aqui só importa que ela exista.
    ordem_servico_repository.criar({"veiculo_id": id, "problema_relatado": "Barulho ao frear"})
    assert api.delete(f"/api/veiculos/{id}").status_code == 409


# Excluir veículo sem OS dá 204.
def test_excluir(api, corpo):
    id = api.post("/api/veiculos", json=corpo).json()["id"]
    assert api.delete(f"/api/veiculos/{id}").status_code == 204
    assert api.get(f"/api/veiculos/{id}").status_code == 404


# Regra da atualização: ela também valida os dados, então placa inválida dá 422.
def test_atualizar_invalido(api, corpo):
    id = api.post("/api/veiculos", json=corpo).json()["id"]
    r = api.put(f"/api/veiculos/{id}", json={**corpo, "placa": "12ABCDE"})
    assert r.status_code == 422
    assert "Placa" in r.json()["detail"]


# Excluir veículo inexistente dá 404.
def test_excluir_inexistente(api):
    assert api.delete("/api/veiculos/99").status_code == 404


# Chassi também não se repete (UNIQUE no banco): 409 com mensagem clara.
def test_chassi_repetido(api, corpo):
    api.post("/api/veiculos", json=corpo)
    r = api.post("/api/veiculos", json={**corpo, "placa": "ABC1234"})
    assert r.status_code == 409
    assert r.json()["detail"] == "Já existe um veículo com esse chassi."
