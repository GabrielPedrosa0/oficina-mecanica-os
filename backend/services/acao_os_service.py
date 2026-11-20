# Ações sobre a OS (3.5): mudar o status, enviar o orçamento e marcar como pronta.
from fastapi import HTTPException

from repositories import acao_os_repository, item_os_repository, ordem_servico_repository
from services import dashboard_service, item_os_service, ordem_servico_service

# Para quais status cada status pode ir. ENTREGUE é o fim: dele não se sai.
# PRONTA pode voltar para EM_SERVICO (o cliente achou um defeito, por exemplo).
TRANSICOES = {
    "ORCAMENTO": ("EM_SERVICO",),
    "EM_SERVICO": ("AGUARDANDO_PECA", "PRONTA"),
    "AGUARDANDO_PECA": ("EM_SERVICO",),
    "PRONTA": ("ENTREGUE", "EM_SERVICO"),
    "ENTREGUE": (),
}


# Muda o status da OS se a transição for permitida (senão, 409).
# Ao entregar, grava a data de conclusão se ela estiver vazia: o faturamento do painel
# só conta as OS entregues que têm data_conclusao. Ela nunca fica antes da abertura.
def mudar_status(id: int, novo: str):
    ordem = ordem_servico_service.buscar_ordem(id)
    atual = ordem["status"]
    if novo not in TRANSICOES.get(atual, ()):
        raise HTTPException(status_code=409, detail=f"Não é possível mudar a OS de {atual} para {novo}.")

    dados = {campo: valor for campo, valor in ordem.items() if campo != "id"}
    dados["status"] = novo
    if novo == "ENTREGUE" and dados["data_conclusao"] is None:
        dados["data_conclusao"] = max(dashboard_service.agora(), dados["data_abertura"])
    return ordem_servico_service.ordem_completa(ordem_servico_repository.atualizar(id, dados))


# POST /api/ordens-servico/{id}/marcar-pronta: o mesmo que mudar o status para PRONTA.
def marcar_pronta(id: int):
    return mudar_status(id, "PRONTA")


# Registra o envio do orçamento. A OS precisa ter ao menos um item (é deles que vem o total)
# e não pode já estar concluída. Devolve a OS com a data do envio e o total do orçamento.
def enviar_orcamento(id: int):
    ordem = ordem_servico_service.buscar_ordem(id)
    if ordem["status"] in ("PRONTA", "ENTREGUE"):
        raise HTTPException(status_code=409, detail="A OS já está concluída: não há orçamento para enviar.")
    if not item_os_repository.listar_da_os(id):
        raise HTTPException(status_code=409, detail="Adicione ao menos um item à OS antes de enviar o orçamento.")

    momento = dashboard_service.agora()
    acao_os_repository.registrar_envio_orcamento(id, momento)
    return {
        **ordem_servico_service.ordem_completa(ordem),
        "orcamento_enviado_em": momento,
        "valor_orcamento": item_os_service.total_da_os(id),
    }
