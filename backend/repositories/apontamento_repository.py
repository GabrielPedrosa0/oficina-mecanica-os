# Apontamentos das OS em memória (dicionário que liga o id ao apontamento). Somem
# quando o servidor reinicia. O banco de dados vem depois.
# Cada apontamento guarda o os_id da OS a que pertence.
apontamentos = {}
proximo_id = 1


def reiniciar():
    global proximo_id
    apontamentos.clear()
    proximo_id = 1


# Os apontamentos de uma OS, do mais novo para o mais antigo.
# Com a mesma data, o registrado por último vem primeiro (o id maior).
def listar_da_os(os_id: int):
    da_os = [a for a in apontamentos.values() if a["os_id"] == os_id]
    return sorted(da_os, key=lambda a: (a["data"], a["id"]), reverse=True)


def criar(dados: dict):
    global proximo_id
    apontamento = {"id": proximo_id, **dados}
    apontamentos[proximo_id] = apontamento
    proximo_id += 1
    return apontamento
