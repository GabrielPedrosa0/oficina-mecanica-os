# Issues do frontend — divisão entre os 6 integrantes

Gerado por `scripts/criar_issues.py --markdown` a partir de `scripts/issues_dados.py`.

Toda issue começa com **Antes de começar**, apontando as seções certas do [guia do frontend](guia_frontend.md) e da vitrine de componentes ([online](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) ou `docs/vitrine-oficina.html`). O guia também está no começo da vitrine, com os exemplos funcionando.
Para criar no GitHub: `python scripts/criar_issues.py --repo dono/repositorio` (veja o topo do script).

## Resumo

| Integrante | Parte | Issues | Já feitas | Marco 1 | Marco 2 | Marco 3 |
|---|---|---|---|---|---|---|
| Integrante 1 | Veículos e Mecânicos | 4 | — | 2 | 2 | 0 |
| Integrante 2 | Ordens de serviço: lista, nova OS e busca | 3 | — | 2 | 1 | 0 |
| Integrante 3 | Detalhe da OS: serviços, peças, status e apontamentos | 4 | — | 2 | 2 | 0 |
| Integrante 4 | Painel, Serviços e Peças | 3 | — | 0 | 3 | 0 |
| Integrante 5 | Clientes | 3 | — | 1 | 2 | 0 |
| Integrante 6 | Acesso, Usuários e qualidade | 5 | 2 | 1 | 3 | 1 |
| Todos | O grupo inteiro | 1 | — | 0 | 0 | 1 |

## Marcos

- **Front 1. Telas obrigatórias** — até 21/11: Veículos, clientes (cadastro) e ordens de serviço funcionando pela interface: escopo obrigatório do N695 e MVP do F108.
- **Front 2. Telas complementares** — até 24/11: O resto do Figma do MVP: painel, mecânicos, serviços, peças, detalhe do cliente, apontamentos, login e usuários.
- **Front 3. Revisão e apresentação** — até 26/11: Revisão de PC/celular e acessibilidade comparando com o Figma, ajustes dos testes com usuários e demonstração.

## Quadro (sugestão de colunas)

Backlog → A fazer → Em andamento → Em revisão (PR aberto) → Concluído. Cada um puxa as próprias issues; o PR fecha a issue com `Closes #N`.

---

## Integrante 1 — Veículos e Mecânicos

### [Front] Tela Veículos: tabela, busca e OS aberta

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Veículos**, **Tabela**, **Linha de veículo**, **Barra de busca**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Veículos” e “Celular — Veículos”. A seção 10 do guia faz uma versão simples desta tela passo a passo:
comece por ela (`vitrine/guia/TutorialListaVeiculos.jsx`).

#### O que fazer
- [ ] `pages/Veiculos/ListaVeiculosPage.jsx` com `useApi(() => listarVeiculos(...))`
- [ ] PC: `<Tabela>` com Placa (`<Placa>`), Marca, Modelo, Ano, Chassi, Cliente, Km atual (`formatarKm`) e OS aberta (`<SeloStatus>` ou “—”); clicar abre o editar
- [ ] Celular: `<Cartao semEspaco>` com `<LinhaVeiculo mostrarStatus>` (placa, “Gol 1.6 · 2019”, “Marina Souza · 82.300 km”)
- [ ] Busca “Placa, chassi, modelo ou cliente” com `useDebounce`
- [ ] Botão “Novo veículo” no cabeçalho (PC) e no rodapé (celular)

#### Backend
`GET /api/veiculos?placa=` existe. Falta combinar: busca por chassi/modelo/cliente, e mandar `cliente_nome`, `chassi`
e `status_os_aberta` em cada veículo. Enquanto não vier, filtre na tela e mostre “—”.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Novo veículo e editar veículo (com chassi)

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Campo**, **Validadores**, **Modal**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“Celular — Novo veículo” (no PC, a mesma tela no layout com menu). A seção 11 do guia faz este formulário passo a
passo (`vitrine/guia/TutorialFormVeiculo.jsx`).

