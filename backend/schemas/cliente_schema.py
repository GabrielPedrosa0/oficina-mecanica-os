from datetime import date

from pydantic import BaseModel


# O corpo de POST e PUT /api/clientes, por exemplo
# {"nome": "Marina Souza", "cpf_cnpj": "12345678901", "telefone": "(85) 90000-0001",
#  "email": "marina@exemplo.com", "cliente_desde": "2024-03-10",
#  "cep": "60000000", "logradouro": "Rua A", "numero": "10", "complemento": null,
#  "bairro": "Centro", "cidade": "Fortaleza", "uf": "CE"}
# O endereço fica no próprio cliente (tabela cliente do banco/modelo_logico_oficina.sql).
class Cliente(BaseModel):
    nome: str
    cpf_cnpj: str | None = None
    telefone: str
    email: str | None = None
    cliente_desde: date | None = None
    cep: str | None = None
    logradouro: str | None = None
    numero: str | None = None
    complemento: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    uf: str | None = None
