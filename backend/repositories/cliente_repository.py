# Clientes no banco (tabela cliente).
from database.tabela import Tabela

tabela = Tabela("cliente", "id_cliente", {
    "nome": "nome", "cpf_cnpj": "cpf_cnpj", "telefone": "telefone", "email": "email",
    "cliente_desde": "cliente_desde", "cep": "cep", "logradouro": "logradouro", "numero": "numero",
    "complemento": "complemento", "bairro": "bairro", "cidade": "cidade", "uf": "uf",
})


# Só para os testes: apaga todos os clientes (e, em cascata, veículos e OS).
def reiniciar():
    tabela.esvaziar()


def listar():
    return tabela.listar()


def buscar(id: int):
    return tabela.buscar(id)


def buscar_por_email(email: str):
    return tabela.buscar_por("email = %s", (email,))


def buscar_por_cpf_cnpj(cpf_cnpj: str):
    return tabela.buscar_por("cpf_cnpj = %s", (cpf_cnpj,))


def criar(dados: dict):
    return tabela.criar(dados)


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)
