# Mecânicos em memória (dicionário que liga o id ao mecânico). Somem quando o
# servidor reinicia. O banco de dados vem depois.
# A lista começa com 2 mecânicos de exemplo; reiniciar() volta para eles.
from datetime import time

mecanicos = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    mecanicos.clear()
    mecanicos[1] = {"id": 1, "nome": "Rafael Lima", "cpf": "12345678901", "telefone": "(85) 90000-0009",
                    "hora_inicio_expediente": time(8, 0), "hora_fim_expediente": time(17, 0)}
    mecanicos[2] = {"id": 2, "nome": "Joana Alves", "cpf": "10987654321", "telefone": "(85) 90000-0010",
                    "hora_inicio_expediente": time(9, 0), "hora_fim_expediente": time(18, 0)}
    proximo_id = 3


def listar():
    return list(mecanicos.values())


def buscar(id: int):
    return mecanicos.get(id)


def buscar_por_cpf(cpf: str):
    return next((m for m in mecanicos.values() if m["cpf"] == cpf), None)


def criar(dados: dict):
    global proximo_id
    mecanico = {"id": proximo_id, **dados}
    mecanicos[proximo_id] = mecanico
    proximo_id += 1
    return mecanico


def atualizar(id: int, dados: dict):
    mecanico = {"id": id, **dados}
    mecanicos[id] = mecanico
    return mecanico


def excluir(id: int):
    del mecanicos[id]


# Começa já com os 2 exemplos.
reiniciar()
