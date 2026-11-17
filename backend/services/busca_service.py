# Pesquisa geral (GET /api/busca). Arquivo novo: a busca não tinha um service na estrutura.
# Integrante 4: pode ser movido ou ampliado junto com o dashboard.
import re

from fastapi import HTTPException

from core.texto import normalizar, placa_confere
from repositories import cliente_repository, veiculo_repository
from services import cliente_service, ordem_servico_service


# Procura por placa, nome do cliente ou número da OS (ex.: "1042" ou "OS 1042").
def pesquisar(q: str):
    termo = q.strip()
    if termo == "":
        raise HTTPException(status_code=422, detail="Informe o termo da pesquisa.")

    # Só número é número de OS: placa sempre tem letras.
    numero = re.sub(r"^(os)?\s*#?\s*", "", normalizar(termo))
    if numero.isdigit():
        encontradas = [o for o in ordem_servico_service.listar_ordens() if o["id"] == int(numero)]
        return {"ordens": encontradas, "veiculos": [], "clientes": []}

    veiculos_achados = veiculo_repository.listar_por_placa(termo)
    ids_dos_donos = {v.get("cliente_id") for v in veiculos_achados}
    clientes_achados = [c for c in cliente_repository.listar()
                        if normalizar(termo) in normalizar(c["nome"]) or c["id"] in ids_dos_donos]
    ordens_achadas = [o for o in ordem_servico_service.listar_ordens()
                      if placa_confere(o["placa"], termo)
                      or normalizar(termo) in normalizar(o["cliente_nome"])]

    return {
        "ordens": ordens_achadas,
        "veiculos": veiculos_achados,
        "clientes": [cliente_service.cliente_completo(c) for c in clientes_achados],
    }
