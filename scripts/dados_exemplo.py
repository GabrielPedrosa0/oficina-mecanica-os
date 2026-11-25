"""Preenche o backend com os dados de exemplo do Figma (para testar o frontend e apresentar).

Os dados ficam em memória: rode de novo sempre que reiniciar o servidor.

    cd backend && uvicorn app:app --reload        (num terminal)
    python scripts/dados_exemplo.py               (em outro, na raiz do repositório)

Para usar outro endereço: python scripts/dados_exemplo.py http://127.0.0.1:8000
Só usa a biblioteca padrão do Python.

Para entrar no sistema: gerente@oficina.com.br / oficina123 (Gerente)
                        recepcao@oficina.com.br / oficina123 (Recepção)
"""
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000").rstrip("/") + "/api"


def enviar(metodo, caminho, dados=None):
    pedido = urllib.request.Request(
        BASE + caminho, data=json.dumps(dados or {}).encode(), method=metodo,
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(pedido) as resposta:
            return json.loads(resposta.read())
    except urllib.error.HTTPError as erro:
        print(f"  ! {metodo} {caminho}: {erro.code} {erro.read().decode()}")
        return None
    except urllib.error.URLError:
        sys.exit(f"Sem conexão com {BASE}. O backend está ligado? (cd backend && uvicorn app:app --reload)")


def post(caminho, dados=None):
    return enviar("POST", caminho, dados)


agora = datetime.now().replace(second=0, microsecond=0)
hoje = agora.replace(hour=0, minute=0)
fmt = lambda d: d.strftime("%Y-%m-%dT%H:%M:%S") if d else None  # noqa: E731

mecanicos = [  # nome, cpf, telefone, início, fim
    ("Rafael Lima", "526.018.159-06", "(85) 90000-0101", "08:00", "17:00"),
    ("Diego Alves", "083.016.613-05", "(85) 90000-0102", "07:00", "16:00"),
    ("Bruno Costa", "186.091.390-34", "(85) 90000-0103", "09:00", "18:00"),
]
servicos = [  # descrição, minutos, preço base
    ("Troca de óleo e filtro", 40, 120),
    ("Alinhamento e balanceamento", 60, 160),
    ("Revisão de freios", 90, 180),
    ("Diagnóstico elétrico", 60, 150),
    ("Troca de embreagem", 240, 650),
    ("Revisão de 60 mil km", 180, 480),
]
pecas = [  # código, descrição, estoque, mínimo, preço de venda
    ("OLE-5W30-1L", "Óleo sintético 5W30 1 L", 24, 6, 40),
    ("FLT-OL-0098", "Filtro de óleo", 12, 4, 30),
    ("FLT-AR-0210", "Filtro de ar", 8, 4, 30),
    ("PST-DIA-0451", "Pastilha de freio dianteira", 4, 4, 140),
    ("DSC-FR-0310", "Disco de freio dianteiro", 6, 2, 220),
    ("BAT-60A", "Bateria 60 Ah", 2, 2, 520),
]
clientes = [  # nome, telefone, e-mail, CPF, endereço (cep, rua, número, complemento, bairro)
    ("Marina Souza", "(85) 90000-0001", "marina@exemplo.com", "996.030.824-30",
     ("60110-000", "Rua das Flores", "120", "Apto 302", "Aldeota")),
    ("João Pereira", "(85) 90000-0002", None, "628.194.821-12", ("60160-000", "Av. Santos Dumont", "1500", None, "Meireles")),
    ("Ana Lima", "(85) 90000-0003", "ana.lima@exemplo.com", "993.518.190-19",
     ("60175-000", "Rua Silva Paulet", "45", None, "Aldeota")),
    ("Carlos Mendes", "(85) 90000-0004", None, "937.865.797-41", ("60810-000", "Av. Washington Soares", "900", "Sala 4", "Edson Queiroz")),
    ("Patrícia Rocha", "(85) 90000-0005", None, "543.231.948-97", ("60420-000", "Rua Padre Valdevino", "77", None, "Joaquim Távora")),
    ("Luís Araújo", "(85) 90000-0006", None, "757.491.186-06", ("60325-000", "Rua Tomás Acioli", "300", None, "Dionísio Torres")),
]
veiculos = [  # placa, chassi, marca, modelo, ano, km, índice do cliente
    ("QRS4F21", "9BWAB05U8KT004821", "Volkswagen", "Gol 1.6", 2019, 82300, 0),
    ("TUV7G84", "9BD57834MM1102233", "Fiat", "Strada 1.3", 2021, 45120, 1),
    ("MNP2K56", "9BGKS48U0LG112045", "Chevrolet", "Onix 1.0", 2020, 61800, 2),
    ("HJK9L13", "93HFC2630JZ200871", "Honda", "Civic 2.0", 2018, 60050, 3),
    ("DFG3M72", "9BHBG51DBHP641590", "Hyundai", "HB20 1.6", 2017, 98400, 4),
    ("ABC1234", "9BRBD48E2F2655012", "Toyota", "Corolla 2.0", 2015, 132000, 5),
]
# veículo, serviço, problema, mecânico, abertura, previsão, conclusão, status, valor, garantia, observações
ordens = [
    (5, "Troca de embreagem", "Embreagem patinando", None, agora - timedelta(hours=1), None, None, "ORCAMENTO",
     1980, False, None),
    (3, "Revisão de 60 mil km", "Revisão programada", 1, hoje + timedelta(hours=7, minutes=40),
     hoje + timedelta(days=3, hours=17), None, "EM_SERVICO", 1250, False, None),
    (2, "Alinhamento e balanceamento", "Carro puxando para a direita", 0, hoje + timedelta(hours=7, minutes=30),
     hoje + timedelta(hours=15, minutes=30), None, "PRONTA", 160, False, None),
    (1, "Freios dianteiros", "Barulho ao frear", 1, hoje - timedelta(days=1, hours=-9),
     hoje + timedelta(days=1, hours=10), None, "AGUARDANDO_PECA", 780, False, None),
    (0, "Troca de óleo e filtros", "Barulho ao frear em baixa velocidade e luz de óleo acesa.", 0,
     hoje + timedelta(hours=8, minutes=10), hoje + timedelta(hours=17), None, "EM_SERVICO", 340, False,
     "Cliente pediu para avisar por WhatsApp antes de qualquer serviço extra."),
    (0, "Troca de pastilhas", "Pastilha gasta", 0, hoje - timedelta(days=20), hoje - timedelta(days=19),
     hoje - timedelta(days=19, hours=-2), "ENTREGUE", 180, False, None),
    (3, "Troca de pneus", "Pneus carecas", 1, hoje - timedelta(days=5), hoje - timedelta(days=4),
     hoje - timedelta(days=4, hours=-3), "ENTREGUE", 2400, False, None),
    (4, "Revisão de freios", "Barulho voltou depois da troca de pastilhas", 2, agora - timedelta(minutes=30),
     hoje + timedelta(days=1, hours=12), None, "ORCAMENTO", 0, True, "Retorno do serviço de 20 dias atrás."),
]

print(f"Enviando para {BASE} ...")

ids_mecanicos = []
for nome, cpf, telefone, inicio, fim in mecanicos:
    m = post("/mecanicos", {"nome": nome, "cpf": cpf, "telefone": telefone,
                            "expediente_inicio": inicio, "expediente_fim": fim})
    ids_mecanicos.append(m and m["id"])

catalogo = {}
for descricao, minutos, preco in servicos:
    s = post("/servicos", {"descricao": descricao, "tempo_estimado_min": minutos, "preco_base": preco})
    catalogo[descricao] = s

estoque = {}
for codigo, descricao, qtd, minimo, preco in pecas:
    p = post("/pecas", {"codigo": codigo, "descricao": descricao, "estoque": qtd, "estoque_minimo": minimo,
                        "preco_venda": preco})
    estoque[codigo] = p

ids_clientes = []
for nome, telefone, email, cpf, (cep, rua, numero, complemento, bairro) in clientes:
    c = post("/clientes", {"nome": nome, "telefone": telefone, "email": email, "cpf_cnpj": cpf,
                           "cliente_desde": "2024-03-10", "cep": cep, "rua": rua, "numero": numero,
                           "complemento": complemento, "bairro": bairro, "cidade": "Fortaleza", "uf": "CE"})
    ids_clientes.append(c and c["id"])

ids_veiculos = []
for placa, chassi, marca, modelo, ano, km, cli in veiculos:
    v = post("/veiculos", {"placa": placa, "chassi": chassi, "marca": marca, "modelo": modelo, "ano": ano,
                           "quilometragem": km, "cliente_id": ids_clientes[cli]})
    ids_veiculos.append(v and v["id"])

ids_ordens = []
for vei, servico, problema, mec, abertura, previsao, conclusao, status, valor, garantia, obs in ordens:
    os_ = post("/ordens-servico", {
        "veiculo_id": ids_veiculos[vei], "servico": servico, "problema_relatado": problema,
        "mecanico_id": ids_mecanicos[mec] if mec is not None else None, "data_abertura": fmt(abertura),
        "data_previsao": fmt(previsao), "data_conclusao": fmt(conclusao), "status": status,
        "valor_total": valor, "garantia": garantia, "observacoes": obs})
    ids_ordens.append(os_ and os_["id"])


def servico_do_catalogo(os_id, descricao, valor=None):
    s = catalogo.get(descricao)
    if os_id and s:
        post(f"/ordens-servico/{os_id}/itens", {
            "tipo": "servico", "descricao": s["descricao"], "quantidade": 1,
            "valor_unitario": valor if valor is not None else s["preco_base"],
            "tempo_estimado_min": s["tempo_estimado_min"], "servico_id": s["id"]})


def peca_do_estoque(os_id, codigo, quantidade, valor=None):
    p = estoque.get(codigo)
    if os_id and p:
        post(f"/ordens-servico/{os_id}/itens", {
            "tipo": "peca", "descricao": p["descricao"], "codigo": p["codigo"], "quantidade": quantidade,
            "valor_unitario": valor if valor is not None else p["preco_venda"], "peca_id": p["id"]})


# Serviços e peças das OS abertas (o total de cada OS passa a ser a soma dos itens).
troca_oleo, freios, alinhamento, revisao, embreagem, garantia_os = (
    ids_ordens[4], ids_ordens[3], ids_ordens[2], ids_ordens[1], ids_ordens[0], ids_ordens[7])
servico_do_catalogo(troca_oleo, "Troca de óleo e filtro")
peca_do_estoque(troca_oleo, "OLE-5W30-1L", 4)
peca_do_estoque(troca_oleo, "FLT-OL-0098", 1)
peca_do_estoque(troca_oleo, "FLT-AR-0210", 1)
servico_do_catalogo(freios, "Revisão de freios")
peca_do_estoque(freios, "PST-DIA-0451", 1)
peca_do_estoque(freios, "DSC-FR-0310", 2, 230)
servico_do_catalogo(revisao, "Revisão de 60 mil km")
peca_do_estoque(revisao, "OLE-5W30-1L", 4)
peca_do_estoque(revisao, "FLT-OL-0098", 1)
servico_do_catalogo(embreagem, "Troca de embreagem")
servico_do_catalogo(garantia_os, "Revisão de freios", 0)

# Linha do tempo da OS principal (a de troca de óleo) e das outras.
if troca_oleo:
    post(f"/ordens-servico/{troca_oleo}/apontamentos", {
        "tipo": "DIAGNOSTICO",
        "descricao": "Pastilhas dianteiras com 30% de vida útil; sugerir troca na próxima revisão."})
    post(f"/ordens-servico/{troca_oleo}/enviar-orcamento")
    post(f"/ordens-servico/{troca_oleo}/apontamentos", {
        "tipo": "APROVACAO", "descricao": "Cliente aprovou o orçamento pelo WhatsApp."})
    post(f"/ordens-servico/{troca_oleo}/apontamentos", {
        "tipo": "EXECUCAO", "descricao": "Óleo e filtros trocados; testando vazamentos."})
if freios:
    post(f"/ordens-servico/{freios}/apontamentos", {
        "tipo": "PECA", "descricao": "Disco de freio encomendado ao fornecedor; chega amanhã cedo."})
if embreagem:
    post(f"/ordens-servico/{embreagem}/enviar-orcamento")

print(f"Pronto: {len([m for m in ids_mecanicos if m])} mecânicos, {len(catalogo)} serviços, "
      f"{len(estoque)} peças, {len([c for c in ids_clientes if c])} clientes, "
      f"{len([v for v in ids_veiculos if v])} veículos e {len([o for o in ids_ordens if o])} ordens de serviço.")
print("Entre com gerente@oficina.com.br / oficina123.")