#### O que fazer
- [ ] `pages/Veiculos/FormVeiculoPage.jsx` em `/veiculos/novo` e `/veiculos/:id/editar` (`consultarVeiculo`)
- [ ] Campos na ordem do Figma: Cliente (escolher da lista de `listarClientes`), Placa (`validarPlaca`, maiúsculas), Chassi (`validarChassi`, 17 caracteres), Marca, Modelo, Ano, Km atual
- [ ] `/veiculos/novo?cliente=3` já vem com o cliente escolhido (vem do “+ Adicionar” do “[Front] Detalhe do cliente: dados, endereço, veículos e histórico”)
- [ ] Salvar veículo com `useAcao`; placa repetida (409) aparece no campo Placa
- [ ] No editar: “Excluir veículo” com `<ModalConfirmacao perigo>`; veículo com OS mostra o erro do backend num `<Aviso>`

#### Backend
Rotas de veículo existem. O campo `chassi` ainda não existe: combinar com quem faz `/api/veiculos`.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Veículos: tabela, busca e OS aberta”

### [Front] Tela Mecânicos: equipe, expediente e OS em serviço

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Mecânicos**, **Tabela**, **Item de lista**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Mecânicos” e “Celular — Mecânicos”. Exemplo pronto para copiar: `vitrine/exemplos/ExemploMecanicos.jsx`.

#### O que fazer
- [ ] `pages/Mecanicos/ListaMecanicosPage.jsx` com `useApi(() => listarMecanicos())`
- [ ] Texto de apoio: “O horário de expediente aparece na escolha do mecânico ao abrir uma OS.”
- [ ] PC: `<Tabela>` com Nome (avatar + nome), CPF, Telefone, Expediente (`formatarExpediente` → “08:00–17:00”) e OS em serviço
- [ ] Celular: `<ItemLista avatar>` com “08:00–17:00 · 2 OS em serviço” ou “sem OS no momento”
- [ ] “Novo mecânico” no cabeçalho; clicar num mecânico abre o editar

#### Backend
`/api/mecanicos` é rota proposta (veja `services/mecanicosService.js`): combinar o formato com o backend.
Enquanto não existir, a tela mostra “Essa rota ainda não existe no backend”; teste na vitrine.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Novo mecânico e editar mecânico

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Campo**, **Validadores**, **Formatadores**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“Celular — Novo mecânico”.

#### O que fazer
- [ ] `pages/Mecanicos/FormMecanicoPage.jsx` em `/mecanicos/novo` e `/mecanicos/:id/editar`
- [ ] Nome, CPF (`formatarCpfCnpj` ao digitar, `validarCpfCnpj`), Telefone (`formatarTelefone`)
- [ ] Expediente: Início e Fim lado a lado (`<Campo tipo="time">`), validados com `validarExpediente`
- [ ] Salvar mecânico (`cadastrarMecanico` / `atualizarMecanico`); no editar, excluir com `<ModalConfirmacao perigo>`

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Mecânicos: equipe, expediente e OS em serviço”

---

## Integrante 2 — Ordens de serviço: lista, nova OS e busca

### [Front] Tela Ordens de serviço: filtros, busca, tabela e exportar

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Ordens de serviço**, **Tabela de OS**, **Cartão da OS**, **Filtros**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Ordens de serviço” e “Celular — Ordens de serviço”. Exemplo pronto: `vitrine/exemplos/ExemploListaOrdens.jsx`.

#### O que fazer
- [ ] `pages/OrdensServico/ListaOrdensPage.jsx` com `useApi(() => listarOrdens({ status }))`
- [ ] PC: filtros `FILTROS_OS_PC` (Todas, Orçamento, Em serviço, Aguardando peça, Prontas, Entregues, Garantia) e `<TabelaOS>` (OS, Veículo, Cliente, Serviço, Mecânico, Status, Previsão, Valor)
- [ ] Celular: busca “Placa, cliente ou nº da OS”, filtros `FILTROS_OS_CELULAR` (Todas, Em serviço, Aguardando peça, Prontas) e `<CartaoOS>`
- [ ] Filtro na URL (`/ordens?status=PRONTA`), para o Painel abrir a lista já filtrada
- [ ] “Exportar” (`exportarOrdensCSV` com o filtro atual) e “Nova ordem” → `/ordens/nova`
- [ ] Clicar numa OS abre `/ordens/:id`

#### Backend
Listar e exportar existem. O filtro “Garantia” precisa do campo `garantia` na OS (combinar).

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Tela Nova OS: placa, mecânico, previsão e garantia

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Campo**, **Interruptor**, **Aviso**, **Validadores**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Nova OS” e “Celular — Nova OS”. Meta do teste com usuários: abrir uma OS em menos de 2 minutos.

