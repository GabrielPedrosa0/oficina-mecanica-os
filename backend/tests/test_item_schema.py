# Testes das regras dos esquemas do catálogo de itens (schemas/item_schema.py)
# e do item usado na OS (ItemOrdemServico, em schemas/item_os_schema.py).
# Esses esquemas seguem o modelo lógico (tabelas item e os_itens) e ainda não
# são usados pelas rotas, então aqui testamos só as regras do schema.
# Técnicas: partição de equivalência e análise de valor limite.
import pytest
from pydantic import ValidationError

from schemas.item_os_schema import ItemOrdemServico
from schemas.item_schema import Item


# Peça válida: com código e estoque, sem tempo estimado.
def test_peca():
    peca = Item(tipo="PECA", descricao="Óleo 5W30 4L", codigo="OLE-5W30-4L", preco=45.90, qtd_estoque=10)
    assert peca.tipo == "PECA"
    assert peca.tempo_estimado_min is None


# Serviço válido: sem código e sem estoque; sem preço, vale 0.
def test_servico():
    servico = Item(tipo="SERVICO", descricao="Troca de óleo", tempo_estimado_min=30)
    assert servico.preco == 0
    assert servico.codigo is None
    assert servico.qtd_estoque is None


# Regra do tipo: só PECA ou SERVICO.
# Partições: os dois válidos, um valor fora da lista e a grafia minúscula.
@pytest.mark.parametrize("tipo, valido", [
    ("PECA", True),
    ("SERVICO", True),
    ("OUTRO", False),
    ("peca", False),
])
def test_tipo(tipo, valido):
    if valido:
        assert Item(tipo=tipo, descricao="Filtro").tipo == tipo
    else:
        with pytest.raises(ValidationError):
            Item(tipo=tipo, descricao="Filtro")


# Regra do preço do catálogo (não negativo).
# Limites: 0 e 0,01 (válidos) e -0,01 (inválido).
@pytest.mark.parametrize("preco, valido", [
    (0, True),
    (0.01, True),
    (-0.01, False),
])
def test_preco(preco, valido):
    if valido:
        assert Item(tipo="PECA", descricao="Filtro", preco=preco).preco == preco
    else:
        with pytest.raises(ValidationError):
            Item(tipo="PECA", descricao="Filtro", preco=preco)


# Regra do estoque da peça (não negativo; vazio é aceito).
# Limites: 0 (válido) e -1 (inválido); None é a partição "não informado".
@pytest.mark.parametrize("qtd_estoque, valido", [
    (None, True),
    (0, True),
    (1, True),
    (-1, False),
])
def test_estoque(qtd_estoque, valido):
    if valido:
        assert Item(tipo="PECA", descricao="Filtro", qtd_estoque=qtd_estoque).qtd_estoque == qtd_estoque
    else:
        with pytest.raises(ValidationError):
            Item(tipo="PECA", descricao="Filtro", qtd_estoque=qtd_estoque)


# Regra do tempo estimado do serviço (maior que 0; vazio é aceito).
# Limites: 1 (o menor válido) e 0 (inválido); None é a partição "não informado".
@pytest.mark.parametrize("tempo, valido", [
    (None, True),
    (1, True),
    (0, False),
    (-1, False),
])
def test_tempo(tempo, valido):
    if valido:
        assert Item(tipo="SERVICO", descricao="Alinhamento", tempo_estimado_min=tempo).tempo_estimado_min == tempo
    else:
        with pytest.raises(ValidationError):
            Item(tipo="SERVICO", descricao="Alinhamento", tempo_estimado_min=tempo)


# Item na OS válido: sem quantidade, vale 1.
def test_item_da_os():
    item = ItemOrdemServico(item_id=1, descricao="Pastilhas", valor_unitario=45.90)
    assert item.quantidade == 1
    assert item.valor_unitario == 45.90


# Regra da descrição do item na OS (de 1 a 120 caracteres, como no banco).
# Limites: 0 e 121 (inválidos), 1 e 120 (válidos).
@pytest.mark.parametrize("tamanho, valido", [
    (0, False),
    (1, True),
    (120, True),
    (121, False),
])
def test_descricao(tamanho, valido):
    descricao = "a" * tamanho
    if valido:
        assert ItemOrdemServico(item_id=2, descricao=descricao, valor_unitario=10).descricao == descricao
    else:
        with pytest.raises(ValidationError):
            ItemOrdemServico(item_id=2, descricao=descricao, valor_unitario=10)


# Regra da quantidade na OS (maior que 0).
# Limites: 1 (o menor válido), 0 e -1 (inválidos).
@pytest.mark.parametrize("quantidade, valido", [
    (1, True),
    (0, False),
    (-1, False),
])
def test_quantidade(quantidade, valido):
    if valido:
        item = ItemOrdemServico(item_id=1, descricao="Pastilhas", quantidade=quantidade, valor_unitario=10)
        assert item.quantidade == quantidade
    else:
        with pytest.raises(ValidationError):
            ItemOrdemServico(item_id=1, descricao="Pastilhas", quantidade=quantidade, valor_unitario=10)


# Regra do valor cobrado na OS (não negativo).
# Limites: 0 e 0,01 (válidos) e -0,01 (inválido).
@pytest.mark.parametrize("valor, valido", [
    (0, True),
    (0.01, True),
    (-0.01, False),
])
def test_valor_unitario(valor, valido):
    if valido:
        assert ItemOrdemServico(item_id=1, descricao="Pastilhas", valor_unitario=valor).valor_unitario == valor
    else:
        with pytest.raises(ValidationError):
            ItemOrdemServico(item_id=1, descricao="Pastilhas", valor_unitario=valor)


# Campos obrigatórios: sem eles, o schema recusa.
@pytest.mark.parametrize("schema, campos", [
    (Item, {"descricao": "Filtro"}),
    (Item, {"tipo": "PECA"}),
    (ItemOrdemServico, {"descricao": "Pastilhas", "valor_unitario": 10}),
    (ItemOrdemServico, {"item_id": 1, "valor_unitario": 10}),
    (ItemOrdemServico, {"item_id": 1, "descricao": "Pastilhas"}),
], ids=["item-sem-tipo", "item-sem-descricao", "item-os-sem-item", "item-os-sem-descricao", "item-os-sem-valor"])
def test_obrigatorios(schema, campos):
    with pytest.raises(ValidationError):
        schema(**campos)
