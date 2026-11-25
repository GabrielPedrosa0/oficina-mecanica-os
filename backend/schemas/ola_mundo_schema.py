from pydantic import BaseModel


# Uma mensagem (tabela ola_mundo), por exemplo {"mensagem": "Olá, mundo!"}
class OlaMundo(BaseModel):
    mensagem: str
