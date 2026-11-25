# Testes das regras de negócio dos clientes (services/cliente_service.py).
# Técnicas: partição de equivalência (valores válidos e inválidos) e
# análise de valor limite (os valores na beirada de cada regra).
from datetime import date

import pytest

from repositories import veiculo_repository
from tests.conftest import novo_veiculo


# Cadastro válido: nome e e-mail limpos, telefone formatado, sem veículos
# e "cliente desde" igual a hoje quando não é informado.
def test_cadastrar(client):
    r = client.post("/api/clientes", json={"nome": "  Ana Lima ", "telefone": "85 9 0000-0003",
                                           "email": " ANA@Exemplo.com "})
    assert r.status_code == 201
    c = r.json()
    assert c["nome"] == "Ana Lima"
    assert c["telefone"] == "(85) 90000-0003"
    assert c["email"] == "ana@exemplo.com"
    assert c["quantidade_veiculos"] == 0
    assert c["cliente_desde"] == date.today().isoformat()


# "Cliente desde" informado é mantido como veio.
def test_cliente_desde(client):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001",
                                           "cliente_desde": "2024-03-10"})
    assert r.json()["cliente_desde"] == "2024-03-10"


# CPF/CNPJ e endereço que chegam na API são gravados e voltam na consulta.
def test_cadastrar_com_endereco(client):
    endereco = {"cpf_cnpj": "12345678901", "cep": "60000000", "logradouro": "Rua A", "numero": "10",
                "complemento": "Casa 2", "bairro": "Centro", "cidade": "Fortaleza", "uf": "CE"}
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", **endereco})
    assert r.status_code == 201
    salvo = client.get(f"/api/clientes/{r.json()['id']}").json()
    assert {campo: salvo[campo] for campo in endereco} == endereco


# CPF/CNPJ e campos do endereço são opcionais: ausente, vazio ou só espaços
# vira None (partição válida sem valor).
CAMPOS_OPCIONAIS = ["cpf_cnpj", "cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"]


@pytest.mark.parametrize("valor", [None, "", "   "], ids=["ausente", "vazio", "so-espacos"])
def test_campos_opcionais(client, valor):
    corpo = {"nome": "Ana", "telefone": "85900000001", **{campo: valor for campo in CAMPOS_OPCIONAIS}}
    r = client.post("/api/clientes", json=corpo)
    assert r.status_code == 201
    assert all(r.json()[campo] is None for campo in CAMPOS_OPCIONAIS)


# Campos de texto livre do endereço: gravados sem os espaços em volta
# (limite: 1 caractere).
CAMPOS_TEXTO = ["logradouro", "numero", "complemento", "bairro", "cidade"]


@pytest.mark.parametrize("valor", ["A", " A "], ids=["um-caractere", "um-caractere-com-espacos"])
def test_campos_texto(client, valor):
    corpo = {"nome": "Ana", "telefone": "85900000001", **{campo: valor for campo in CAMPOS_TEXTO}}
    r = client.post("/api/clientes", json=corpo)
    assert r.status_code == 201
    assert all(r.json()[campo] == "A" for campo in CAMPOS_TEXTO)


# CPF/CNPJ válido: 11 dígitos (CPF) ou 14 (CNPJ), com ou sem pontuação.
# Sempre é gravado só com os dígitos.
@pytest.mark.parametrize("cpf_cnpj, esperado", [
    ("12345678901", "12345678901"),
    ("123.456.789-01", "12345678901"),
    ("12345678000190", "12345678000190"),
    ("12.345.678/0001-90", "12345678000190"),
], ids=["cpf-11-digitos", "cpf-com-pontuacao", "cnpj-14-digitos", "cnpj-com-pontuacao"])
def test_cpf_cnpj_valido(client, cpf_cnpj, esperado):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "cpf_cnpj": cpf_cnpj})
    assert r.status_code == 201
    assert r.json()["cpf_cnpj"] == esperado


