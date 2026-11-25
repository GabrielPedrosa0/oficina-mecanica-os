# Ordens de serviço, clientes, pesquisa, autenticação e exportação

Dados no PostgreSQL do Supabase, nas tabelas de `banco/modelo_logico_oficina.sql`. Veja a seção
**Banco de dados** no fim deste arquivo.
Nomes em português, erros com `HTTPException` e mensagens acionáveis, como no código de veículos do template.

## O que está implementado

| Guia | Rotas | Arquivos |
|---|---|---|
| 3.2 Ordens de Serviço (Integrante 2) | `GET/POST /api/ordens-servico`, `GET/PUT/DELETE /api/ordens-servico/{id}` | `schemas/ordem_servico_schema.py`, `routers/ordens_servico.py`, `services/ordem_servico_service.py`, `repositories/ordem_servico_repository.py` |
| 3.6 Clientes | `GET/POST /api/clientes`, `GET/PUT/DELETE /api/clientes/{id}`, `GET /api/clientes/{id}/veiculos`, `GET /api/clientes/{id}/historico` | `cliente_schema.py`, `clientes.py`, `cliente_service.py`, `cliente_repository.py` |
| 3.7 Pesquisa e filtros | `?status=` `?placa=` `?cliente=` em ordens, `?nome=` em clientes, `GET /api/busca?q=` | `busca.py`, `services/busca_service.py` (arquivo novo) |
| 3.8 Autenticação | `POST /api/auth/login`, `POST /api/auth/esqueci-senha`, `GET /api/auth/me` | `auth_schema.py`, `autenticacao.py`, `auth_service.py` |
| 3.10 Exportação | `GET /api/ordens-servico/exportar` (CSV; aceita os mesmos filtros da listagem) | `exportacao.py`, `exportacao_service.py` |

Também há dois arquivos novos de apoio: `core/texto.py` (normalizar acento, limpar texto, comparar placa) e `tests/conftest.py`.

## Como rodar os testes

```bash
pip install fastapi httpx pytest
pytest backend          # da raiz do repositório (ou só `pytest`, dentro de backend/)
```

Os testes montam o próprio app com os meus routers e não dependem do `main.py`.
O `requirements.txt` e o `main.py` são do Integrante 6 e não foram alterados.

## O que os outros integrantes precisam fazer

**Integrante 6 (`main.py`)**: registrar os routers com `app.include_router(...)`:
`ordens_servico`, `exportacao`, `clientes`, `busca`, `autenticacao` (de `routers/`). A ordem não importa: a rota da OS usa
`/{id:int}`, então `/api/ordens-servico/exportar` nunca é lida como id. Dependências: `fastapi`, `uvicorn`, e `httpx` + `pytest` para os testes.

**Integrante 1 (veículos)**: `repositories/veiculo_repository.py` tem só o mínimo que eu precisei **ler** (o dicionário `veiculos`,
`buscar`, `listar_por_placa`, `listar_por_cliente`, `reiniciar`). Complete com criar/atualizar/excluir mantendo esses nomes. Três pontos de integração:

1. `GET /api/veiculos?placa=` → usar `veiculo_repository.listar_por_placa(placa)`.
2. `DELETE /api/veiculos/{id}` → responder 409 se `ordem_servico_repository.existe_do_veiculo(id)` for verdadeiro.
3. `POST/PUT /api/veiculos` → se vier `cliente_id`, conferir se o cliente existe (`cliente_repository.buscar`) e responder 422 se não existir.

**Integrante 3 (status e itens)**: o `Status` das OS está em `schemas/ordem_servico_schema.py` como `Literal` com os cinco valores do guia;
pode passar a usar o `core/enums.py`. O `PUT` aceita qualquer troca de status: as transições permitidas ficam com o `acoes_os.py`.
`valor_total` é informado no corpo; quando os itens existirem, passar a ser a soma deles.

**Integrante 4 (dashboard)**: `ordem_servico_service.listar_ordens(status, placa, cliente)` já devolve as OS completas e ordenadas; `ordem_servico_repository` tem `listar()`.

## Harmonização: campos do front ↔ modelo relacional

Tabelas sugeridas (para quem fizer o banco). Colunas em `snake_case`, iguais aos campos do JSON.

```
cliente        id PK, nome NOT NULL, telefone NOT NULL, email UNIQUE NULL, cliente_desde DATE NOT NULL
veiculo        id PK, placa UNIQUE NOT NULL, marca, modelo, ano, quilometragem,
               cliente_id FK -> cliente (NULL, ON DELETE RESTRICT)
ordem_servico  id PK, veiculo_id FK -> veiculo (NOT NULL, ON DELETE RESTRICT),
               quilometragem, problema_relatado NOT NULL, servico NULL, mecanico NULL,
               data_abertura NOT NULL, data_previsao NULL, data_conclusao NULL,
               status CHECK (ORCAMENTO, EM_SERVICO, AGUARDANDO_PECA, PRONTA, ENTREGUE),
               observacoes NULL, valor_total NUMERIC(10,2) CHECK (>= 0),
               CHECK (data_conclusao IS NULL OR data_conclusao >= data_abertura)
```

