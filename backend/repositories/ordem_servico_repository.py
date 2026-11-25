# Ordens de serviço no banco (tabela os). Na API, id_veiculo se chama "veiculo_id",
# id_mecanico se chama "mecanico_id" e km_entrada se chama "quilometragem".
#
# Na leitura, a OS também traz três campos calculados (não gravados):
#   mecanico    -> nome do mecânico
#   servico     -> descrição do primeiro serviço lançado na OS
#   valor_total -> soma dos itens, da visão vw_os_total
from database.connection import consultar, consultar_um, executar
from database.tabela import Tabela

tabela = Tabela("os", "id_os", {
    "veiculo_id": "id_veiculo", "mecanico_id": "id_mecanico", "quilometragem": "km_entrada",
    "problema_relatado": "problema_relatado", "eh_garantia": "eh_garantia",
    "data_abertura": "data_abertura", "data_previsao": "data_previsao",
    "data_conclusao": "data_conclusao", "status": "status", "observacoes": "observacoes",
})

SELECT = f"""
SELECT {tabela.colunas_select("o")},
       m.nome AS mecanico,
       (SELECT oi.descricao FROM os_itens oi JOIN item i ON i.id_item = oi.id_item
         WHERE oi.id_os = o.id_os AND i.tipo = 'SERVICO'
         ORDER BY oi.id_item_os LIMIT 1) AS servico,
       t.valor_total
  FROM os o
  LEFT JOIN mecanico m ON m.id_mecanico = o.id_mecanico
  JOIN vw_os_total t ON t.id_os = o.id_os
"""


def _listar(onde="", parametros=None):
    sql = SELECT + (f" WHERE {onde}" if onde else "") + " ORDER BY o.id_os"
    return consultar(sql, parametros)


# Só para os testes: apaga todas as OS (e, em cascata, itens e apontamentos).
def reiniciar():
    tabela.esvaziar()


def listar():
    return _listar()


def buscar(id: int):
    if id is None:
        return None
    return consultar_um(SELECT + " WHERE o.id_os = %s", (id,))


def criar(dados: dict):
    return buscar(tabela.criar(dados)["id"])


def atualizar(id: int, dados: dict):
    tabela.atualizar(id, dados)
    return buscar(id)


def excluir(id: int):
    tabela.excluir(id)


# True se o veículo tem alguma ordem. Usado no DELETE /api/veiculos/{id}
# para responder 409 ("não é possível excluir: o veículo possui ordens de serviço").
def existe_do_veiculo(veiculo_id: int):
    return consultar_um("SELECT 1 FROM os WHERE id_veiculo = %s LIMIT 1", (veiculo_id,)) is not None


def listar_por_veiculos(veiculo_ids):
    return _listar("o.id_veiculo = ANY(%s)", (list(veiculo_ids),))


# --- Painel (dashboard) ---
# OS cujo status é um dos informados. Ex.: listar_por_status("EM_SERVICO", "PRONTA").
def listar_por_status(*status):
    return _listar("o.status = ANY(%s)", (list(status),))


# Tira o mecânico das ordens dele: elas voltam para "A definir" (mecanico_id = None).
# O banco já faz isso sozinho (ON DELETE SET NULL); fica explícito para o service.
def desvincular_mecanico(mecanico_id: int):
    executar("UPDATE os SET id_mecanico = NULL WHERE id_mecanico = %s", (mecanico_id,))
