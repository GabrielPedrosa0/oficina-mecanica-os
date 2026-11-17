from datetime import date

from pydantic import BaseModel


# O corpo de POST e PUT /api/clientes, por exemplo
# {"nome": "Marina Souza", "telefone": "(85) 90000-0001",
#  "email": "marina@exemplo.com", "cliente_desde": "2024-03-10"}
class Cliente(BaseModel):
    nome: str
    telefone: str
    email: str | None = None
    cliente_desde: date | None = None
