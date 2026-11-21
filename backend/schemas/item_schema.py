from typing import Literal

from pydantic import BaseModel, Field

# Tipo do item: uma peça ou um serviço (mão de obra).
Tipo = Literal["PECA", "SERVICO"]


# Um item do catálogo (tabela item): uma peça ou um serviço. Por exemplo
# {"tipo": "PECA", "descricao": "Óleo 5W30 4L", "codigo": "OLE-5W30-4L", "preco": 45.90, "qtd_estoque": 10}
# {"tipo": "SERVICO", "descricao": "Troca de óleo", "preco": 120.00, "tempo_estimado_min": 30}
# codigo e qtd_estoque são só de peça; tempo_estimado_min é só de serviço.
class Item(BaseModel):
    tipo: Tipo
    descricao: str
    codigo: str | None = None
    preco: float = Field(default=0, ge=0)
    qtd_estoque: int | None = Field(default=None, ge=0)
    tempo_estimado_min: int | None = Field(default=None, gt=0)