#### O que fazer
- [ ] `pages/OrdensServico/NovaOrdemPage.jsx`
- [ ] Placa primeiro: ao sair do campo, `listarVeiculos({ placa })`; achou → Cliente aparece só para leitura e Km na entrada vem preenchido
- [ ] Não achou → “Cadastrar veículo” (`/veiculos/novo`) e voltar para cá
- [ ] Campos do Figma: Km na entrada, Previsão de entrega (`datetime-local`, enviar com `deCampoDataHora()`), Mecânico (lista de `listarMecanicos` com “Rafael Lima · 08:00–17:00”; opcional, “A definir”), Problema relatado (`tipo="textarea"`), Observações
- [ ] `<Interruptor rotulo="Serviço em garantia" ajuda="Retorno de um serviço já feito; não é cobrado">`
- [ ] Nota embaixo: “Serviços, peças e apontamentos são adicionados depois, no detalhe da OS.”
- [ ] “Criar ordem” com `useAcao(cadastrarOrdem)` → abre `/ordens/:id`; “Cancelar” com algo preenchido pergunta “Sair sem salvar?”

#### Backend
`POST /api/ordens-servico` existe. `garantia`, `observacoes` e `mecanico_id` precisam ser combinados; se a rota de
mecânicos ainda não existir, mostre só “A definir”.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Busca do topo: placa, cliente ou nº da OS

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `componente`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **6. Hooks**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Barra de busca**, **Item de lista**, **Cartão da OS**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
Campo “Buscar placa, cliente ou OS” na barra superior de todas as telas do PC.

#### O que fazer
- [ ] Ligar a `<BarraBusca>` da `BarraSuperior` ao `pesquisar(q)` (`services/buscaService.js`) com `useDebounce` (300 ms, a partir de 2 letras)
- [ ] Resultados agrupados (Ordens, Veículos, Clientes) numa lista abaixo do campo; Enter abre o primeiro, Esc fecha
- [ ] Número de OS exato (“1042”) abre direto `/ordens/1042`
- [ ] No celular, a busca fica dentro das telas (Ordens, Clientes, Veículos): nada a fazer na barra

#### Backend
`GET /api/busca?q=` existe.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

---

## Integrante 3 — Detalhe da OS: serviços, peças, status e apontamentos

### [Front] Tela Detalhe da OS: ordem, veículo, cliente e relato

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **8. Estilo**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Detalhe da OS**, **Cartão e Dado**, **Placa e Avatar**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Detalhe da OS” e “Celular — Detalhe da OS”. Exemplo pronto com o layout do Figma:
`vitrine/exemplos/ExemploDetalheOS.jsx` (copie e tire o `/exemplo` dos caminhos).

#### O que fazer
- [ ] `pages/OrdensServico/DetalheOrdemPage.jsx` com `useApi(() => consultarOrdem(id), [id])`
- [ ] Topo: “OS 1042”, `<SeloStatus>` e `<Placa tamanho="grande">`
- [ ] PC: coluna esquerda com Serviços e peças (“[Front] Serviços e peças da OS: adicionar do catálogo, editar e remover”) e Apontamentos (“[Front] Apontamentos da OS: linha do tempo e registrar”); coluna direita com os cartões abaixo
- [ ] Cartão Ordem de serviço: Abertura, Previsão, Conclusão, Orçamento enviado, Mecânico (“Rafael Lima · 08:00–17:00”), Garantia (Sim/Não)
- [ ] Cartão Veículo: Modelo · ano, Chassi (no celular, `encurtarChassi`), Km na entrada
- [ ] Cartão Cliente: Nome, Telefone (link para ligar), CPF; Problema relatado e Observações
- [ ] Celular: a ordem dos blocos do Figma (dados em cima, Serviços, Peças, Total, Observações, Apontamentos)
- [ ] OS que não existe (404) → “OS não encontrada” com link para a lista

#### Backend
`GET /api/ordens-servico/{id}` existe. Chassi, CPF, garantia, orçamento enviado e expediente do mecânico ainda não
vêm: mostre “—” até combinar.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Serviços e peças da OS: adicionar do catálogo, editar e remover

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Serviços e peças**, **Modal**, **Telas completas → Detalhe da OS**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
Blocos “Serviços” e “Peças” do Detalhe da OS, com “+ Adicionar serviço”, “+ Adicionar peça”, subtotais e Total.
O componente `<ItensOS>` já faz o desenho; aqui é ligar no backend.

