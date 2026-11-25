# Suas issues — Integrante 2

Parte: **Ordens de serviço: lista, nova OS e busca** · 3 para fazer.
Lista completa do grupo em [../issues.md](../issues.md). Marcos: Front 1. Telas obrigatórias até 21/11; Front 2. Telas complementares até 24/11; Front 3. Revisão e apresentação até 26/11.

| Issue | Marco |
|---|---|
| [Front] Tela Ordens de serviço: filtros, busca, tabela e exportar | Front 1 |
| [Front] Tela Nova OS: placa, mecânico, previsão e garantia | Front 1 |
| [Front] Busca do topo: placa, cliente ou nº da OS | Front 2 |

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

