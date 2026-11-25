from datetime import datetime, timedelta, timezone
from typing import get_args

from repositories import ordem_servico_repository
from schemas.ordem_servico_schema import Status
from services import ordem_servico_service

# As datas das OS são gravadas sem fuso, no horário da oficina. "Hoje" e "este mês" são
# contados nesse horário, mesmo com o servidor em outro fuso (ex.: hospedado em UTC).
# Fortaleza não tem horário de verão: UTC-3 fixo basta e não depende do pacote tzdata
FUSO_DA_OFICINA = timezone(timedelta(hours=-3))

LIMITE_ENTREGAS = 20         # "Listas carregam 20 itens por vez"
LIMITE_RECENTES = 10         # "Tabela com as 10 OS abertas mais recentes"
TAMANHO_RESUMO_SERVICO = 60

# OS aberta = nem entregue nem cancelada. Vem da lista de status do schema, então um status
# novo entra aqui sozinho.
STATUS_ABERTOS = tuple(s for s in get_args(Status) if s not in ("ENTREGUE", "CANCELADA"))


# Agora, no horário da oficina e sem fuso (igual às datas gravadas nas OS).
# Os testes trocam esta função para fixar o dia.
def agora():
    return datetime.now(FUSO_DA_OFICINA).replace(tzinfo=None, microsecond=0)


# Início do dia e início do dia seguinte (o fim não entra na comparação).
def limites_do_dia(momento):
    inicio = momento.replace(hour=0, minute=0, second=0, microsecond=0)
    return inicio, inicio + timedelta(days=1)


# Início do mês e início do mês seguinte (o fim não entra na comparação).
def limites_do_mes(momento):
    inicio = momento.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if inicio.month == 12:
        return inicio, inicio.replace(year=inicio.year + 1, month=1)
    return inicio, inicio.replace(month=inicio.month + 1)


def esta_entre(data, inicio, fim):
    return data is not None and inicio <= data < fim


# Texto curto para a coluna Serviço: corta em 60 caracteres e termina com "…".
def resumir(texto):
    texto = (texto or "").strip()
    if len(texto) <= TAMANHO_RESUMO_SERVICO:
        return texto
    return texto[:TAMANHO_RESUMO_SERVICO - 1].rstrip() + "…"


# A OS completa (placa, veículo, cliente) mais o resumo do serviço.
# Quando os itens da OS (3.3) existirem, o resumo pode passar a ser o primeiro item.
def ordem_do_painel(ordem):
    completa = ordem_servico_service.ordem_completa(ordem)
    return {**completa, "servico_resumo": resumir(completa["servico"] or completa["problema_relatado"])}


# Só o Gerente vê o faturamento. Enquanto nenhuma rota exige login, fica liberado.
# Para exigir, trocar para:
#
#     def pode_ver_faturamento(usuario=Depends(auth_service.usuario_atual)):
#         return usuario["perfil"] == "Gerente"
def pode_ver_faturamento():
    return True


def obter_resumo(ver_faturamento: bool):
    momento = agora()
    inicio_dia, fim_dia = limites_do_dia(momento)
    inicio_mes, fim_mes = limites_do_mes(momento)

    em_servico = ordem_servico_repository.listar_por_status("EM_SERVICO")
    aguardando = ordem_servico_repository.listar_por_status("AGUARDANDO_PECA")
    prontas = ordem_servico_repository.listar_por_status("PRONTA")

    faturamento = None
    if ver_faturamento:
        # Entra no mês pela data de conclusão. OS entregue sem data_conclusao não é contada.
        entregues_no_mes = [o for o in ordem_servico_repository.listar_por_status("ENTREGUE")
                            if esta_entre(o["data_conclusao"], inicio_mes, fim_mes)]
        faturamento = round(sum(o.get("valor_total", 0) for o in entregues_no_mes), 2)

    return {
        "em_servico": len(em_servico),
        "em_servico_previsao_hoje": sum(1 for o in em_servico if esta_entre(o["data_previsao"], inicio_dia, fim_dia)),
        "aguardando_peca": len(aguardando),
        "aguardando_peca_atrasadas": sum(1 for o in aguardando
                                         if o["data_previsao"] is not None and o["data_previsao"] < momento),
        "prontas": len(prontas),
        "faturamento_mes": faturamento,
        "mes_referencia": momento.strftime("%Y-%m"),
        "gerado_em": momento,
    }


# OS abertas com previsão para hoje, da mais cedo para a mais tarde, em páginas.
def listar_entregas_hoje(limite: int = LIMITE_ENTREGAS, offset: int = 0):
    momento = agora()
    inicio_dia, fim_dia = limites_do_dia(momento)

    previstas = [o for o in ordem_servico_repository.listar_por_status(*STATUS_ABERTOS)
                 if esta_entre(o["data_previsao"], inicio_dia, fim_dia)]
    previstas.sort(key=lambda o: (o["data_previsao"], o["id"]))
    pagina = previstas[offset:offset + limite]

    return {
        "data": momento.date(),
        "total": len(previstas),
        "limite": limite,
        "offset": offset,
        "tem_mais": offset + len(pagina) < len(previstas),
        "mensagem_vazia": "Nenhuma entrega prevista para hoje." if not previstas else None,
        "itens": [ordem_do_painel(o) for o in pagina],
    }


# As OS abertas mais recentes, da entrada mais nova para a mais antiga.
def listar_ordens_recentes(limite: int = LIMITE_RECENTES):
    abertas = ordem_servico_repository.listar_por_status(*STATUS_ABERTOS)
    abertas.sort(key=lambda o: (o["data_abertura"], o["id"]), reverse=True)
    itens = [ordem_do_painel(o) for o in abertas[:limite]]
    return {"total": len(itens), "itens": itens}

# GET /api/agenda: as OS (menos as canceladas) com previsão de entrega num dia, da mais cedo
# para a mais tarde. Sem dia, vale hoje (no horário da oficina).
def listar_agenda(dia=None):
    inicio = datetime.combine(dia, datetime.min.time()) if dia else limites_do_dia(agora())[0]
    fim = inicio + timedelta(days=1)
    previstas = [o for o in ordem_servico_repository.listar()
                 if o["status"] != "CANCELADA" and esta_entre(o["data_previsao"], inicio, fim)]
    previstas.sort(key=lambda o: (o["data_previsao"], o["id"]))
    return {"data": inicio.date(), "total": len(previstas), "itens": [ordem_do_painel(o) for o in previstas]}
