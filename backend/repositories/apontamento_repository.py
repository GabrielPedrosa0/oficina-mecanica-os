# Apontamentos das OS no banco (tabela apontamento). Na API, id_os se chama "os_id".
from database.tabela import Tabela

tabela = Tabela("apontamento", "id_apontamento", {
    "os_id": "id_os", "data": "data", "tipo": "tipo", "descricao": "descricao",
})


# Só para os testes: apaga todos os apontamentos.
def reiniciar():
    tabela.esvaziar()


# Os apontamentos de uma OS, do mais novo para o mais antigo.
# Com a mesma data, o registrado por último vem primeiro (o id maior).
def listar_da_os(os_id: int):
    return tabela.listar("id_os = %s", (os_id,), ordem="data DESC, id_apontamento DESC")


def criar(dados: dict):
    return tabela.criar(dados)