# CPF/CNPJ inválido: nas beiradas do CPF (10 e 12 dígitos), do CNPJ
# (13 e 15 dígitos) ou sem nenhum dígito.
@pytest.mark.parametrize("cpf_cnpj", [
    "1234567890",
    "123456789012",
    "1234567890123",
    "123456789012345",
    "abc",
], ids=["10-digitos", "12-digitos", "13-digitos", "15-digitos", "sem-digitos"])
def test_cpf_cnpj_invalido(client, cpf_cnpj):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "cpf_cnpj": cpf_cnpj})
    assert r.status_code == 422
    assert r.json()["detail"] == "CPF/CNPJ inválido. Use 11 dígitos (CPF) ou 14 (CNPJ)."


# CPF/CNPJ repetido: outro cliente não pode usar o mesmo, nem com pontuação (409).
@pytest.mark.parametrize("cpf_cnpj", ["12345678901", "123.456.789-01"], ids=["igual", "com-pontuacao"])
def test_cpf_cnpj_repetido(client, cpf_cnpj):
    client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "cpf_cnpj": "12345678901"})
    r = client.post("/api/clientes", json={"nome": "Outra", "telefone": "85900000002", "cpf_cnpj": cpf_cnpj})
    assert r.status_code == 409
    assert r.json()["detail"] == "Já existe um cliente com esse CPF/CNPJ."


# CEP válido: 8 dígitos, com ou sem hífen; é gravado só com os dígitos.
@pytest.mark.parametrize("cep", ["60000000", "60000-000"], ids=["8-digitos", "com-hifen"])
def test_cep_valido(client, cep):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "cep": cep})
    assert r.status_code == 201
    assert r.json()["cep"] == "60000000"


# CEP inválido: 7 ou 9 dígitos (limites em volta de 8) ou sem nenhum dígito.
@pytest.mark.parametrize("cep", ["6000000", "600000000", "abc"], ids=["7-digitos", "9-digitos", "sem-digitos"])
def test_cep_invalido(client, cep):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "cep": cep})
    assert r.status_code == 422
    assert r.json()["detail"] == "CEP inválido. Use 8 dígitos, ex.: 60000-000."


# UF válida: 2 letras; minúsculas e espaços em volta são aceitos e gravados como "CE".
@pytest.mark.parametrize("uf", ["CE", "ce", " Ce "], ids=["maiusculas", "minusculas", "com-espacos"])
def test_uf_valida(client, uf):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "uf": uf})
    assert r.status_code == 201
    assert r.json()["uf"] == "CE"


# UF inválida: 1 ou 3 letras (limites em volta de 2) ou com número.
@pytest.mark.parametrize("uf", ["C", "CEA", "C1"], ids=["1-letra", "3-letras", "com-numero"])
def test_uf_invalida(client, uf):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "uf": uf})
    assert r.status_code == 422
    assert r.json()["detail"] == "UF inválida. Use a sigla com 2 letras, ex.: CE."


# Nome: partição válida (texto com 1 ou mais letras, limite = 1 caractere)
# e inválida (vazio ou só espaços).
@pytest.mark.parametrize("nome, status", [
    ("A", 201),
    (" A ", 201),
    ("", 422),
    ("   ", 422),
], ids=["um-caractere", "um-caractere-com-espacos", "vazio", "so-espacos"])
def test_nome(client, nome, status):
    r = client.post("/api/clientes", json={"nome": nome, "telefone": "85900000001"})
    assert r.status_code == status
    if status == 201:
        assert r.json()["nome"] == "A"
    else:
        assert r.json()["detail"] == "O nome é obrigatório."


