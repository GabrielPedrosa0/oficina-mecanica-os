from fastapi import APIRouter

from services import busca_service

router = APIRouter(prefix="/api/busca", tags=["Pesquisa"])


# GET /api/busca?q=QRS4F21  (placa, nome do cliente ou número da OS, ex.: "1042" ou "OS 1042")
# Os outros filtros da 3.7 são parâmetros das rotas existentes:
# /api/ordens-servico?status|placa|cliente, /api/veiculos?placa, /api/clientes?nome.
@router.get("")
def pesquisar(q: str):
    return busca_service.pesquisar(q)
