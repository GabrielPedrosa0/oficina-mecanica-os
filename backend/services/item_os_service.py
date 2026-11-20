# Regras dos itens da OS (serviços e peças): validar os campos e pertencer a uma OS que existe.
import math

from fastapi import HTTPException

from repositories import item_os_repository
from schemas.item_os_schema import ItemOS
from services import ordem_servico_service


# Confere os campos e devolve os dados prontos para gravar.
def validar(entrada: ItemOS):
    descricao = entrada.descricao.strip()
    if descricao == "":
        raise HTTPException(status_code=422, detail="A descrição do item é obrigatória.")
    # Regra da atividade: o valor do serviço precisa ser maior que zero.
    if not math.isfinite(entrada.valor) or round(entrada.valor, 2) <= 0:
        raise HTTPException(status_code=422, detail="O valor do item deve ser maior que zero.")
    return {"descricao": descricao, "tipo": entrada.tipo, "valor": round(entrada.valor, 2)}


# Devolve o item, ou responde 404 se não existe ou se pertence a outra OS.
# Também responde 404 se a própria OS não existe.
def buscar_item(os_id: int, item_id: int):
    ordem_servico_service.buscar_ordem(os_id)
    item = item_os_repository.buscar(item_id)
    if item is None or item["os_id"] != os_id:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    return item


# A soma dos valores dos itens de uma OS (o total do orçamento).
def total_da_os(os_id: int):
    return round(sum(i["valor"] for i in item_os_repository.listar_da_os(os_id)), 2)


def listar_itens(os_id: int):
    ordem_servico_service.buscar_ordem(os_id)
    return item_os_repository.listar_da_os(os_id)


def cadastrar_item(os_id: int, entrada: ItemOS):
    ordem_servico_service.buscar_ordem(os_id)
    return item_os_repository.criar({"os_id": os_id, **validar(entrada)})


def atualizar_item(os_id: int, item_id: int, entrada: ItemOS):
    buscar_item(os_id, item_id)
    return item_os_repository.atualizar(item_id, {"os_id": os_id, **validar(entrada)})


def excluir_item(os_id: int, item_id: int):
    buscar_item(os_id, item_id)
    item_os_repository.excluir(item_id)
