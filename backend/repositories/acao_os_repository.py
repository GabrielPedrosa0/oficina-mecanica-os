# Registro das ações sobre as OS, em memória. Some quando o servidor reinicia.
# Por enquanto só guarda quando o orçamento de cada OS foi enviado (a última vez).
orcamentos_enviados = {}


def reiniciar():
    orcamentos_enviados.clear()


def registrar_envio_orcamento(os_id: int, momento):
    orcamentos_enviados[os_id] = momento


def buscar_envio_orcamento(os_id: int):
    return orcamentos_enviados.get(os_id)