#### O que fazer
- [ ] Cartão com `<ItensOS>` + `useApi(() => listarItens(os.id))`
- [ ] “+ Adicionar serviço” → `<Modal>` escolhendo do catálogo (`listarServicosCatalogo`): preenche descrição, valor (preço base) e tempo estimado; o valor pode ser ajustado
- [ ] “+ Adicionar peça” → escolhe a peça (`listarPecas`): preenche descrição, código e preço de venda; quantidade
- [ ] Editar (mesmo modal) e remover (`<ModalConfirmacao>`); depois de cada mudança, recarregar itens e OS (o total muda)
- [ ] Validar: quantidade maior que zero, valor aceita vírgula (“120,50”)
- [ ] OS entregue ou cancelada: `somenteLeitura`

#### Backend
`/api/ordens-servico/{id}/itens` ainda não existe (veja `services/itensOSService.js`). Até lá a tela mostra o erro;
teste na vitrine, seção “Serviços e peças”.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Detalhe da OS: ordem, veículo, cliente e relato”

### [Front] Ações da OS: mudar status, enviar orçamento e imprimir

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **5. Estado**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Status da OS**, **Modal**, **Formatadores**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
Botões do Detalhe da OS: no PC, “Imprimir”, “Enviar orçamento” e “Marcar pronta” no cabeçalho; no celular,
“Enviar orçamento” e “Marcar pronta” presos no rodapé.

#### O que fazer
- [ ] Botão principal pelo status (`ACAO_PRINCIPAL` em `constants/statusOS.js`): Aprovar orçamento, Marcar pronta, Retomar serviço, Entregar veículo
- [ ] “Marcar aguardando peça” e “Cancelar OS” só quando `podeMudar` deixar; cancelar pede o motivo (`<ModalConfirmacao perigo>`)
- [ ] `useAcao(mudarStatus)` com `carregando` no botão; transição recusada aparece num `<Aviso>`; sucesso recarrega a OS
- [ ] Enviar orçamento: `textoOrcamento(os, itens)` num `<Modal>` para conferir, com WhatsApp (`linkWhatsApp`) e Copiar; depois chama `enviarOrcamento(os.id)`
- [ ] Imprimir: `window.print()` com CSS `@media print` (sem menu e botões, só os dados, itens e total)

#### Backend
`PATCH /api/ordens-servico/{id}/status` e `POST .../enviar-orcamento` são propostas (veja `ordensServicoService.js`).

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Serviços e peças da OS: adicionar do catálogo, editar e remover”

### [Front] Apontamentos da OS: linha do tempo e registrar

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `componente`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Apontamentos**, **Modal**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
Bloco “Apontamentos” do Detalhe da OS: Execução, Aprovação, Orçamento, Diagnóstico, Abertura, cada um com data e hora,
do mais novo para o mais antigo, e “+ Registrar apontamento”. O componente `<Apontamentos>` já existe.

#### O que fazer
- [ ] Cartão com `<Apontamentos>` + `useApi(() => listarApontamentos(os.id))`
- [ ] “+ Registrar” abre `<Modal>`: Tipo (`TIPOS_REGISTRAVEIS`) e O que foi feito (obrigatório, até 500 letras)
- [ ] Depois de registrar, recarregar a lista; OS entregue ou cancelada: `somenteLeitura`
- [ ] Combinar com o backend: Abertura, Orçamento e mudança de status viram apontamento automático

#### Backend
`/api/ordens-servico/{id}/apontamentos` é proposta (veja `ordensServicoService.js`).

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Detalhe da OS: ordem, veículo, cliente e relato”

---

## Integrante 4 — Painel, Serviços e Peças

### [Front] Painel / Início: assumir e completar

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Painel / Início**, **Indicador**, **Item de lista**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Painel” e “Celular — Início”. `pages/Painel/PainelPage.jsx` já funciona e é o modelo do grupo: agora é sua.

#### O que fazer
- [ ] Conferir textos e números com o Figma (rodar `python scripts/dados_exemplo.py` com o backend ligado)
- [ ] Indicadores clicáveis abrem a lista filtrada (`/ordens?status=EM_SERVICO`), testado junto com a “[Front] Tela Ordens de serviço: filtros, busca, tabela e exportar”
- [ ] PC: “Ordens recentes” (Ver todas) e “Mecânicos em expediente” (Ver equipe) lado a lado em telas largas
- [ ] Celular: “Entregas de hoje” (Ver todas) e “Mecânicos em expediente”
- [ ] “Faturado no mês” some quando o backend manda `null` (já funciona; testar)
- [ ] Se a rota de mecânicos ainda não existir, o bloco mostra o erro sem quebrar o resto do Painel (já funciona; testar)

