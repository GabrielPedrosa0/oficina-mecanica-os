# Ordens de serviço gravadas no PostgreSQL (tabela os).
# Apelidos para a API: id_os vira "id", id_veiculo vira "veiculo_id", km_entrada vira
# "quilometragem". Na leitura vêm junto:
#   - "mecanico": o nome do mecânico (LEFT JOIN, porque a OS pode estar sem mecânico);
#   - "servico": a descrição do primeiro serviço incluído na OS (ou null);
#   - "valor_total": a soma de peças e serviços, calculada pela visão vw_os_total.
from database.connection import conectar

SELECT_OS = """
    SELECT o.id_os AS id, o.id_veiculo AS veiculo_id, o.id_mecanico AS mecanico_id,
           m.nome AS mecanico, o.km_entrada AS quilometragem, o.problema_relatado,
           o.eh_garantia, o.data_abertura, o.data_previsao, o.data_conclusao, o.status,
           o.observacoes, o.orcamento_enviado_em,
           (SELECT s.descricao FROM os_servicos x JOIN servico s ON s.id_servico = x.id_servico
             WHERE x.id_os = o.id_os ORDER BY s.descricao LIMIT 1) AS servico,
           t.valor_total::float AS valor_total
      FROM os o
      LEFT JOIN mecanico m ON m.id_mecanico = o.id_mecanico
      JOIN vw_os_total t ON t.id_os = o.id_os
"""


def reiniciar():
    with conectar() as conexao:
        conexao.execute("TRUNCATE os RESTART IDENTITY CASCADE")


def listar():
    with conectar() as conexao:
        return conexao.execute(SELECT_OS + " ORDER BY o.id_os").fetchall()


def buscar(id: int):
    with conectar() as conexao:
        return conexao.execute(SELECT_OS + " WHERE o.id_os = %s", (id,)).fetchone()


def criar(dados: dict):
    with conectar() as conexao:
        linha = conexao.execute(
            """INSERT INTO os (id_veiculo, id_mecanico, km_entrada, problema_relatado, eh_garantia,
                               data_abertura, data_previsao, data_conclusao, status, observacoes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING id_os""",
            (dados["veiculo_id"], dados["mecanico_id"], dados["quilometragem"], dados["problema_relatado"],
             dados["eh_garantia"], dados["data_abertura"], dados["data_previsao"], dados["data_conclusao"],
             dados["status"], dados["observacoes"]),
        ).fetchone()
    return buscar(linha["id_os"])


def atualizar(id: int, dados: dict):
    with conectar() as conexao:
        conexao.execute(
            """UPDATE os
                  SET id_veiculo = %s, id_mecanico = %s, km_entrada = %s, problema_relatado = %s,
                      eh_garantia = %s, data_abertura = %s, data_previsao = %s,
                      data_conclusao = %s, status = %s, observacoes = %s
                WHERE id_os = %s""",
            (dados["veiculo_id"], dados["mecanico_id"], dados["quilometragem"], dados["problema_relatado"],
             dados["eh_garantia"], dados["data_abertura"], dados["data_previsao"], dados["data_conclusao"],
             dados["status"], dados["observacoes"], id),
        )
    return buscar(id)


# Apaga a OS. As peças, serviços e apontamentos dela saem junto (ON DELETE CASCADE).
def excluir(id: int):
    with conectar() as conexao:
        conexao.execute("DELETE FROM os WHERE id_os = %s", (id,))


# True se o veículo tem alguma ordem. Usado no DELETE /api/veiculos/{id} (responde 409).
def existe_do_veiculo(veiculo_id: int):
    with conectar() as conexao:
        linha = conexao.execute("SELECT EXISTS (SELECT 1 FROM os WHERE id_veiculo = %s) AS existe",
                                (veiculo_id,)).fetchone()
    return linha["existe"]


def listar_por_veiculos(veiculo_ids):
    with conectar() as conexao:
        return conexao.execute(SELECT_OS + " WHERE o.id_veiculo = ANY(%s) ORDER BY o.id_os",
                               (list(veiculo_ids),)).fetchall()


# --- Painel (dashboard) ---
# OS cujo status é um dos informados. Ex.: listar_por_status("EM_SERVICO", "PRONTA").
def listar_por_status(*status):
    with conectar() as conexao:
        return conexao.execute(SELECT_OS + " WHERE o.status = ANY(%s) ORDER BY o.id_os",
                               (list(status),)).fetchall()