A OS **não tem** `cliente_id`: o cliente é o dono do veículo (`ordem_servico → veiculo → cliente`). Assim não há como a OS
apontar um cliente diferente do dono do veículo.

Tela "Nova ordem" (protótipo) → API:

| Campo na tela | Vai para | Observação |
|---|---|---|
| Placa | `veiculo_id` | O front busca `GET /api/veiculos?placa=` e envia o `id` do veículo |
| Cliente, Veículo | (não são enviados) | Só exibição, preenchidos a partir do veículo. A resposta da OS traz `placa`, `veiculo`, `cliente_id`, `cliente_nome`, `cliente_telefone` |
| Quilometragem | `quilometragem` | Se omitida, vale a do cadastro do veículo |
| Problema relatado | `problema_relatado` | Obrigatório |
| Mecânico | `mecanico` | Texto livre. "A definir" na tela = `null` |
| Previsão | `data_previsao` | ISO, sem fuso: `2026-11-11T17:00:00`. "Hoje, 17:00" é formatação do front |
| (Entrada) | `data_abertura` | Se omitida, vale o momento atual |
| Coluna "Serviço" da lista | `servico` | Campo novo e opcional. Resumo exibido na lista; ver "Decisões abertas" |
| Observações (detalhe da OS) | `observacoes` | |
| Total | `valor_total` | Hoje informado no corpo; deve passar a ser a soma dos itens (3.3) |

Status: `ORCAMENTO` (Orçamento), `EM_SERVICO` (Em serviço), `AGUARDANDO_PECA` (Aguardando peça), `PRONTA` (Pronto/Prontas), `ENTREGUE` (Entregue).

Cliente: `telefone` é gravado como `(85) 90000-0001` (aceita qualquer formatação na entrada); `quantidade_veiculos` é calculado na
leitura ("2 veículos" na tela), não é coluna.

## Regras validadas (422 salvo indicação)

- OS: veículo existente, problema relatado preenchido, quilometragem e valor total não negativos, conclusão e previsão não anteriores
  à abertura, datas sem fuso horário, status dentro da lista.
- Cliente: nome, telefone com DDD (10 ou 11 dígitos), e-mail válido e único (409 se repetido).
- Exclusão de cliente com veículos responde 409.
- Login: 401 com a mesma mensagem para e-mail desconhecido e senha errada. `esqueci-senha` responde sempre igual.
- Exportação: células de texto que começam com `=`, `+`, `-` ou `@` recebem um apóstrofo, para não virarem fórmula no Excel.

## Decisões abertas (para combinar com o grupo)

1. **`servico` na OS.** O guia não tem esse campo, mas a lista do protótipo mostra "Troca de óleo e filtros" por OS. Quando os itens
   (3.3) existirem, ele pode virar um texto derivado dos itens.
2. **Dono do histórico.** Como a OS não guarda o cliente, trocar o dono de um veículo move o histórico dele para o novo dono. Se o
   histórico deve ficar com o dono da época, a OS precisa de `cliente_id` próprio.
3. **E-mail do cliente único.** Foi escolha minha, o guia não pede.
4. **Login** ainda não protege nenhuma rota; falta o fluxo de nova senha e o envio do e-mail de recuperação.
   Com a tabela `usuario` vazia, o primeiro login cria o usuário inicial (perfil `ADMIN`) com `ADMIN_EMAIL` e
   `ADMIN_SENHA` (padrão `recepcao@oficina.com.br` / `oficina123`). **Troque antes de publicar.**
   O token é assinado (HMAC) com `CHAVE_SECRETA`, então vale em qualquer instância da Vercel sem tabela de sessões.

## Banco de dados

- **Conexão:** `backend/database/connection.py` lê `DATABASE_URL` (Supabase → *Connect* → *Transaction pooler*; na Vercel, em *Settings → Environment Variables*).
  Localmente, copie `backend/.env.example` para `backend/.env` e preencha.
- **Criar as tabelas:** `cd backend && python -m database.criar_tabelas` (com `--exemplos` também entram 2 mecânicos).
  Não apaga nada se as tabelas já existem. Também dá para colar `banco/modelo_logico_oficina.sql` no SQL Editor do Supabase.
- **Mudar o banco:** crie um `.sql` numerado em `banco/migracoes/` (veja o README de lá). No push para a `main`, o
  GitHub Actions (`.github/workflows/migrar-banco.yml`) o aplica no Supabase; à mão: `python -m database.migrar`.
  As já aplicadas ficam na tabela `migracao`. O workflow precisa do secret `DATABASE_URL` no GitHub.
- **Repositories:** cada um descreve a sua tabela (campo da API → coluna, ex.: `quilometragem` → `km_atual`) com
  `database/tabela.py`. As funções continuam as mesmas, então services e rotas não mudaram.
- **Leitura da OS:** traz `mecanico` (nome), `servico` (primeiro serviço lançado) e `valor_total` (visão `vw_os_total`).
- **Erros do banco** (repetido, valor inválido, sem conexão) viram 409/422/503 em `database/erros.py`.
- **Testes:** precisam de um PostgreSQL só para eles em `TEST_DATABASE_URL` (as tabelas dele são apagadas e recriadas).
  Sem essa variável os testes são pulados. Nunca aponte para o banco de produção.
