# Suas issues — Integrante 4

Parte: **Painel, Serviços e Peças** · 3 para fazer.
Lista completa do grupo em [../issues.md](../issues.md). Marcos: Front 1. Telas obrigatórias até 21/11; Front 2. Telas complementares até 24/11; Front 3. Revisão e apresentação até 26/11.

| Issue | Marco |
|---|---|
| [Front] Painel / Início: assumir e completar | Front 2 |
| [Front] Tela Serviços: catálogo de mão de obra | Front 2 |
| [Front] Tela Peças: estoque, estoque baixo e entrada de estoque | Front 2 |

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