#### Backend
Rotas do dashboard existem. Mecânicos em expediente usa `/api/mecanicos?em_expediente=true` (proposta).

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Tela Serviços: catálogo de mão de obra

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Serviços e peças**, **Tabela**, **Abas**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Serviços” e “Celular — Serviços” (tela “Serviços e peças” com abas). Exemplo pronto:
`vitrine/exemplos/ExemploServicosPecas.jsx`.

#### O que fazer
- [ ] `pages/Servicos/ServicosPage.jsx` com `useApi(() => listarServicosCatalogo({ busca }))`
- [ ] Texto de apoio: “Catálogo de mão de obra. O valor cobrado em cada OS parte do preço base e pode ser ajustado.”
- [ ] PC: `<Tabela>` com Descrição, Tempo estimado (`formatarDuracao` → “1 h 30 min”) e Preço base
- [ ] Celular: título “Serviços e peças”, `<Abas>` Serviços | Peças (com `para`), busca “Nome do serviço”, linhas “Tempo estimado: 40 min” e o preço
- [ ] “Novo serviço” e editar no mesmo `<Modal>` (descrição, tempo em minutos, preço base); excluir com confirmação

#### Backend
`/api/servicos` é proposta (veja `services/servicosCatalogoService.js`). O “[Front] Serviços e peças da OS: adicionar do catálogo, editar e remover” usa este catálogo.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Tela Peças: estoque, estoque baixo e entrada de estoque

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Serviços e peças**, **Tabela**, **Etiqueta**, **Filtros**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Peças” e “Celular — Peças” (aba Peças da tela “Serviços e peças”).

#### O que fazer
- [ ] `pages/Pecas/PecasPage.jsx` com `useApi(() => listarPecas({ busca, estoqueBaixo }))`
- [ ] Texto de apoio: “A quantidade em estoque diminui quando a peça é lançada em uma OS.”
- [ ] PC: filtros Todas | Estoque baixo; `<Tabela>` com Código, Descrição, Em estoque (“24 un.” + `<Etiqueta tom="atencao">Estoque baixo</Etiqueta>` quando `estoqueBaixo(peca)`) e Preço de venda
- [ ] Celular: aba Peças, busca “Nome ou código da peça”, linha “PST-DIA-0451 · 3 em estoque · estoque baixo”
- [ ] “Nova peça” e editar em `<Modal>` (código, descrição, estoque mínimo, preço de venda)
- [ ] “Entrada de estoque”: escolher a peça e a quantidade (maior que zero) → `registrarEntradaEstoque`

#### Backend
`/api/pecas` e `/api/pecas/{id}/entradas` são propostas (veja `services/pecasService.js`).

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Serviços: catálogo de mão de obra” (a tela de celular é a mesma, com abas)

---

## Integrante 5 — Clientes

### [Front] Novo cliente e editar cliente: dados pessoais e endereço

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `tela`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Novo cliente**, **Grupo de campos**, **Validadores**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Novo cliente” e “Celular — Novo cliente”. Exemplo pronto: `vitrine/exemplos/ExemploNovoCliente.jsx`.
Vem primeiro porque o cadastro de veículo precisa de cliente.

#### O que fazer
- [ ] `pages/Clientes/FormClientePage.jsx` em `/clientes/novo` e `/clientes/:id/editar` (`consultarCliente`)
- [ ] `<GrupoCampos titulo="Dados pessoais">`: Nome, CPF ou CNPJ (`formatarCpfCnpj`, `validarCpfCnpj`), Telefone, E-mail
- [ ] `<GrupoCampos titulo="Endereço" colunas={3}>`: CEP (`formatarCep`, `validarCep`), Rua, Número, Complemento, Bairro, Cidade, UF
- [ ] “Salvar cliente” com `useAcao(cadastrarCliente)` → abre o cliente; “Cancelar” volta
- [ ] E-mail ou CPF repetido (409) aparece no campo certo

#### Backend
`POST/PUT /api/clientes` existem. CPF/CNPJ e endereço ainda não: combinar com quem faz `/api/clientes`.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Tela Clientes: lista com busca e detalhe ao lado (PC)

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Item de lista**, **Barra de busca**, **Cartão e Dado**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Clientes” (lista à esquerda, cliente aberto à direita) e “Celular — Clientes”.

