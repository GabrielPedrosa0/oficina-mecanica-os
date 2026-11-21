# Testes das regras da exportação em CSV (services/exportacao_service.py).
# Técnicas: partição de equivalência (valores válidos e inválidos) e
# análise de valor limite (os valores na beirada de cada regra).
import pytest

from repositories import ordem_servico_repository


def linhas_do_csv(r):
    return r.content.decode("utf-8-sig").strip().split("\r\n")


# Exportação válida: arquivo CSV com cabeçalho, uma linha por OS (a mais recente
# primeiro), separador ";", datas dd/mm/aaaa hh:mm, status com nome e valor com vírgula.
def test_exportar(client, os_corpo):
    client.post("/api/ordens-servico", json={**os_corpo, "data_abertura": "2026-11-10T08:00:00"})
    client.post("/api/ordens-servico", json={**os_corpo, "status": "ENTREGUE"})
    ordem_servico_repository.ordens[2]["valor_total"] = 340.5
    r = client.get("/api/ordens-servico/exportar")  # não pode ser lido como {id}
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/csv")
    assert "ordens-servico.csv" in r.headers["content-disposition"]
    assert r.content.startswith("﻿".encode())  # BOM, para o Excel ler os acentos
    linhas = linhas_do_csv(r)
    assert linhas[0].startswith("OS;Placa;Veículo;Cliente")
    assert len(linhas) == 3
    assert linhas[1].split(";") == ["2", "QRS4F21", "Volkswagen Gol 1.6", "Marina Souza", "",
                                    "Barulho ao frear", "", "Entregue", "11/11/2026 08:10",
                                    "11/11/2026 17:00", "", "340,50"]
    assert linhas[2].endswith(";0,00")


# Sem ordens: só o cabeçalho.
def test_exportar_vazio(client):
    assert len(linhas_do_csv(client.get("/api/ordens-servico/exportar"))) == 1


# Regra da fórmula no Excel: texto que começa com = + - @ ganha um apóstrofo.
# Partição válida: texto comum, e o símbolo fora do começo (não muda).
@pytest.mark.parametrize("problema, esperado", [
    ("=HYPERLINK(1)", "'=HYPERLINK(1)"),
    ("+1", "'+1"),
    ("-1", "'-1"),
    ("@SOMA", "'@SOMA"),
    ("Freio", "Freio"),
    ("a=1", "a=1"),
], ids=["igual", "mais", "menos", "arroba", "texto-comum", "simbolo-no-meio"])
def test_formula_neutralizada(client, os_corpo, problema, esperado):
    client.post("/api/ordens-servico", json={**os_corpo, "problema_relatado": problema})
    assert linhas_do_csv(client.get("/api/ordens-servico/exportar"))[1].split(";")[5] == esperado


# Regra dos filtros: os mesmos da listagem. Filtro sem resultado deixa só o cabeçalho.
@pytest.mark.parametrize("query, total", [
    ("", 2),
    ("?status=ENTREGUE", 1),
    ("?placa=qrs", 2),
    ("?cliente=marina", 2),
    ("?cliente=ninguem", 0),
], ids=["sem-filtro", "status", "placa", "cliente", "sem-resultado"])
def test_filtros(client, os_corpo, query, total):
    client.post("/api/ordens-servico", json=os_corpo)
    client.post("/api/ordens-servico", json={**os_corpo, "status": "ENTREGUE"})
    assert len(linhas_do_csv(client.get(f"/api/ordens-servico/exportar{query}"))) == 1 + total


# Filtro de status desconhecido dá 422.
def test_status_invalido(client):
    assert client.get("/api/ordens-servico/exportar?status=QUEBRADA").status_code == 422
