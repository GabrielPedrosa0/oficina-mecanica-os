from typing import Literal

from pydantic import BaseModel

# Tipo do item: um serviço (mão de obra) ou uma peça.
Tipo = Literal["SERVICO", "PECA"]


# O corpo de POST e PUT /api/ordens-servico/{os_id}/itens, por exemplo
# {"descricao": "Troca de pastilhas de freio", "tipo": "SERVICO", "valor": 150.00}
# A OS vem do endereço, não do corpo. O valor precisa ser maior que zero (o service confere).
class ItemOS(BaseModel):
    descricao: str
    tipo: Tipo
    valor: float
