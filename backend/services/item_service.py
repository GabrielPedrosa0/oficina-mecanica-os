# Regras do catálogo de itens, as mesmas da tabela item do banco:
# tipo PECA ou SERVICO, descrição obrigatória e sem repetir no mesmo tipo,
# código sem repetir, preço e estoque não negativos e tempo maior que zero.
# (Tipo, preço, estoque e tempo já são conferidos pelo esquema Item.)
from fastapi import HTTPException

from repositories import item_os_repository, item_repository
from schemas.item_schema import Item


# Confere os campos e devolve os dados prontos para gravar. Na atualização,
# o id do próprio item é ignorado na checagem de repetidos.
def validar(entrada: Item, id: int | None = None):
    descricao = entrada.descricao.strip()
    if descricao == "":
        raise HTTPException(status_code=422, detail="A descrição é obrigatória.")
    if len(descricao) > 120:
        raise HTTPException(status_code=422, detail="A descrição pode ter no máximo 120 caracteres.")
    repetido = item_repository.buscar_por_descricao(entrada.tipo, descricao)
    if repetido is not None and repetido["id"] != id:
        raise HTTPException(status_code=409, detail="Já existe um item desse tipo com essa descrição.")

    # Código é opcional; se vier, não pode repetir.
    codigo = None
    if entrada.codigo is not None and entrada.codigo.strip() != "":
        codigo = entrada.codigo.strip().upper()
        if len(codigo) > 20:
            raise HTTPException(status_code=422, detail="O código pode ter no máximo 20 caracteres.")
        repetido = item_repository.buscar_por_codigo(codigo)
        if repetido is not None and repetido["id"] != id:
            raise HTTPException(status_code=409, detail="Já existe um item com esse código.")

    return {"tipo": entrada.tipo, "descricao": descricao, "codigo": codigo,
            "preco": round(entrada.preco, 2), "qtd_estoque": entrada.qtd_estoque,
            "tempo_estimado_min": entrada.tempo_estimado_min}


# Lista o catálogo em ordem de descrição; com tipo, só as peças ou só os serviços.
def listar_itens(tipo: str | None = None):
    itens = [i for i in item_repository.listar() if tipo is None or i["tipo"] == tipo]
    return sorted(itens, key=lambda i: i["descricao"].lower())


def consultar_item(id: int):
    item = item_repository.buscar(id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item não encontrado.")
    return item


def cadastrar_item(entrada: Item):
    return item_repository.criar(validar(entrada))


def atualizar_item(id: int, entrada: Item):
    consultar_item(id)
    return item_repository.atualizar(id, validar(entrada, id))


# Não exclui item usado em alguma OS, como o banco faz (ON DELETE RESTRICT).
def excluir_item(id: int):
    consultar_item(id)
    if item_os_repository.existe_do_item(id):
        raise HTTPException(status_code=409, detail="O item está em uso numa ordem de serviço.")
    item_repository.excluir(id)
