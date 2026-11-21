# Regras dos apontamentos da OS (a linha do tempo: o que aconteceu com o carro e quando).
# Um apontamento não se edita nem se exclui: é o histórico da OS.
from fastapi import HTTPException

from repositories import apontamento_repository
from schemas.apontamento_schema import Apontamento
from services import dashboard_service, ordem_servico_service

LIMITE_DESCRICAO = 500


# Confere "O que foi feito": obrigatório e com até 500 letras, sem contar os espaços das pontas.
def validar_descricao(descricao: str):
    descricao = descricao.strip()
    if descricao == "":
        raise HTTPException(status_code=422, detail="Escreva o que foi feito.")
    if len(descricao) > LIMITE_DESCRICAO:
        raise HTTPException(status_code=422,
                            detail=f"O que foi feito deve ter até {LIMITE_DESCRICAO} letras.")
    return descricao


# A lista da OS, do mais novo para o mais antigo (404 se a OS não existe).
def listar_apontamentos(os_id: int):
    ordem_servico_service.buscar_ordem(os_id)
    return apontamento_repository.listar_da_os(os_id)


# Registra o apontamento com a data e a hora de agora.
# OS entregue fica só para leitura: não recebe apontamento novo (409).
def registrar_apontamento(os_id: int, entrada: Apontamento):
    ordem = ordem_servico_service.buscar_ordem(os_id)
    if ordem["status"] == "ENTREGUE":
        raise HTTPException(status_code=409, detail="A OS já foi entregue: os apontamentos são só para leitura.")
    descricao = validar_descricao(entrada.descricao)
    return apontamento_repository.criar({"os_id": os_id, "data": dashboard_service.agora(),
                                         "tipo": entrada.tipo, "descricao": descricao})
