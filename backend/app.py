# A entrada da aplicação. A Vercel procura um objeto chamado "app" num arquivo app.py.
from fastapi import FastAPI

from database import erros
from routers import (
    acoes_os, agenda, apontamentos, autenticacao, busca, clientes, dashboard, exportacao, itens, itens_os,
    mecanicos, ordens_servico, pecas, servicos, usuarios, veiculos,
)

# A documentação fica em /api/docs, assim toda a aplicação mora em /api.
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")
erros.registrar(app)

app.include_router(ordens_servico.router)
app.include_router(itens_os.router)
app.include_router(acoes_os.router)
app.include_router(apontamentos.router)
app.include_router(exportacao.router)
app.include_router(clientes.router)
app.include_router(busca.router)
app.include_router(autenticacao.router)
app.include_router(veiculos.router)
app.include_router(dashboard.router)
app.include_router(mecanicos.router)
app.include_router(itens.router)
app.include_router(agenda.router)
app.include_router(servicos.router)
app.include_router(pecas.router)
app.include_router(usuarios.router)
