# Suas issues — Integrante 5

Parte: **Clientes** · 3 para fazer.
Lista completa do grupo em [../issues.md](../issues.md). Marcos: Front 1. Telas obrigatórias até 21/11; Front 2. Telas complementares até 24/11; Front 3. Revisão e apresentação até 26/11.

| Issue | Marco |
|---|---|
| [Front] Novo cliente e editar cliente: dados pessoais e endereço | Front 1 |
| [Front] Tela Clientes: lista com busca e detalhe ao lado (PC) | Front 2 |
| [Front] Detalhe do cliente: dados, endereço, veículos e histórico | Front 2 |

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

