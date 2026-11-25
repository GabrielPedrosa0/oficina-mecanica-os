# Transforma erros do banco em respostas HTTP claras, em vez de "500 Internal Server Error".
# Os services já conferem quase tudo antes de gravar; isto é a rede de segurança para o que
# só o banco percebe (ex.: dois cadastros iguais chegando ao mesmo tempo).
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from psycopg import errors


def registrar(app: FastAPI):
    @app.exception_handler(errors.UniqueViolation)
    def repetido(_: Request, __: Exception):
        return JSONResponse(status_code=409, content={"detail": "Já existe um cadastro com esses dados."})

    @app.exception_handler(errors.ForeignKeyViolation)
    def em_uso(_: Request, __: Exception):
        return JSONResponse(status_code=409,
                            content={"detail": "Não é possível: o registro está ligado a outro cadastro."})

    @app.exception_handler(errors.CheckViolation)
    @app.exception_handler(errors.StringDataRightTruncation)
    @app.exception_handler(errors.NumericValueOutOfRange)
    def invalido(_: Request, __: Exception):
        return JSONResponse(status_code=422, content={"detail": "Algum campo tem um valor inválido."})

    @app.exception_handler(errors.OperationalError)
    def sem_banco(_: Request, __: Exception):
        return JSONResponse(status_code=503,
                            content={"detail": "Sem conexão com o banco de dados. Tente de novo em instantes."})