# Telefone válido: 10 dígitos (fixo) ou 11 dígitos (celular), com ou sem
# pontuação. O resultado sempre fica no formato (DD) NNNN-NNNN ou (DD) NNNNN-NNNN.
@pytest.mark.parametrize("telefone, esperado", [
    ("8532221111", "(85) 3222-1111"),
    ("85900000001", "(85) 90000-0001"),
    ("(85) 3222-1111", "(85) 3222-1111"),
    ("85 9 0000-0001", "(85) 90000-0001"),
], ids=["10-digitos", "11-digitos", "10-com-pontuacao", "11-com-pontuacao"])
def test_telefone_valido(client, telefone, esperado):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": telefone})
    assert r.status_code == 201
    assert r.json()["telefone"] == esperado


# Telefone inválido: menos de 10 ou mais de 11 dígitos (limites 9 e 12),
# vazio ou sem nenhum dígito.
@pytest.mark.parametrize("telefone", [
    "853222111",
    "859000000011",
    "123",
    "",
    "abc-defg",
], ids=["9-digitos", "12-digitos", "3-digitos", "vazio", "sem-digitos"])
def test_telefone_invalido(client, telefone):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": telefone})
    assert r.status_code == 422
    assert r.json()["detail"] == "Telefone inválido. Use DDD + número, ex.: (85) 90000-0001."


# E-mail opcional: ausente, vazio ou só espaços vira None (partição válida).
@pytest.mark.parametrize("email", [None, "", "   "], ids=["ausente", "vazio", "so-espacos"])
def test_email_opcional(client, email):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "email": email})
    assert r.status_code == 201
    assert r.json()["email"] is None


# E-mail válido: o menor formato aceito é "a@b.c" (limite) e sai em minúsculas.
@pytest.mark.parametrize("email, esperado", [
    ("a@b.c", "a@b.c"),
    ("Ana.Lima@Exemplo.com.br", "ana.lima@exemplo.com.br"),
], ids=["menor-formato", "maiusculas"])
def test_email_valido(client, email, esperado):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "email": email})
    assert r.status_code == 201
    assert r.json()["email"] == esperado


# E-mail inválido: sem arroba, sem ponto no domínio, sem usuário,
# com espaço no meio, com dois arrobas ou terminando em ponto.
@pytest.mark.parametrize("email", [
    "sem-arroba",
    "a@b",
    "@b.c",
    "a b@c.d",
    "a@@b.c",
    "a@b.",
], ids=["sem-arroba", "sem-ponto", "sem-usuario", "com-espaco", "dois-arrobas", "termina-com-ponto"])
def test_email_invalido(client, email):
    r = client.post("/api/clientes", json={"nome": "Ana", "telefone": "85900000001", "email": email})
    assert r.status_code == 422
    assert r.json()["detail"] == "E-mail inválido."


# E-mail repetido: outro cliente não pode usar o mesmo e-mail,
# nem mudando maiúsculas ou com espaços em volta (409).
@pytest.mark.parametrize("email", ["marina@exemplo.com", " MARINA@exemplo.com "], ids=["igual", "maiusculas-e-espacos"])
def test_email_repetido(client, cliente, email):
    r = client.post("/api/clientes", json={"nome": "Outra", "telefone": "85900000002", "email": email})
    assert r.status_code == 409
    assert r.json()["detail"] == "Já existe um cliente com esse e-mail."


# Listar: ordem alfabética ignorando acentos; o filtro por nome ignora
# acentos e maiúsculas; filtro vazio lista todos; filtro sem resultado devolve [].
@pytest.mark.parametrize("filtro, esperado", [
    (None, ["Luís Araújo", "Marina Souza"]),
    ("", ["Luís Araújo", "Marina Souza"]),
    ("araujo", ["Luís Araújo"]),
    ("MARINA", ["Marina Souza"]),
    ("zzz", []),
], ids=["sem-filtro", "filtro-vazio", "sem-acento", "maiusculas", "nenhum"])
def test_listar(client, cliente, filtro, esperado):
    client.post("/api/clientes", json={"nome": "Luís Araújo", "telefone": "85900000006"})
    url = "/api/clientes" if filtro is None else f"/api/clientes?nome={filtro}"
    assert [c["nome"] for c in client.get(url).json()] == esperado


