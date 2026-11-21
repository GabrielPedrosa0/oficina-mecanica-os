from pydantic import BaseModel, Field


# Um item usado na OS (tabela os_itens). É o corpo de POST e PUT
# /api/ordens-servico/{os_id}/itens, por exemplo
# {"item_id": 2, "descricao": "Troca de pastilhas de freio", "quantidade": 1, "valor_unitario": 150.00}
# item_id é o item do catálogo (/api/itens): 1 = Peça e 2 = Serviço já vêm cadastrados.
# valor_unitario é o preço cobrado nesta OS (pode ser diferente do preço do catálogo).
# A mesma peça pode aparecer mais de uma vez na mesma OS.
# A OS vem do endereço, não do corpo. O valor precisa ser maior que zero (o service confere).
class ItemOrdemServico(BaseModel):
    item_id: int
    descricao: str = Field(min_length=1, max_length=120)
    quantidade: int = Field(default=1, gt=0)
    valor_unitario: float = Field(ge=0)
