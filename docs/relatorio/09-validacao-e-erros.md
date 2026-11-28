# 9. Validação de entrada e tratamento de erros

Cenário escolhido: **Oficina mecânica** (entidades **Veículo** e **Ordem de Serviço**).

As regras do cenário são conferidas em **três camadas**. Cada camada tem uma função diferente e nenhuma depende só das outras:

1. **Interface (React):** confere o formulário antes de enviar e mostra a mensagem ao lado do campo. Serve para avisar rápido; não é a garantia final.
2. **Serviço Web (FastAPI):** confere tudo de novo, porque a API pode ser chamada sem a interface. Responde com o código HTTP certo e um texto claro em `detail`.
3. **Banco de dados (PostgreSQL):** `UNIQUE` e `CHECK` impedem dado inválido mesmo se as duas camadas acima falharem.

Base dos links: repositório `GabrielPedrosa0/oficina-mecanica-os`, versão `13a7f4d` (links fixos, não mudam se o código for alterado depois).

## 9.1 Regras do cenário implementadas

| Regra do cenário | Interface | Serviço Web | Banco | Mensagem mostrada |
|---|---|---|---|---|
| Campos obrigatórios (veículo: placa, marca, modelo; OS: veículo e problema relatado) | [`validadores.js`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/frontend/src/utils/validadores.js#L15-L19) | [`veiculo_service.py` L16-L27](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/veiculo_service.py#L16-L27) e [`ordem_servico_service.py` L12-L28](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/ordem_servico_service.py#L12-L28) | `NOT NULL` | "Marca e modelo são obrigatórios." · "O problema relatado é obrigatório." |
| Placa em formato válido (antigo ABC1234 ou Mercosul ABC1D23) | [`validarPlaca`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/frontend/src/utils/validadores.js#L21-L26) | [`veiculo_service.py` L16-L19](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/veiculo_service.py#L16-L19) (aceita minúsculas e hífen, grava em maiúsculas sem hífen) | [`ck_veiculo_placa`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/banco/modelo_logico_oficina.sql#L61) | "Placa inválida. Use ABC1234 ou ABC1D23." |
| Data de conclusão não anterior à data de abertura | — (a tela de OS não pede essa data; ela é gravada pelo sistema ao entregar) | [`ordem_servico_service.py` L45](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/ordem_servico_service.py#L45); previsão no [L47](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/ordem_servico_service.py#L47) | [`ck_os_conclusao` e `ck_os_previsao`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/banco/modelo_logico_oficina.sql#L102-L103) | "A data de conclusão não pode ser anterior à data de abertura." |
| Valor do item (serviço ou peça) nunca negativo | [`ModaisOS.jsx` L74-L78](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/frontend/src/pages/OrdensServico/ModaisOS.jsx#L74-L78) | [`item_os_schema.py` L15](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/schemas/item_os_schema.py#L15) e teste [`test_itens_os.py` L72-L81](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/tests/test_itens_os.py#L72-L81) | [`ck_os_itens_valor`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/banco/modelo_logico_oficina.sql#L138) | "Informe um valor válido, ex.: 120,50." (valor vazio, texto ou negativo). O valor **zero é aceito de propósito**; ver nota abaixo da tabela. |
| Quantidade do item maior que zero | [`ModaisOS.jsx` L77](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/frontend/src/pages/OrdensServico/ModaisOS.jsx#L77) | [`item_os_schema.py` L14](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/schemas/item_os_schema.py#L14) | — | "A quantidade precisa ser um número inteiro maior que zero." |
| Placa não repete | — | [`veiculo_service.py` L80-L88](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/veiculo_service.py#L80-L88) | [`uq_veiculo_placa`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/banco/modelo_logico_oficina.sql#L58) | "Já existe um veículo com essa placa." (HTTP 409) |
| Veículo com ordens de serviço não pode ser excluído (relação entre as entidades) | — | [`veiculo_service.py` L103-L107](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/veiculo_service.py#L103-L107) | chave estrangeira | "O veículo tem ordens de serviço e não pode ser excluído." (HTTP 409) |
| OS entregue ou cancelada fica só para leitura | botões somem e a tela mostra o aviso | [`ordem_servico_service.py` L72-L76](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/ordem_servico_service.py#L72-L76), [`apontamento_service.py` L34-L36](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/apontamento_service.py#L34-L36) | — | "A OS já foi entregue: ela é só para leitura." (HTTP 409) |
| Mudança de status só nas transições permitidas | [`statusOS.js`](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/frontend/src/constants/statusOS.js) esconde botões que não fazem sentido | [`acao_os_service.py` L28](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/services/acao_os_service.py#L28) | `CHECK` do status | "Não é possível mudar a OS de X para Y." (HTTP 409) |

**Nota sobre o valor do item.** O enunciado do cenário pede valor do serviço maior que zero. A equipe decidiu aceitar o valor `0` apenas para itens de cortesia e para serviços em garantia (retorno de um serviço já feito, que não é cobrado; a tela de Nova OS tem a opção "Serviço em garantia"). Por isso o sistema recusa valor negativo, vazio ou não numérico, e o `0` é permitido. É um desvio consciente da regra do enunciado, por causa do fluxo de garantia da oficina.

## 9.2 Tratamento de erros

**No serviço Web.** Toda regra de negócio violada levanta um `HTTPException` com um código que diz o tipo do problema e uma frase em português em `detail`:

- **422** dado inválido (placa, campo vazio, valor, data);
- **409** conflito com o estado atual (placa repetida, exclusão bloqueada, OS fechada, transição não permitida);
- **404** registro que não existe (veículo, OS, item);
- **401** sessão inválida ou expirada.

Erros de tipo e formato (campo ausente ou com tipo errado) são recusados pelo próprio FastAPI/Pydantic, também com 422, e o `detail` vem como lista.

**Na interface.** Um único ponto, [`mensagemDoErro` em `api.js` L31-L46](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/frontend/src/services/api.js#L31-L46), transforma qualquer resposta de erro em um texto para a pessoa: usa o `detail` quando é texto, traduz a lista do Pydantic em "Confira o campo X" e tem mensagens próprias para 401, 404 e erro de servidor. Servidor desligado ou sem internet vira "Sem conexão com o servidor". As telas nunca mostram erro técnico.

A mensagem aparece no lugar certo:
- **erro de um campo** fica logo abaixo do campo, em vermelho (componente `Campo`);
- **erro da ação** (salvar, mudar status, excluir) aparece num aviso vermelho (componente `Aviso`), dentro do modal quando a ação foi feita nele;
- **erro ao carregar** uma tela mostra o estado de erro com o botão "Tentar de novo".

## 9.3 Testes automatizados que comprovam as regras

A suíte de testes do backend (`pytest`) cobre as regras acima, com casos válidos e inválidos:
- placa válida e inválida: [`test_veiculos.py` L38-L52](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/tests/test_veiculos.py#L38-L52);
- placa repetida: [`test_veiculos.py` L130](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/tests/test_veiculos.py#L130);
- exclusão de veículo com OS: [`test_veiculos.py` L161](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/tests/test_veiculos.py#L161);
- data de conclusão nunca antes da abertura: [`test_acoes_os.py` L100](https://github.com/GabrielPedrosa0/oficina-mecanica-os/blob/13a7f4db5c1428aa2442b1642176905160d11d66/backend/tests/test_acoes_os.py#L100).

## 9.4 Capturas de tela a inserir (tirar no app publicado)

Cada captura deve mostrar a mensagem de erro visível na tela.

1. **Placa inválida:** Veículos → Novo veículo → digitar `ABC12` → Salvar. Mensagem: "Placa inválida. Use ABC1234 ou ABC1D23."
2. **Campos obrigatórios:** Novo veículo → deixar marca e modelo vazios → Salvar.
3. **Placa repetida:** cadastrar de novo uma placa que já existe (erro 409).
4. **Excluir veículo com OS:** abrir um veículo que tem ordem de serviço e tentar excluir.
5. **Item da OS inválido:** Detalhe da OS → "+ Adicionar serviço" → quantidade `0` e valor vazio → Salvar. Mensagens: "A quantidade precisa ser um número inteiro maior que zero." e "Informe um valor válido, ex.: 120,50."
6. **OS entregue só para leitura:** abrir uma OS entregue e mostrar que não há botões de adicionar/editar.
7. **Requisição e resposta de erro (opcional, vale ponto de documentação):** em `/api/docs`, executar `POST /api/veiculos` com placa `ABC12` e capturar a resposta 422.

## Situação das capturas

As sete capturas estão prontas na pasta `docs/relatorio/prints`, numeradas como na lista acima (1 a 7).