#### O que fazer
- [ ] `pages/Clientes/ListaClientesPage.jsx` com `useApi(() => listarClientes({ nome }))`
- [ ] Busca “Nome, CPF, telefone ou placa” com `useDebounce`
- [ ] `<ItemLista avatar>` com nome e “2 veículos · (85) 90000-0002” (`plural`, `formatarTelefone`), em ordem alfabética
- [ ] PC: clicar mostra o cliente à direita (componente do “[Front] Detalhe do cliente: dados, endereço, veículos e histórico”) e marca o item `ativo`; celular: abre `/clientes/:id`
- [ ] “Novo cliente” no cabeçalho → “[Front] Novo cliente e editar cliente: dados pessoais e endereço”

#### Backend
`GET /api/clientes?nome=` existe. Buscar por CPF, telefone ou placa precisa ser combinado.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Novo cliente e editar cliente: dados pessoais e endereço”

### [Front] Detalhe do cliente: dados, endereço, veículos e histórico

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **7. Telas e rotas**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Cartão e Dado**, **Linha de veículo**, **Formatadores**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“Celular — Detalhe do cliente” e o painel direito de “PC — Clientes”.

#### O que fazer
- [ ] Um componente `DetalheCliente` usado nos dois: à direita da lista no PC e em `pages/Clientes/DetalheClientePage.jsx` no celular
- [ ] Dados: CPF, Cliente desde (`formatarMesAno` → “Março de 2024”), Telefone, E-mail
- [ ] Endereço: Rua e número, Complemento, Bairro, CEP, Cidade / UF
- [ ] Veículos (`listarVeiculosDoCliente`) com `<LinhaVeiculo>`; “+ Adicionar” → `/veiculos/novo?cliente=ID`
- [ ] Histórico de ordens (`consultarHistoricoDoCliente`): “OS 0987 · Alinhamento e balanceamento”, “Agosto de 2026 · Entregue”, valor; tocar abre a OS
- [ ] PC: botões Editar e Nova ordem; celular: WhatsApp (`linkWhatsApp`) e Nova ordem no rodapé
- [ ] Excluir (no editar): o 409 “o cliente possui veículos vinculados” aparece num `<Aviso>`

#### Backend
Rotas de cliente, veículos do cliente e histórico existem; CPF e endereço dependem do “[Front] Novo cliente e editar cliente: dados pessoais e endereço”.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Clientes: lista com busca e detalhe ao lado (PC)”

---

## Integrante 6 — Acesso, Usuários e qualidade

### [Front] Estrutura do frontend, componentes do Figma, estilos e conexão com o backend

**Já concluída** · **Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `componente`, `prioridade: alta`

#### O que foi feito
Base que todas as outras issues usam, seguindo o Figma do MVP (Fundações, Modelo conceitual e as 27 telas).

- [x] `styles/tokens.css` e `global.css`: cores por função, Barlow / Barlow Condensed / JetBrains Mono, espaços e raios, corte PC × celular em 900 px
- [x] `components/ui/`: Botao, Campo, GrupoCampos, Interruptor, SeloStatus, Etiqueta, Placa, Avatar, Indicador, Filtros, Abas, Tabela, Cartao, ItemLista, BarraBusca, Aviso, Estados, Modal, EmConstrucao
- [x] `components/layout/`: LayoutPrincipal, MenuLateral, BarraSuperior, BarraAbas, CabecalhoPagina, RodapeAcoes; menu do Figma (Usuários só para o Gerente; no celular, Mecânicos, Serviços, Peças e Usuários ficam em Mais)
- [x] `components/os/`: CartaoOS, TabelaOS, ItensOS (Serviços e Peças com subtotais), Apontamentos; `components/veiculos/LinhaVeiculo`
- [x] `services/api.js` + um service por grupo de rotas (inclusive as propostas: mecânicos, serviços, peças, usuários, apontamentos); hooks `useApi`, `useAcao`, `useDebounce`
- [x] `constants/` (status da OS, filtros do PC e do celular, apontamentos, perfis), `utils/formatadores.js` (CPF/CNPJ, CEP, duração, expediente, chassi), `validadores.js` (CPF/CNPJ com dígito, CEP, chassi, expediente)
- [x] Rotas de todas as telas do Figma (`routes/AppRoutes.jsx`) com `<EmConstrucao>` no lugar das que faltam
- [x] Painel funcionando com o backend (modelo de referência, com “Mecânicos em expediente”), telas Mais e 404
- [x] `scripts/dados_exemplo.py` (dados do Figma para testar e apresentar)