# Listar sem nenhum cliente cadastrado devolve lista vazia.
def test_listar_vazio(client):
    assert client.get("/api/clientes").json() == []


# Consultar: a quantidade de veículos é calculada (limites 0, 1 e 2 veículos).
@pytest.mark.parametrize("quantidade", [0, 1, 2], ids=["nenhum", "um", "dois"])
def test_consultar(client, cliente, quantidade):
    for i in range(1, quantidade + 1):
        novo_veiculo(i, f"ABC{i}D2{i}", "Fiat", "Uno", cliente["id"])
    r = client.get(f"/api/clientes/{cliente['id']}")
    assert r.status_code == 200
    assert r.json()["nome"] == "Marina Souza"
    assert r.json()["quantidade_veiculos"] == quantidade


# Consultar, atualizar, excluir, veículos e histórico de um id que não existe: 404.
@pytest.mark.parametrize("metodo, caminho", [
    ("GET", "/api/clientes/99"),
    ("PUT", "/api/clientes/99"),
    ("DELETE", "/api/clientes/99"),
    ("GET", "/api/clientes/99/veiculos"),
    ("GET", "/api/clientes/99/historico"),
    ("GET", "/api/clientes/0"),
], ids=["consultar", "atualizar", "excluir", "veiculos", "historico", "id-zero"])
def test_id_inexistente(client, cliente, metodo, caminho):
    corpo = {"nome": "X", "telefone": "85900000001"} if metodo == "PUT" else None
    r = client.request(metodo, caminho, json=corpo)
    assert r.status_code == 404
    assert r.json()["detail"] == "Cliente não encontrado."


# Atualizar válido: grava os novos dados formatados e o cliente pode manter o próprio e-mail.
def test_atualizar(client, cliente):
    r = client.put(f"/api/clientes/{cliente['id']}", json={"nome": " Marina S. ", "telefone": "8532221111",
                                                           "email": "MARINA@exemplo.com"})
    assert r.status_code == 200
    c = r.json()
    assert c["id"] == cliente["id"]
    assert c["nome"] == "Marina S."
    assert c["telefone"] == "(85) 3222-1111"
    assert c["email"] == "marina@exemplo.com"
    assert client.get(f"/api/clientes/{cliente['id']}").json()["nome"] == "Marina S."


# Atualizar o endereço: o novo é gravado e apagar o complemento (vazio) deixa None.
def test_atualizar_endereco(client, cliente):
    client.put(f"/api/clientes/{cliente['id']}", json={"nome": "Marina Souza", "telefone": "85900000001",
                                                       "cep": "60000000", "complemento": "Casa 2"})
    r = client.put(f"/api/clientes/{cliente['id']}", json={"nome": "Marina Souza", "telefone": "85900000001",
                                                           "cep": "60110000", "complemento": ""})
    assert r.status_code == 200
    salvo = client.get(f"/api/clientes/{cliente['id']}").json()
    assert salvo["cep"] == "60110000"
    assert salvo["complemento"] is None


# Atualizar mantendo o próprio CPF/CNPJ não conta como repetido.
def test_atualizar_mesmo_cpf_cnpj(client, cliente):
    corpo = {"nome": "Marina Souza", "telefone": "85900000001", "cpf_cnpj": "12345678901"}
    client.put(f"/api/clientes/{cliente['id']}", json=corpo)
    r = client.put(f"/api/clientes/{cliente['id']}", json={**corpo, "cpf_cnpj": "123.456.789-01"})
    assert r.status_code == 200
    assert r.json()["cpf_cnpj"] == "12345678901"


