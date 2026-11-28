# 11. Declaração de uso de IA generativa

**A equipe utilizou IA generativa** como apoio ao desenvolvimento e à redação, de forma transparente e não como "caixa-preta". Cada integrante que usou a ferramenta declara abaixo o que fez e responde pelo que entregou: leu, executou, testou e consegue explicar o código e os textos.

> Cada integrante preenche a sua linha. **Quem não usou IA deve escrever expressamente "não utilizou".** A linha do Alisson está preenchida; as demais estão para completar antes de consolidar o PDF.

## Declaração por integrante

| Integrante | Ferramenta e modelo | Em que partes usou | Como usou |
|---|---|---|---|
| Alisson | Claude Code (Anthropic), modelo Claude Sonnet 5.5 | Frontend da tela **Detalhe da OS** (issues #49, #50, #51 e #52); textos das seções **9, 11, 12 e 13** do relatório; capturas de tela das mensagens de erro | Veja o detalhamento abaixo |
| *(completar)* | *(completar)* | *(completar)* | *(completar)* |
| *(completar)* | *(completar)* | *(completar)* | *(completar)* |
| *(completar)* | *(completar)* | *(completar)* | *(completar)* |
| *(completar)* | *(completar)* | *(completar)* | *(completar)* |
| *(completar)* | *(completar)* | *(completar)* | *(completar)* |

## Detalhamento: Alisson

**Código (frontend, tela Detalhe da OS).** A ferramenta leu o repositório e as issues e escreveu a tela de Detalhe da OS em React: cartões de dados, serviços e peças da OS (adicionar do catálogo, editar e remover), ações de status e orçamento, apontamentos e o CSS de impressão. Foram arquivos como `DetalheOrdemPage.jsx`, `BlocoItensOS.jsx`, `BlocoApontamentos.jsx` e `useAcoesOS.jsx`. Também encontrou e corrigiu uma divergência entre frontend e backend (`CANCELADO` e `CANCELADA`).

**Verificação feita por nós.** O código foi executado: lint e build passaram, e a tela foi testada no navegador contra o backend rodando. Como o integrante nunca havia usado React, o código gerado foi lido e estudado para entender componentes, estado e a chamada ao serviço Web. O trabalho foi integrado por *pull request* no repositório da equipe.

**Textos do relatório.** A ferramenta redigiu rascunhos das seções 9 (validação e tratamento de erros), 11, 12 (contribuição individual) e 13 (referências), a partir do código do repositório e do que o integrante contou. Os links apontam para linhas reais do código. O integrante revisou o conteúdo.

**Capturas de tela.** A ferramenta operou o navegador para provocar as mensagens de erro no aplicativo publicado e capturar as telas da seção 9. Foram usados apenas testes que o sistema recusa, sem criar nem alterar dados.

**O que a IA não fez.** Não participou do backend, do banco de dados, nem das decisões de regra de negócio do grupo. A decisão de aceitar valor zero em itens de cortesia e garantia, por exemplo, é da equipe.

## Responsabilidade

Independentemente da ferramenta, a equipe é responsável por compreender, saber explicar e responder por todo o código e todos os textos entregues.
