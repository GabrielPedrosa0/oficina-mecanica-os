# A entrada da aplicação. A Vercel procura um objeto chamado "app" num arquivo app.py.
from fastapi import FastAPI

from routers import (
    acoes_os, autenticacao, busca, clientes, dashboard, exportacao, itens_os, ordens_servico, veiculos,
)

# A documentação fica em /api/docs, assim toda a aplicação mora em /api.
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.include_router(ordens_servico.router)
app.include_router(itens_os.router)
app.include_router(acoes_os.router)
app.include_router(exportacao.router)
app.include_router(clientes.router)
app.include_router(busca.router)
app.include_router(autenticacao.router)
app.include_router(veiculos.router)
app.include_router(dashboard.router)
