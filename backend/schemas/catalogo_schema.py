from pydantic import BaseModel


# POST e PUT /api/servicos  {"descricao": "Troca de óleo e filtro", "tempo_estimado_min": 40, "preco_base": 120}
class ServicoCatalogo(BaseModel):
    descricao: str
    tempo_estimado_min: int | None = None
    preco_base: float = 0


# POST e PUT /api/pecas
# {"codigo": "OLE-5W30-1L", "descricao": "Óleo sintético 5W30 1 L", "estoque": 24, "estoque_minimo": 6,
#  "preco_venda": 40}
# No PUT o estoque não muda (use a entrada de estoque ou lance a peça numa OS).
class Peca(BaseModel):
    codigo: str
    descricao: str
    estoque: int = 0
    estoque_minimo: int = 0
    preco_venda: float = 0


# POST /api/pecas/{id}/entradas  {"quantidade": 10, "observacao": "Nota 1234"}
class EntradaEstoque(BaseModel):
    quantidade: int
    observacao: str | None = None
