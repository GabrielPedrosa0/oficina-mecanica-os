from datetime import time

from pydantic import BaseModel


# Um mecânico (tabela mecanico), por exemplo
# {"nome": "Rafael", "cpf": "12345678901", "telefone": "(85) 90000-0009",
#  "hora_inicio_expediente": "08:00", "hora_fim_expediente": "17:00"}
class Mecanico(BaseModel):
    nome: str
    cpf: str | None = None
    telefone: str | None = None
    hora_inicio_expediente: time | None = None
    hora_fim_expediente: time | None = None
