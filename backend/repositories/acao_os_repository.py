# Ações sobre as OS. Por enquanto só guarda quando o orçamento de cada OS foi enviado
# (a última vez), na coluna os.orcamento_enviado_em.
from database.connection import consultar_um, executar


# Nada a apagar: a data fica na própria OS (os testes esvaziam a tabela os).
def reiniciar():
    pass


# O banco exige orcamento_enviado_em >= data_abertura (ck_os_orcamento).
def registrar_envio_orcamento(os_id: int, momento):
    executar("UPDATE os SET orcamento_enviado_em = GREATEST(%s, data_abertura) WHERE id_os = %s",
             (momento, os_id))


def buscar_envio_orcamento(os_id: int):
    linha = consultar_um("SELECT orcamento_enviado_em FROM os WHERE id_os = %s", (os_id,))
    return linha["orcamento_enviado_em"] if linha else None
