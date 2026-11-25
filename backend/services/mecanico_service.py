# Regras dos mecânicos, as mesmas da tabela mecanico do banco:
# nome obrigatório, CPF com 11 dígitos e sem repetir,
# e o fim do expediente depois do início.
import re

from fastapi import HTTPException

from repositories import mecanico_repository, ordem_servico_repository
from schemas.mecanico_schema import Mecanico
from services import dashboard_service


# Confere os campos e devolve os dados prontos para gravar: CPF só com dígitos e
# telefone no formato (85) 90000-0009. Na atualização, o id do próprio mecânico
# é ignorado na checagem de CPF repetido.
def validar(entrada: Mecanico, id: int | None = None):
    nome = entrada.nome.strip()
    if nome == "":
        raise HTTPException(status_code=422, detail="O nome é obrigatório.")
    if len(nome) > 120:
        raise HTTPException(status_code=422, detail="O nome pode ter no máximo 120 caracteres.")

    # CPF é opcional; se vier, aceita "123.456.789-01" e grava "12345678901".
    cpf = None
    if entrada.cpf is not None and entrada.cpf.strip() != "":
        cpf = re.sub(r"\D", "", entrada.cpf)
        if len(cpf) != 11:
            raise HTTPException(status_code=422, detail="CPF inválido. Use 11 dígitos.")
        repetido = mecanico_repository.buscar_por_cpf(cpf)
        if repetido is not None and repetido["id"] != id:
            raise HTTPException(status_code=409, detail="Já existe um mecânico com esse CPF.")

    # Telefone é opcional; se vier, segue a mesma regra dos clientes.
    telefone = None
    if entrada.telefone is not None and entrada.telefone.strip() != "":
        digitos = re.sub(r"\D", "", entrada.telefone)
        if len(digitos) not in (10, 11):
            raise HTTPException(status_code=422, detail="Telefone inválido. Use DDD + número, ex.: (85) 90000-0009.")
        corte = 7 if len(digitos) == 11 else 6
        telefone = f"({digitos[:2]}) {digitos[2:corte]}-{digitos[corte:]}"

    inicio = entrada.hora_inicio_expediente
    fim = entrada.hora_fim_expediente
    if inicio is not None and fim is not None and fim <= inicio:
        raise HTTPException(status_code=422, detail="O fim do expediente deve ser depois do início.")

    return {"nome": nome, "cpf": cpf, "telefone": telefone,
            "hora_inicio_expediente": inicio, "hora_fim_expediente": fim}


# Agora, no horário da oficina. Os testes trocam esta função para fixar a hora.
def agora():
    return dashboard_service.agora()


# {mecanico_id: quantas OS EM_SERVICO ele tem}
def contar_em_servico():
    contagem = {}
    for ordem in ordem_servico_repository.listar_por_status("EM_SERVICO"):
        if ordem["mecanico_id"] is not None:
            contagem[ordem["mecanico_id"]] = contagem.get(ordem["mecanico_id"], 0) + 1
    return contagem


def mecanico_completo(mecanico, contagem=None):
    contagem = contar_em_servico() if contagem is None else contagem
    return {**mecanico, "os_em_servico": contagem.get(mecanico["id"], 0)}


# No expediente agora: o início já passou e o fim ainda não. Sem horário cadastrado, não está.
def em_expediente(mecanico, momento=None):
    inicio, fim = mecanico["hora_inicio_expediente"], mecanico["hora_fim_expediente"]
    if inicio is None or fim is None:
        return False
    hora = (momento or agora()).time()
    return inicio <= hora < fim


# GET /api/mecanicos  ·  ?em_expediente=true (só quem está no horário agora)
def listar_mecanicos(so_em_expediente: bool = False):
    lista = sorted(mecanico_repository.listar(), key=lambda m: m["nome"].lower())
    if so_em_expediente:
        momento = agora()
        lista = [m for m in lista if em_expediente(m, momento)]
    contagem = contar_em_servico()
    return [mecanico_completo(m, contagem) for m in lista]


def consultar_mecanico(id: int):
    mecanico = mecanico_repository.buscar(id)
    if mecanico is None:
        raise HTTPException(status_code=404, detail="Mecânico não encontrado.")
    return mecanico_completo(mecanico)


def cadastrar_mecanico(entrada: Mecanico):
    return mecanico_repository.criar(validar(entrada))


def atualizar_mecanico(id: int, entrada: Mecanico):
    consultar_mecanico(id)
    return mecanico_repository.atualizar(id, validar(entrada, id))


# Pode excluir mesmo com ordens de serviço: elas ficam com o mecânico "A definir",
# como o banco faz (ON DELETE SET NULL).
def excluir_mecanico(id: int):
    consultar_mecanico(id)
    ordem_servico_repository.desvincular_mecanico(id)
    mecanico_repository.excluir(id)
