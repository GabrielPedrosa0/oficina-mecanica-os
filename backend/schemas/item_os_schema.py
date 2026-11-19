from pydantic import BaseModel, Field


# Uma peça usada na OS (tabela os_pecas), por exemplo
# {"peca_id": 3, "quantidade": 2, "valor_unitario": 45.90}
class PecaDaOS(BaseModel):
    peca_id: int
    quantidade: int = Field(default=1, gt=0)
    valor_unitario: float = Field(ge=0)


# Um serviço incluído na OS (tabela os_servicos), por exemplo
# {"servico_id": 1, "quantidade": 1, "valor_cobrado": 120.00}
class ServicoDaOS(BaseModel):
    servico_id: int
    quantidade: int = Field(default=1, gt=0)
    valor_cobrado: float = Field(ge=0)
