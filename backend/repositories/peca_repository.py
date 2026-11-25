# Peças do estoque: as linhas da tabela item com tipo 'PECA'.
# Na API: estoque é a coluna qtd_estoque e preco_venda é a coluna preco.
# A peça genérica do sistema (id 1, "Peça") não aparece aqui: ela serve para lançar na OS
# uma peça que não está no catálogo.
from database.connection import consultar_um
from database.tabela import Tabela
from repositories import item_repository

GENERICA = 1

tabela = Tabela("item", "id_item", {
    "tipo": "tipo", "codigo": "codigo", "descricao": "descricao", "estoque": "qtd_estoque",
    "estoque_minimo": "estoque_minimo", "preco_venda": "preco",
}, leitura={"estoque": "COALESCE(qtd_estoque, 0)"})

FILTRO = "tipo = 'PECA' AND id_item <> %s"


def reiniciar():
    item_repository.reiniciar()


def listar():
    return tabela.listar(FILTRO, (GENERICA,))


def buscar(id: int):
    return tabela.buscar_por(f"{FILTRO} AND id_item = %s", (GENERICA, id))


def buscar_por_codigo(codigo: str):
    return tabela.buscar_por("codigo = %s", (codigo,))


def criar(dados: dict):
    return tabela.criar({**dados, "tipo": "PECA"})


def atualizar(id: int, dados: dict):
    return tabela.atualizar(id, dados)


def excluir(id: int):
    tabela.excluir(id)


# Soma a quantidade ao estoque numa única instrução (duas entradas ao mesmo tempo não se perdem).
def somar_estoque(id: int, quantidade: int):
    consultar_um("UPDATE item SET qtd_estoque = COALESCE(qtd_estoque, 0) + %s WHERE id_item = %s "
                 "RETURNING id_item", (quantidade, id))
    return buscar(id)
