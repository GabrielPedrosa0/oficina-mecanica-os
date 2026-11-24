# Regras dos itens da OS (serviços e peças): validar os campos, apontar para um item
# do catálogo e pertencer a uma OS que existe.
import math

from fastapi import HTTPException

from repositories import item_os_repository, item_repository
from schemas.item_os_schema import ItemOrdemServico
from services import ordem_servico_service


# Confere os campos e devolve os dados prontos para gravar.
def validar(entrada: ItemOrdemServico):
    if item_repository.buscar(entrada.item_id) is None:
        raise HTTPException(status_code=422, detail="Item não encontrado no catálogo.")
    descricao = entrada.descricao.strip()
    if descricao == "":
        raise HTTPException(status_code=422, detail="A descrição do item é obrigatória.")
    # Regra da atividade: o valor do serviço precisa ser maior que zero.
    if not math.isfinite(entrada.valor_unitario) or round(entrada.valor_unitario, 2) <= 0:
        raise HTTPException(status_code=422, detail="O valor do item deve ser maior que zero.")
    return {"item_id": entrada.item_id, "descricao": descricao, "quantidade": entrada.quantidade,
            "valor_unitario": round(entrada.valor_unitario, 2)}


# Devolve o item, ou responde 404 se não existe ou se pertence a outra OS.
# Também responde 404 se a própria OS não existe.
def buscar_item(os_id: int, item_os_id: int):
    ordem_servico_service.buscar_ordem(os_id)
    item = item_os_repository.buscar(item_os_id)
    if item is None or item["os_id"] != os_id:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    return item


# A soma de quantidade × valor unitário dos itens de uma OS (o total do orçamento),
# como na visão vw_os_total do banco.
def total_da_os(os_id: int):
    return round(sum(i["quantidade"] * i["valor_unitario"] for i in item_os_repository.listar_da_os(os_id)), 2)


# O item da OS com os dados do catálogo que as telas mostram: tipo, código e tempo estimado.
# Eles vêm do catálogo na hora da leitura, não ficam gravados no item da OS.
def item_completo(item):
    catalogo = item_repository.buscar(item["item_id"]) or {}
    return {**item, "tipo": catalogo.get("tipo"), "codigo": catalogo.get("codigo"),
            "tempo_estimado_min": catalogo.get("tempo_estimado_min")}


def listar_itens(os_id: int):
    ordem_servico_service.buscar_ordem(os_id)
    return [item_completo(i) for i in item_os_repository.listar_da_os(os_id)]


# Incluir, editar e excluir item só em OS que ainda pode mudar (nem entregue nem cancelada).
def cadastrar_item(os_id: int, entrada: ItemOrdemServico):
    ordem_servico_service.exigir_aberta(ordem_servico_service.buscar_ordem(os_id))
    return item_completo(item_os_repository.criar({"os_id": os_id, **validar(entrada)}))


def atualizar_item(os_id: int, item_os_id: int, entrada: ItemOrdemServico):
    buscar_item(os_id, item_os_id)
    ordem_servico_service.exigir_aberta(ordem_servico_service.buscar_ordem(os_id))
    return item_completo(item_os_repository.atualizar(item_os_id, {"os_id": os_id, **validar(entrada)}))


def excluir_item(os_id: int, item_os_id: int):
    buscar_item(os_id, item_os_id)
    ordem_servico_service.exigir_aberta(ordem_servico_service.buscar_ordem(os_id))
    item_os_repository.excluir(item_os_id)
