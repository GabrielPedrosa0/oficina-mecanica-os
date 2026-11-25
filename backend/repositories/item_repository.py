# Catálogo de itens (peças e serviços) no banco (tabela item).
# O banco começa com uma peça (id 1) e um serviço (id 2); reiniciar() volta para eles.
from database.tabela import Tabela

tabela = Tabela("item", "id_item", {
    "tipo": "tipo", "descricao": "descricao", "codigo": "codigo", "preco": "preco",
    "qtd_estoque": "qtd_estoque", "tempo_estimado_min": "tempo_estimado_min",
})

INICIAIS = {1: {"tipo": "PECA", "descricao": "Peça"}, 2: {"tipo": "SERVICO", "descricao": "Serviço"}}


# Só para os testes: volta o catálogo para a peça e o serviço iniciais.
# O TRUNCATE em cascata também esvazia os itens das OS.
def reiniciar():
    tabela.esvaziar()
    for id, dados in INICIAIS.items():
        tabela.criar_com_id(id, dados)


def listar():
    return tabela.listar()


def buscar(id: int):
    return tabela.buscar(id)


def buscar_por_descricao(tipo: str, descricao: str):
    return tabela.buscar_por("tipo = %s AND lower(descricao) = lower(%s)", (tipo, descricao))


def buscar_por_codigo(codigo: str):
    return tabela.buscar_por("codigo = %s", (codigo,))


def criar(dados: dict):
    return tabela.criar(dados)


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)
