# Mecânicos no banco (tabela mecanico).
from datetime import time

from database.tabela import Tabela

tabela = Tabela("mecanico", "id_mecanico", {
    "nome": "nome", "cpf": "cpf", "telefone": "telefone",
    "hora_inicio_expediente": "hora_inicio_expediente", "hora_fim_expediente": "hora_fim_expediente",
})

# Os 2 mecânicos de exemplo (os mesmos de banco/dados_exemplo.sql).
EXEMPLOS = [
    {"nome": "Rafael Lima", "cpf": "12345678901", "telefone": "(85) 90000-0009",
     "hora_inicio_expediente": time(8, 0), "hora_fim_expediente": time(17, 0)},
    {"nome": "Joana Alves", "cpf": "10987654321", "telefone": "(85) 90000-0010",
     "hora_inicio_expediente": time(9, 0), "hora_fim_expediente": time(18, 0)},
]


# Só para os testes: volta para os 2 exemplos (ids 1 e 2).
# O TRUNCATE em cascata também esvazia as OS (que apontam para o mecânico).
def reiniciar():
    tabela.esvaziar()
    for exemplo in EXEMPLOS:
        tabela.criar(exemplo)


def listar():
    return tabela.listar()


def buscar(id: int):
    return tabela.buscar(id)


def buscar_por_cpf(cpf: str):
    return tabela.buscar_por("cpf = %s", (cpf,))


def criar(dados: dict):
    return tabela.criar(dados)


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)
