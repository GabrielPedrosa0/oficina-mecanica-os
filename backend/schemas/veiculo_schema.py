from pydantic import BaseModel


# O corpo de POST e PUT /api/veiculos, por exemplo
# {"placa": "QRS4F21", "chassi": "9BWZZZ377VT004251", "marca": "Volkswagen",
#  "modelo": "Gol 1.6", "ano": 2022, "quilometragem": 82300, "cliente_id": 1}
# No banco (tabela veiculo): quilometragem é a coluna km_atual e cliente_id é id_cliente.
# Todo veículo tem dono, por isso cliente_id é obrigatório.
class Veiculo(BaseModel):
    placa: str
    chassi: str | None = None
    marca: str
    modelo: str
    ano: int | None = None
    quilometragem: int | None = None
    cliente_id: int
