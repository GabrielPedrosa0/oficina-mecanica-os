# Oficina Mecânica — Ordens de Serviço

Sistema web para controle de veículos e ordens de serviço (N695, Cenário 2).
Frontend em React + Vite, backend em Python + FastAPI.

Todos os arquivos estão **vazios**: cada integrante escreve o conteúdo da sua parte.
As rotas, os responsáveis e as regras estão em [`docs/guia_endpoints_backend.pdf`](docs/guia_endpoints_backend.pdf).

## Estrutura e responsáveis

```
oficina-mecanica-os/
├── backend/
│   ├── main.py                          Integrante 6 — cria o app e registra os routers
│   ├── requirements.txt                 Integrante 6 — dependências
│   ├── core/
│   │   ├── config.py                    Integrante 6 — configurações (banco, CORS)
│   │   ├── enums.py                     Integrante 3 — estados da OS e tipos de item
│   │   └── excecoes.py                  Integrante 6 — erros 404 / 409 / 422
│   ├── database/
│   │   ├── connection.py                Integrante 6
│   │   └── models.py                    Integrante 6
│   ├── schemas/
│   │   ├── veiculo_schema.py            Integrante 1
│   │   ├── ordem_servico_schema.py      Integrante 2
│   │   ├── item_os_schema.py            Integrante 3
│   │   ├── dashboard_schema.py          Integrante 4
│   │   ├── cliente_schema.py            Integrante 5
│   │   └── auth_schema.py               Integrante 5
│   ├── routers/
│   │   ├── veiculos.py                  Integrante 1
│   │   ├── ordens_servico.py            Integrante 2
│   │   ├── itens_os.py                  Integrante 3
│   │   ├── acoes_os.py                  Integrante 3 — status, enviar orçamento, marcar pronta
│   │   ├── dashboard.py                 Integrante 4
│   │   ├── busca.py                     Integrante 4
│   │   ├── agenda.py                    Integrante 4
│   │   ├── clientes.py                  Integrante 5
│   │   ├── autenticacao.py              Integrante 5
│   │   └── exportacao.py                Integrante 6
│   ├── services/
│   │   ├── veiculo_service.py           Integrante 1
│   │   ├── ordem_servico_service.py     Integrante 2
│   │   ├── item_os_service.py           Integrante 3
│   │   ├── dashboard_service.py         Integrante 4
│   │   ├── cliente_service.py           Integrante 5
│   │   ├── auth_service.py              Integrante 5
│   │   └── exportacao_service.py        Integrante 6
│   ├── repositories/
│   │   ├── veiculo_repository.py        Integrante 1
│   │   ├── ordem_servico_repository.py  Integrante 2 (consultas do painel: Integrante 4)
│   │   ├── item_os_repository.py        Integrante 3
│   │   └── cliente_repository.py        Integrante 5
│   └── tests/
│       ├── test_veiculos.py             Integrante 1
│       ├── test_ordens_servico.py       Integrante 2
│       ├── test_itens_os.py             Integrante 3
│       ├── test_dashboard.py            Integrante 4
│       └── test_clientes.py             Integrante 5
├── frontend/                            projeto Vite (main.jsx, App.jsx etc. continuam como estão)
│   └── src/
│       ├── routes/AppRoutes.jsx         Integrante 6 — endereços das telas
│       ├── pages/
│       │   ├── Veiculos/                Integrante 1 — lista e formulário
│       │   ├── OrdensServico/           Integrante 2 — lista, nova OS e detalhe (itens e status: Integrante 3)
│       │   ├── Painel/                  Integrante 4
│       │   ├── Agenda/                  Integrante 4
│       │   ├── Clientes/                Integrante 5 — lista e detalhe
│       │   ├── Login/                   Integrante 5
│       │   └── NaoEncontrada/           Integrante 6
│       ├── components/
│       │   ├── layout/                  Integrante 6 — menu lateral (PC), abas (celular), barra de busca
│       │   ├── ui/                      Integrante 6 — botão, campo, selo de status, placa, indicador
│       │   └── os/CartaoOS.jsx          Integrante 2
│       ├── services/                    um arquivo por grupo de rotas; api.js é do Integrante 6
│       ├── hooks/useApi.js              Integrante 6
│       ├── constants/statusOS.js        Integrante 3 — mesma lista de core/enums.py
│       ├── utils/                       Integrante 6 — formatadores e validadores
│       └── styles/                      Integrante 6 — cores e fontes do Figma
└── docs/
    └── guia_endpoints_backend.pdf
```

No frontend, a sugestão é que quem faz as rotas de um grupo faça também as telas e o service (`services/*.js`) desse grupo.
A tela Veículos não existe no Figma, mas entra porque o CRUD de veículo pela interface é obrigatório.
