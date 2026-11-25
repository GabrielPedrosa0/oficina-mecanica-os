# Suas issues — Integrante 1

Parte: **Veículos e Mecânicos** · 4 para fazer.
Lista completa do grupo em [../issues.md](../issues.md). Marcos: Front 1. Telas obrigatórias até 21/11; Front 2. Telas complementares até 24/11; Front 3. Revisão e apresentação até 26/11.

| Issue | Marco |
|---|---|
| [Front] Tela Veículos: tabela, busca e OS aberta | Front 1 |
| [Front] Novo veículo e editar veículo (com chassi) | Front 1 |
| [Front] Tela Mecânicos: equipe, expediente e OS em serviço | Front 2 |
| [Front] Novo mecânico e editar mecânico | Front 2 |

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

