from pydantic import BaseModel


# O corpo de POST e PUT /api/veiculos, por exemplo
# {"placa": "QRS4F21", "marca": "Volkswagen", "modelo": "Gol 1.6",
#  "ano": 2022, "quilometragem": 82300, "cliente_id": 1}
class Veiculo(BaseModel):
    placa: str
    marca: str
    modelo: str
    ano: int
    quilometragem: int = 0
    cliente_id: int | None = None
