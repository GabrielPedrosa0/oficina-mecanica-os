# Catálogo de serviços (mão de obra) e peças do estoque, para as telas Serviços e Peças.
# Os dois ficam na tabela item do banco (tipo 'SERVICO' ou 'PECA'), a mesma de /api/itens:
# o id de uma peça ou de um serviço daqui é o item_id usado nos itens da OS.
import math

from fastapi import HTTPException

from core.texto import limpar, normalizar
from repositories import item_os_repository, peca_repository, servico_repository
from schemas.catalogo_schema import EntradaEstoque, Peca, ServicoCatalogo


def _valor(valor, mensagem):
    if not math.isfinite(valor) or valor < 0:
        raise HTTPException(status_code=422, detail=mensagem)
    return round(valor, 2)


def _descricao(texto, mensagem="A descrição é obrigatória."):
    descricao = texto.strip()
    if descricao == "":
        raise HTTPException(status_code=422, detail=mensagem)
    if len(descricao) > 120:
        raise HTTPException(status_code=422, detail="A descrição pode ter no máximo 120 caracteres.")
    return descricao


# Não exclui item já lançado em alguma OS (o banco recusaria: ON DELETE RESTRICT).
def _exigir_sem_uso(id: int, mensagem: str):
    if item_os_repository.existe_do_item(id):
        raise HTTPException(status_code=409, detail=mensagem)


# ------------------------------------------------------------------ Serviços

def validar_servico(entrada: ServicoCatalogo, id: int | None = None):
    descricao = _descricao(entrada.descricao)
    repetido = servico_repository.buscar_por_descricao(descricao)
    if repetido is not None and repetido["id"] != id:
        raise HTTPException(status_code=409, detail="Já existe um serviço com essa descrição.")
    tempo = entrada.tempo_estimado_min
    if tempo is not None and tempo < 0:
        raise HTTPException(status_code=422, detail="O tempo estimado não pode ser negativo.")
    # No banco o tempo é maior que zero ou vazio: 0 vira "sem tempo estimado".
    return {"descricao": descricao, "tempo_estimado_min": tempo or None,
            "preco_base": _valor(entrada.preco_base, "O preço base não pode ser negativo.")}


def buscar_servico(id: int):
    servico = servico_repository.buscar(id)
    if servico is None:
        raise HTTPException(status_code=404, detail="Serviço não encontrado.")
    return servico


def listar_servicos(busca: str | None = None):
    lista = servico_repository.listar()
    if busca:
        lista = [s for s in lista if normalizar(busca) in normalizar(s["descricao"])]
    return sorted(lista, key=lambda s: normalizar(s["descricao"]))


def cadastrar_servico(entrada: ServicoCatalogo):
    return servico_repository.criar(validar_servico(entrada))


def atualizar_servico(id: int, entrada: ServicoCatalogo):
    buscar_servico(id)
    return servico_repository.atualizar(id, validar_servico(entrada, id))


def excluir_servico(id: int):
    buscar_servico(id)
    _exigir_sem_uso(id, "Não é possível excluir: o serviço já foi lançado em ordens de serviço.")
    servico_repository.excluir(id)


# ------------------------------------------------------------------ Peças

def buscar_peca(id: int):
    peca = peca_repository.buscar(id)
    if peca is None:
        raise HTTPException(status_code=404, detail="Peça não encontrada.")
    return peca


def validar_peca(entrada: Peca, id: int | None = None):
    codigo = entrada.codigo.strip().upper()
    if codigo == "":
        raise HTTPException(status_code=422, detail="Código e descrição são obrigatórios.")
    if len(codigo) > 20:
        raise HTTPException(status_code=422, detail="O código pode ter no máximo 20 caracteres.")
    descricao = _descricao(entrada.descricao, "Código e descrição são obrigatórios.")
    # O código não se repete em todo o catálogo (UNIQUE no banco), nem entre peça e serviço.
    repetida = peca_repository.buscar_por_codigo(codigo)
    if repetida is not None and repetida["id"] != id:
        raise HTTPException(status_code=409, detail="Já existe uma peça com esse código.")
    repetida = next((p for p in peca_repository.listar()
                     if p["descricao"].lower() == descricao.lower() and p["id"] != id), None)
    if repetida is not None:
        raise HTTPException(status_code=409, detail="Já existe uma peça com essa descrição.")
    if entrada.estoque < 0 or entrada.estoque_minimo < 0:
        raise HTTPException(status_code=422, detail="O estoque não pode ser negativo.")
    return {"codigo": codigo, "descricao": descricao, "estoque": entrada.estoque,
            "estoque_minimo": entrada.estoque_minimo,
            "preco_venda": _valor(entrada.preco_venda, "O preço de venda não pode ser negativo.")}


def estoque_baixo(peca):
    return peca["estoque"] <= peca["estoque_minimo"]


def peca_completa(peca, observacao=None):
    completa = {**peca, "estoque_baixo": estoque_baixo(peca)}
    if observacao is not None:
        completa["ultima_entrada_observacao"] = observacao
    return completa


def listar_pecas(busca: str | None = None, so_estoque_baixo: bool = False):
    lista = peca_repository.listar()
    if busca:
        termo = normalizar(busca)
        lista = [p for p in lista if termo in normalizar(p["descricao"]) or termo in normalizar(p["codigo"])]
    if so_estoque_baixo:
        lista = [p for p in lista if estoque_baixo(p)]
    return [peca_completa(p) for p in sorted(lista, key=lambda p: normalizar(p["descricao"]))]


def consultar_peca(id: int):
    return peca_completa(buscar_peca(id))


def cadastrar_peca(entrada: Peca):
    return peca_completa(peca_repository.criar(validar_peca(entrada)))


# O PUT não muda o estoque: ele só muda pela entrada de estoque.
def atualizar_peca(id: int, entrada: Peca):
    buscar_peca(id)
    dados = validar_peca(entrada, id)
    del dados["estoque"]
    return peca_completa(peca_repository.atualizar(id, dados))


def excluir_peca(id: int):
    buscar_peca(id)
    _exigir_sem_uso(id, "Não é possível excluir: a peça já foi lançada em ordens de serviço.")
    peca_repository.excluir(id)


# A observação (ex.: número da nota) volta na resposta, mas ainda não é gravada no banco.
def registrar_entrada(id: int, entrada: EntradaEstoque):
    buscar_peca(id)
    if entrada.quantidade <= 0:
        raise HTTPException(status_code=422, detail="A quantidade precisa ser maior que zero.")
    return peca_completa(peca_repository.somar_estoque(id, entrada.quantidade), limpar(entrada.observacao))
