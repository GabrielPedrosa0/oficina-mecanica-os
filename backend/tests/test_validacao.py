# Testes do modo validação (/api/validacao): link do aplicador, sessão, perfil, eventos,
# feedback e exportação.
import pytest

from services import validacao_service
from services.validacao_service import LETRAS_DO_CODIGO

PERFIL = {"faixa_etaria": "30_A_44", "uso_apps": "TODO_DIA", "sistema_gestao": "NAO",
          "relacao_oficina": "NUNCA", "familiaridade_carro": "DIRIGE", "habito_formularios": "AS_VEZES"}
SUS_MAXIMO = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1]


def evento(**campos):
    return {"tipo": "CLIQUE", "instante": "2026-11-25T14:03:12.481Z", **campos}


@pytest.fixture
def logado(client):
    token = client.post("/api/auth/login", json={"email": "teste@oficina.com.br", "senha": "senha-de-teste"})
    return {"Authorization": f"Bearer {token.json()['access_token']}"}


@pytest.fixture
def aplicador(client, logado):
    return client.post("/api/validacao/aplicadores", headers=logado, json={"nome": "Rolf"}).json()


@pytest.fixture
def sessao(client, aplicador):
    return client.post("/api/validacao/sessoes", json={"codigo_aplicador": aplicador["codigo"]}).json()


# Gerar link e exportar exigem login; sem ele, 401.
@pytest.mark.parametrize("metodo, caminho", [
    ("POST", "/api/validacao/aplicadores"),
    ("GET", "/api/validacao/exportar/sessoes"),
    ("GET", "/api/validacao/exportar/eventos"),
])
def test_exige_login(client, metodo, caminho):
    assert client.request(metodo, caminho, json={"nome": "Rolf"}).status_code == 401


# O código tem 5 letras, sem as que se confundem (0, O, 1, I).
def test_gera_codigo(aplicador):
    assert aplicador["nome"] == "Rolf"
    assert len(aplicador["codigo"]) == 5
    assert all(letra in LETRAS_DO_CODIGO for letra in aplicador["codigo"])


# Nome vazio, só espaços e com 61 letras (acima do limite) são recusados.
@pytest.mark.parametrize("nome", ["", "   ", "a" * 61])
def test_nome_aplicador_invalido(client, logado, nome):
    assert client.post("/api/validacao/aplicadores", headers=logado, json={"nome": nome}).status_code == 422


# O código vale em minúsculas também; a origem padrão é PESSOA.
def test_cria_sessao(client, aplicador):
    r = client.post("/api/validacao/sessoes", json={"codigo_aplicador": aplicador["codigo"].lower(),
                                                    "tipo_aparelho": "CELULAR", "largura_tela": 390})
    assert r.status_code == 201
    assert r.json()["origem"] == "PESSOA" and r.json()["aplicador_id"] == aplicador["id"]


# Código que não existe: o link é inválido.
def test_codigo_desconhecido(client):
    assert client.post("/api/validacao/sessoes", json={"codigo_aplicador": "ZZZZZ"}).status_code == 404


# As 6 respostas do perfil ficam na sessão.
def test_grava_perfil(client, sessao):
    r = client.put(f"/api/validacao/sessoes/{sessao['id']}/perfil", json=PERFIL)
    assert r.status_code == 200 and r.json()["faixa_etaria"] == "30_A_44"


# Uma resposta fora da lista em cada pergunta é recusada.
@pytest.mark.parametrize("campo", list(PERFIL))
def test_perfil_invalido(client, sessao, campo):
    corpo = {**PERFIL, campo: "OUTRA"}
    assert client.put(f"/api/validacao/sessoes/{sessao['id']}/perfil", json=corpo).status_code == 422