### [Front] Vitrine de componentes com o guia do frontend

**Já concluída** · **Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `qualidade`, `prioridade: alta`

#### O que foi feito
Sugestão do Rolf: uma página com todos os componentes, para o grupo reutilizar copiando e configurando.

- [x] **Vitrine** (repositório `oficina-guia-frontend`, publicada no link do topo e em `docs/vitrine-oficina.html`): cada componente funcionando, com “Copiar uso”, “Copiar arquivo” e tabela de propriedades; busca no menu e índice “Nesta página”
- [x] **Telas completas** em PC e celular lado a lado, com exemplos para copiar: Ordens de serviço, Detalhe da OS, Mecânicos, Serviços e peças, Novo cliente, Veículos e Login
- [x] Modo “Dados de exemplo” (sem backend) e “Backend real”, com aviso de Conectado / Backend desligado e os comandos para ligar
- [x] **Guia do frontend** para quem nunca usou React (`docs/guia_frontend.md` e no começo da vitrine, com exemplos ao vivo): como rodar, JavaScript para quem vem do Python, componentes, props, estado, hooks, rotas, estilo, backend, duas telas do zero, erros comuns, GitHub e glossário

### [Front] CI: lint e build do frontend em todo PR

**Marco:** Front 1. Telas obrigatórias · **Etiquetas:** `frontend`, `qualidade`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **13. Trabalhando em grupo no GitHub**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Como usar a vitrine**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Contexto
Seis pessoas mexendo nas mesmas pastas: um PR que quebra o build precisa aparecer antes do merge.

#### O que fazer
- [ ] `.github/workflows/frontend.yml` em `pull_request` e `push` na `main`, só quando mudar algo em `frontend/`
- [ ] Node 22, `npm ci`, `npm run lint`, `npm run build` dentro de `frontend/`
- [ ] Proteger a `main`: merge só com o CI verde e 1 aprovação
- [ ] README: fluxo de trabalho (branch por issue `issue-12-lista-veiculos`, PR com `Closes #12`, quem revisa)

#### Pronto quando
- [ ] Um PR de teste mostra o job verde, e um com erro de lint fica vermelho

### [Front] Tela Login e esqueci minha senha

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **11. Seu primeiro formulário**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Telas completas → Login**, **Campo**, **Aviso**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Login” (painel escuro à esquerda com “Ordens de serviço, clientes, mecânicos e peças em um só lugar.”) e
“Celular — Login”. Exemplo pronto: `vitrine/exemplos/ExemploLogin.jsx`.

#### O que fazer
- [ ] `pages/Login/LoginPage.jsx` fora do layout (sem menu)
- [ ] “Entrar”, “Use o e-mail e a senha cadastrados pelo gerente.”, E-mail (`validarEmail`) e Senha
- [ ] `useAcao(entrar)`: 401 → `<Aviso>` “E-mail ou senha incorretos”; sucesso → volta para a tela que pediu login (ou o Painel)
- [ ] “Esqueci minha senha” → `<Modal>` com o e-mail e `esqueciSenha`; mensagem de confirmação

#### Backend
`POST /api/auth/login`, `/api/auth/esqueci-senha` e `GET /api/auth/me` existem.

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

### [Front] Proteger as telas: rota privada, perfil, sessão expirada e sair

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `componente`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **7. Telas e rotas**, **9. Falando com o backend**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Conexão e services**, **useApi e useAcao**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### O que fazer
- [ ] `routes/RotaPrivada.jsx`: sem token → `/login` (guardando a tela que pediu)
- [ ] `api.js`: resposta 401 apaga o token e leva ao login com “Sua sessão expirou. Entre de novo.”
- [ ] Menu lateral e tela Mais mostram o usuário logado (`consultarUsuarioLogado`): nome e perfil (“Gerente · gabriel@oficina.com.br”)
- [ ] “Sair” (Mais no celular, menu do usuário no PC) chama `sair()` e volta ao login
- [ ] Rota só para um perfil (`/usuarios` só Gerente): quem não é vê “Você não tem acesso a esta tela”

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Tela Login e esqueci minha senha”

### [Front] Tela Usuários e perfis (só o Gerente)

