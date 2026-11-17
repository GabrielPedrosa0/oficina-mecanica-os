# Exportação das ordens de serviço em CSV.
import csv
import io

from services import ordem_servico_service

# Nomes para mostrar no arquivo exportado.
STATUS_ROTULO = {
    "ORCAMENTO": "Orçamento",
    "EM_SERVICO": "Em serviço",
    "AGUARDANDO_PECA": "Aguardando peça",
    "PRONTA": "Pronta",
    "ENTREGUE": "Entregue",
}


# Uma célula do CSV que começa com = + - @ vira fórmula ao abrir no Excel.
# O apóstrofo faz o Excel tratar como texto.
def celula_csv(valor):
    if isinstance(valor, str) and valor[:1] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + valor
    return valor


def formatar_data(data):
    return data.strftime("%d/%m/%Y %H:%M") if data else ""


# O texto do CSV com as ordens que passam nos filtros (os mesmos da listagem).
# Separador ";", valores com vírgula e BOM, para abrir certo no Excel em português.
def gerar_csv(status=None, placa=None, cliente=None):
    saida = io.StringIO()
    escritor = csv.writer(saida, delimiter=";", lineterminator="\r\n")
    escritor.writerow(["OS", "Placa", "Veículo", "Cliente", "Serviço", "Problema relatado", "Mecânico",
                       "Status", "Abertura", "Previsão", "Conclusão", "Valor total (R$)"])
    for o in ordem_servico_service.listar_ordens(status, placa, cliente):
        escritor.writerow([celula_csv(valor) for valor in [
            o["id"], o["placa"] or "", o["veiculo"], o["cliente_nome"] or "", o["servico"] or "",
            o["problema_relatado"], o["mecanico"] or "", STATUS_ROTULO[o["status"]],
            formatar_data(o["data_abertura"]), formatar_data(o["data_previsao"]),
            formatar_data(o["data_conclusao"]), f"{o['valor_total']:.2f}".replace(".", ","),
        ]])
    return "﻿" + saida.getvalue()