# Perfil, eventos e feedback de uma sessão que não existe: 404.
@pytest.mark.parametrize("metodo, final, corpo", [
    ("PUT", "perfil", PERFIL),
    ("POST", "eventos", [evento()]),
    ("POST", "feedback", {"sus": SUS_MAXIMO}),
])
def test_sessao_inexistente(client, metodo, final, corpo):
    assert client.request(metodo, f"/api/validacao/sessoes/99/{final}", json=corpo).status_code == 404


# Lote com 200 eventos (no limite) é gravado; com 201, recusado.
@pytest.mark.parametrize("quantidade, status", [(200, 201), (201, 422)])
def test_tamanho_do_lote(client, sessao, quantidade, status):
    r = client.post(f"/api/validacao/sessoes/{sessao['id']}/eventos", json=[evento()] * quantidade)
    assert r.status_code == status


# Tarefa de 0 a 4 (limites aceitos); -1 e 5 recusados.
@pytest.mark.parametrize("tarefa, status", [(-1, 422), (0, 201), (4, 201), (5, 422)])
def test_tarefa_do_evento(client, sessao, tarefa, status):
    r = client.post(f"/api/validacao/sessoes/{sessao['id']}/eventos", json=[evento(tarefa=tarefa)])
    assert r.status_code == status


# Texto comprido é cortado em 200 letras, sem perder o evento; a chamada à API vai inteira no CSV.
def test_eventos_no_csv(client, logado, sessao):
    lote = [evento(texto="x" * 300),
            evento(tipo="CHAMADA_API", tarefa=1, metodo="POST", caminho="/clientes", status=201, id_registro=15)]
    r = client.post(f"/api/validacao/sessoes/{sessao['id']}/eventos", json=lote)
    assert r.json() == {"gravados": 2}
    csv = client.get("/api/validacao/exportar/eventos", headers=logado).text
    assert ";" + "x" * 200 + ";" in csv
    assert ";1;CHAMADA_API;" in csv and ";POST;/clientes;201;15;" in csv


# O questionário é respondido uma vez só: a segunda resposta dá 409.
def test_feedback_uma_vez(client, sessao):
    caminho = f"/api/validacao/sessoes/{sessao['id']}/feedback"
    assert client.post(caminho, json={"sus": SUS_MAXIMO, "mais_dificil": "Achar a placa"}).status_code == 201
    assert client.post(caminho, json={"sus": SUS_MAXIMO}).status_code == 409


# Nota 0 e 6 (fora de 1 a 5) e listas com 9 e 11 respostas são recusadas.
@pytest.mark.parametrize("sus", [[0] + [3] * 9, [6] + [3] * 9, [3] * 9, [3] * 11])
def test_sus_invalido(client, sessao, sus):
    assert client.post(f"/api/validacao/sessoes/{sessao['id']}/feedback", json={"sus": sus}).status_code == 422


# Pontuação do SUS: melhor caso 100, pior caso 0, tudo neutro 50.
@pytest.mark.parametrize("notas, pontuacao", [(SUS_MAXIMO, 100), ([1, 5] * 5, 0), ([3] * 10, 50)])
def test_pontuacao_sus(notas, pontuacao):
    assert validacao_service.pontuacao_sus(notas) == pontuacao


# Uma linha por sessão: quem respondeu tem a pontuação; quem parou antes fica em branco.
def test_sessoes_no_csv(client, logado, aplicador, sessao):
    client.put(f"/api/validacao/sessoes/{sessao['id']}/perfil", json=PERFIL)
    client.post(f"/api/validacao/sessoes/{sessao['id']}/feedback", json={"sus": SUS_MAXIMO})
    client.post("/api/validacao/sessoes", json={"codigo_aplicador": aplicador["codigo"], "origem": "PERSONA"})
    linhas = client.get("/api/validacao/exportar/sessoes", headers=logado).text.splitlines()
    assert len(linhas) == 3
    assert "PESSOA;30_A_44" in linhas[1] and ";100,0;" in linhas[1]
    assert "PERSONA" in linhas[2] and ";100,0;" not in linhas[2]
