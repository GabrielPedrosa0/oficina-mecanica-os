# A entrada da aplicação. A Vercel procura um objeto chamado "app" num arquivo app.py.
from fastapi import FastAPI

from routers import autenticacao, busca, clientes, dashboard, exportacao, ordens_servico

# A documentação fica em /api/docs, assim toda a aplicação mora em /api.
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.include_router(ordens_servico.router)
app.include_router(exportacao.router)
app.include_router(clientes.router)
app.include_router(busca.router)
app.include_router(autenticacao.router)
app.include_router(dashboard.router)