**Marco:** Front 2. Telas complementares · **Etiquetas:** `frontend`, `tela`, `depende do backend`, `prioridade: média`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **10. Sua primeira tela**, **7. Telas e rotas**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Tabela**, **Selo de status**, **Modal**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### Figma
“PC — Usuários” (no celular, a entrada fica em Mais).

#### O que fazer
- [ ] `pages/Usuarios/UsuariosPage.jsx` com `useApi(() => listarUsuarios())`
- [ ] Texto de apoio: “Quem pode entrar no sistema. Só o perfil Gerente vê esta tela.”
- [ ] `<Tabela>` com Nome (avatar), E-mail e Perfil (`<Selo tom={PERFIS[perfil].tom}>`)
- [ ] “Novo usuário” e editar em `<Modal>`: nome, e-mail, perfil (`LISTA_PERFIS`), senha só no cadastro
- [ ] O Gerente não pode tirar o próprio perfil de Gerente

#### Backend
`/api/usuarios` é proposta (veja `services/usuariosService.js`).

#### Pronto quando
- [ ] Igual ao Figma em 390 px (celular) e 1440 px (PC): textos, ordem dos blocos e botões
- [ ] Estados de carregando, vazio e erro tratados (`<EstadoCarregando>`, `<EstadoVazio>`, `<EstadoErro>`)
- [ ] Erros do backend aparecem para o usuário (`<Aviso>` ou `erro` do `<Campo>`)
- [ ] Só componentes e cores por função (`var(--...)`); nenhum `fetch` direto na página
- [ ] `npm run lint` sem erro e `npm run formatar` rodado; PR com `Closes #` desta issue

#### Depende de
- “[Front] Proteger as telas: rota privada, perfil, sessão expirada e sair”

### [Front] Revisão final: Figma, celular, PC e acessibilidade

**Marco:** Front 3. Revisão e apresentação · **Etiquetas:** `frontend`, `qualidade`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **8. Estilo**, **13. Trabalhando em grupo no GitHub**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Cores**, **Tipografia**, **Espaços e raios**, **Moldura do app**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### O que fazer
- [ ] Passar as 27 telas do Figma lado a lado com o app (390 px e 1440 px) e abrir uma issue curta para cada diferença
- [ ] Teclado: dá para usar tudo com Tab/Enter/Esc; foco visível; modais prendem o foco
- [ ] Leitor de tela: botões só com ícone têm `aria-label`; campos com rótulo; contraste AA
- [ ] Mesmo texto para a mesma coisa em todas as telas (ex.: “Nova ordem”, “Salvar …”)
- [ ] Menu ativo nas telas filhas (`/ordens/1042` acende Ordens; `/pecas` acende Mais no celular)
- [ ] Título da aba do navegador por tela (“OS 1042 · Oficina App”)

#### Pronto quando
- [ ] Nenhuma diferença grande aberta; as pequenas viram issue com `prioridade: baixa`

---

## Todos — O grupo inteiro

### [Front] Teste com usuários e demonstração

**Marco:** Front 3. Revisão e apresentação · **Etiquetas:** `frontend`, `qualidade`, `prioridade: alta`

#### Antes de começar
- **Nunca usou React?** O guia do frontend explica tudo do zero, com exemplos ao vivo: está no começo da
  [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (menu “Guia do frontend”) e em `docs/guia_frontend.md`. Leia: **1. Comece aqui**.
- **Componentes para copiar:** na mesma [vitrine](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) (ou baixe `docs/vitrine-oficina.html` e abra no navegador).
  Veja: **Como usar a vitrine**, **Telas completas**. Cada componente tem “Copiar uso” e “Copiar arquivo”.

#### O que fazer (o grupo inteiro; cada um apresenta as próprias telas)
- [ ] Backend com `python scripts/dados_exemplo.py` (dados do Figma) e o frontend com `npm run build` + `npm run preview`
- [ ] Teste com usuários: 1) cadastrar cliente e veículo; 2) abrir uma OS de troca de pastilhas, R$ 180, em até 2 minutos; 3) achar a OS pela placa e marcar pronta
- [ ] Anotar onde travaram e corrigir o que der até a apresentação
- [ ] Roteiro da demonstração (10 min): Login → Painel → Nova OS → Detalhe (serviços, peças, apontamento, status) → Clientes → Veículos → celular
- [ ] Vitrine e guia atualizados com o que mudou (`node scripts/sincronizar.mjs` no repositório da vitrine)

#### Depende de
- “[Front] Revisão final: Figma, celular, PC e acessibilidade”

