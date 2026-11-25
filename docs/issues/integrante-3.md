# Suas issues — Integrante 3

Parte: **Detalhe da OS: serviços, peças, status e apontamentos** · 4 para fazer.
Lista completa do grupo em [../issues.md](../issues.md). Marcos: Front 1. Telas obrigatórias até 21/11; Front 2. Telas complementares até 24/11; Front 3. Revisão e apresentação até 26/11.

| Issue | Marco |
|---|---|
| [Front] Tela Detalhe da OS: ordem, veículo, cliente e relato | Front 1 |
| [Front] Serviços e peças da OS: adicionar do catálogo, editar e remover | Front 1 |
| [Front] Ações da OS: mudar status, enviar orçamento e imprimir | Front 2 |
| [Front] Apontamentos da OS: linha do tempo e registrar | Front 2 |

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

