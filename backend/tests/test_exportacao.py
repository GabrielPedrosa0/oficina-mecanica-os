from tests.conftest import cobrar


def test_exportar_csv(client, os_corpo):
    client.post("/api/ordens-servico", json={**os_corpo, "problema_relatado": "=HYPERLINK(\"http://x\")"})
    client.post("/api/ordens-servico", json={**os_corpo, "status": "ENTREGUE"})
    cobrar(2, 340)
    r = client.get("/api/ordens-servico/exportar")  # não pode ser lido como {id}
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/csv")
    assert "ordens-servico.csv" in r.headers["content-disposition"]
    linhas = r.content.decode("utf-8-sig").strip().split("\r\n")
    assert linhas[0].startswith("OS;Placa;Veículo;Cliente")
    assert len(linhas) == 3
    assert "Entregue" in linhas[1]  # a mais recente primeiro
    assert "340,00" in linhas[1]
    assert "'=HYPERLINK" in linhas[2]  # fórmula neutralizada


def test_exportar_respeita_filtros(client, os_corpo):
    client.post("/api/ordens-servico", json=os_corpo)
    client.post("/api/ordens-servico", json={**os_corpo, "status": "ENTREGUE"})
    r = client.get("/api/ordens-servico/exportar?status=ENTREGUE")
    assert len(r.content.decode("utf-8-sig").strip().split("\r\n")) == 2
    assert client.get("/api/ordens-servico/exportar?status=QUEBRADA").status_code == 422


def test_exportar_sem_ordens_so_tem_o_cabecalho(client):
    r = client.get("/api/ordens-servico/exportar")
    assert len(r.content.decode("utf-8-sig").strip().split("\r\n")) == 1