# Atualizar com o e-mail de outro cliente: 409, e nada muda.
def test_atualizar_email_de_outro(client, cliente):
    outro = client.post("/api/clientes", json={"nome": "Outra", "telefone": "85900000002",
                                               "email": "outra@exemplo.com"}).json()
    r = client.put(f"/api/clientes/{outro['id']}", json={"nome": "Outra", "telefone": "85900000002",
                                                         "email": "marina@exemplo.com"})
    assert r.status_code == 409
    assert r.json()["detail"] == "Já existe um cliente com esse e-mail."
    assert client.get(f"/api/clientes/{outro['id']}").json()["email"] == "outra@exemplo.com"


# Atualizar com dados inválidos usa as mesmas regras do cadastro (422).
@pytest.mark.parametrize("corpo, detalhe", [
    ({"nome": " ", "telefone": "85900000001"}, "O nome é obrigatório."),
    ({"nome": "Ana", "telefone": "853222111"}, "Telefone inválido. Use DDD + número, ex.: (85) 90000-0001."),
    ({"nome": "Ana", "telefone": "85900000001", "email": "a@b"}, "E-mail inválido."),
], ids=["nome-vazio", "telefone-9-digitos", "email-invalido"])
def test_atualizar_invalido(client, cliente, corpo, detalhe):
    r = client.put(f"/api/clientes/{cliente['id']}", json=corpo)
    assert r.status_code == 422
    assert r.json()["detail"] == detalhe


# Excluir: cliente sem veículos sai (204) e depois não é mais encontrado (404).
def test_excluir(client, cliente):
    assert client.delete(f"/api/clientes/{cliente['id']}").status_code == 204
    assert client.get(f"/api/clientes/{cliente['id']}").status_code == 404
    assert client.delete(f"/api/clientes/{cliente['id']}").status_code == 404


# Excluir cliente com veículo vinculado (limite: 1 veículo) é proibido (409).
def test_excluir_com_veiculo(client, cliente, veiculo):
    r = client.delete(f"/api/clientes/{cliente['id']}")
    assert r.status_code == 409
    assert r.json()["detail"] == "Não é possível excluir: o cliente possui veículos vinculados."
    veiculo_repository.excluir(veiculo["id"])
    assert client.delete(f"/api/clientes/{cliente['id']}").status_code == 204


# Veículos do cliente: só os dele (o veículo de outro cliente não aparece).
def test_veiculos_do_cliente(client, cliente, veiculo):
    outro = client.post("/api/clientes", json={"nome": "Outra", "telefone": "85900000002"}).json()
    novo_veiculo(2, "ABC1D23", "Fiat", "Uno", outro["id"])
    r = client.get(f"/api/clientes/{cliente['id']}/veiculos")
    assert r.status_code == 200
    assert [v["placa"] for v in r.json()] == ["QRS4F21"]
    assert [v["placa"] for v in client.get(f"/api/clientes/{outro['id']}/veiculos").json()] == ["ABC1D23"]


# Cliente sem veículos: lista vazia.
def test_veiculos_vazio(client, cliente):
    assert client.get(f"/api/clientes/{cliente['id']}/veiculos").json() == []


# Histórico: ordens da mais recente para a mais antiga.
def test_historico(client, cliente, os_corpo):
    client.post("/api/ordens-servico", json={**os_corpo, "data_abertura": "2026-05-12T09:00:00",
                                            "data_previsao": None, "status": "ENTREGUE"})
    client.post("/api/ordens-servico", json=os_corpo)
    r = client.get(f"/api/clientes/{cliente['id']}/historico")
    assert r.status_code == 200
    assert [o["id"] for o in r.json()] == [2, 1]


# Histórico com a mesma data de abertura: desempata pelo id (maior primeiro).
def test_historico_mesma_data(client, cliente, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    client.post("/api/ordens-servico", json=os_corpo)
    assert [o["id"] for o in client.get(f"/api/clientes/{cliente['id']}/historico").json()] == [2, 1]


# Histórico de cliente sem veículos: lista vazia.
def test_historico_vazio(client, cliente):
    assert client.get(f"/api/clientes/{cliente['id']}/historico").json() == []
