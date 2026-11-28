# 12. Considerações finais e aprendizados da equipe

> Texto da contribuição de **Alisson** (frontend, Detalhe da OS). Os demais integrantes acrescentam os seus parágrafos abaixo, no mesmo formato, antes de consolidar o PDF.

## Alisson: frontend (Detalhe da Ordem de Serviço)

**O que aprendi.** Nunca tinha usado React. Minha parte foi a tela de Detalhe da OS: os dados da ordem, do veículo e do cliente; os serviços e peças, com adicionar, editar e remover; as ações de status, orçamento e impressão; e os apontamentos. Aprendi, na prática:

- **Componentes:** dividir a tela em peças pequenas e reaproveitáveis (cartão, botão, modal, campo) em vez de uma página só com tudo misturado.
- **Estado e hooks:** como a tela "lembra" o que a pessoa digitou (`useState`) e como busca dados quando abre (`useApi`, que o grupo criou sobre `useEffect`).
- **Consumo do serviço Web:** a tela nunca chama `fetch` direto; usa funções de um *service*, e um único ponto transforma os erros da API em mensagens em português.
- **Validação em camadas:** a interface avisa rápido ao lado do campo, mas quem decide de verdade é o serviço Web e, por último, o banco.
- **Responsividade:** uma mesma tela com duas disposições (duas colunas no computador, uma coluna no celular) usando CSS.

**Dificuldades.** A maior foi a curva de aprendizado: entender como os dados fluem entre componentes, o momento certo de recarregar uma lista depois de salvar, e o fato de que a tela precisa tratar três estados (carregando, erro e vazio) além do caso feliz. Outra foi a **integração com o backend**: ao ligar a tela à API, os nomes e valores não batiam. O backend usava o status `CANCELADA` enquanto o frontend esperava `CANCELADO`, e os tipos de item vinham em maiúsculas (`PECA`, `SERVICO`). Isso só apareceu quando as duas pontas foram testadas juntas. A lição foi combinar o contrato da API cedo e testar com o backend rodando, e não só olhar a tela.

**Ao revisar o trabalho**, também percebemos que uma regra do cenário (valor do serviço maior que zero) estava mais frouxa do que o enunciado pedia. Reforçou a importância de conferir cada regra do cenário contra o código, e não apenas confiar que "está feito".

**Uso de ferramenta de IA.** Usei o Claude Code como apoio no desenvolvimento do Detalhe da OS. Li o código gerado, rodei lint e build, testei a tela no navegador e consigo explicar o que cada parte faz. A declaração completa está no tópico 11.

## Aprendizados do grupo

*(Completar em equipe: divisão de tarefas por issues e marcos no GitHub, passagem de memória para banco de dados, teste de usabilidade remoto, o que faríamos diferente.)*

---

# 13. Referências

Fontes de documentação consultadas ou que fundamentam o código entregue. Acesso em 27/11/2026.

1. UNIVERSIDADE DE FORTALEZA. **N695 – Desenvolvimento de Plataformas Web: Proposta de Atividade (2026.2)**. Documento da disciplina.
2. GRUPO. **Guia do frontend** (`docs/guia_frontend.md`) e **guia de endpoints do backend** (`docs/guia_endpoints_backend.pdf`). Repositório do projeto: https://github.com/GabrielPedrosa0/oficina-mecanica-os
3. SIMÕES, R. **vercel-fastapi-demo** (`app.py`): padrão de serviço Web usado como modelo para o backend. https://github.com/rolfsimoes/vercel-fastapi-demo
4. META. **React: documentação oficial** (componentes, estado, hooks). https://react.dev
5. REMIX SOFTWARE. **React Router: documentação**. https://reactrouter.com
6. VITE. **Vite: guia**. https://vite.dev
7. RAMÍREZ, S. **FastAPI: documentação** (rotas, tratamento de erros com `HTTPException`, validação). https://fastapi.tiangolo.com
8. PYDANTIC. **Pydantic: documentação** (validação de campos com `Field`). https://docs.pydantic.dev
9. THE POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL: restrições (`CHECK`, `UNIQUE`, chaves estrangeiras)**. https://www.postgresql.org/docs/current/ddl-constraints.html
10. MDN WEB DOCS. **`<dialog>`**, **Clipboard API** e **`Intl.NumberFormat`** (usados no modal, em "Copiar" do orçamento e na formatação de moeda). https://developer.mozilla.org
11. LUCIDE. **Lucide React** (ícones da interface). https://lucide.dev
12. VERCEL. **Documentação de implantação**. https://vercel.com/docs
13. ANTHROPIC. **Claude Code** (assistente de IA usado como apoio ao desenvolvimento; ver tópico 11). https://claude.com/claude-code

> Cada integrante deve **remover** o que não consultou e **acrescentar** o que usou (por exemplo, o Supabase, quem trabalhou com o banco).
