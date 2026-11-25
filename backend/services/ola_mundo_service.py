# Regra das mensagens: texto obrigatório, com no máximo 120 caracteres (como no banco).
from fastapi import HTTPException

from repositories import ola_mundo_repository
from schemas.ola_mundo_schema import OlaMundo


def listar_mensagens():
    return ola_mundo_repository.listar()


def gravar_mensagem(entrada: OlaMundo):
    mensagem = entrada.mensagem.strip()
    if mensagem == "" or len(mensagem) > 120:
        raise HTTPException(status_code=422, detail="A mensagem deve ter de 1 a 120 caracteres.")
    return ola_mundo_repository.criar({"mensagem": mensagem})
