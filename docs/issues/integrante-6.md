# Suas issues — Integrante 6

Parte: **Acesso, Usuários e qualidade** · 5 para fazer.
Lista completa do grupo em [../issues.md](../issues.md). Marcos: Front 1. Telas obrigatórias até 21/11; Front 2. Telas complementares até 24/11; Front 3. Revisão e apresentação até 26/11.

| Issue | Marco |
|---|---|
| [Front] Estrutura do frontend, componentes do Figma, estilos e conexão com o backend (já feita) | Front 1 |
| [Front] Vitrine de componentes com o guia do frontend (já feita) | Front 1 |
| [Front] CI: lint e build do frontend em todo PR | Front 1 |
| [Front] Tela Login e esqueci minha senha | Front 2 |
| [Front] Proteger as telas: rota privada, perfil, sessão expirada e sair | Front 2 |
| [Front] Tela Usuários e perfis (só o Gerente) | Front 2 |
| [Front] Revisão final: Figma, celular, PC e acessibilidade | Front 3 |

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

