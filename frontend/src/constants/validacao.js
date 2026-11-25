// Textos e regras fixas do modo validação (teste de usabilidade remoto).
// Os códigos (value) são os mesmos de backend/schemas/validacao_schema.py.

// As 6 perguntas do perfil, todas de tocar numa opção.
export const PERGUNTAS_PERFIL = [
  {
    campo: 'faixa_etaria',
    pergunta: 'Qual a sua idade?',
    opcoes: [
      { value: 'ATE_29', texto: 'Até 29 anos' },
      { value: '30_A_44', texto: '30 a 44 anos' },
      { value: '45_A_59', texto: '45 a 59 anos' },
      { value: '60_OU_MAIS', texto: '60 anos ou mais' },
    ],
  },
  {
    campo: 'uso_apps',
    pergunta: 'Com que frequência você usa aplicativos no celular ou no computador?',
    opcoes: [
      { value: 'QUASE_NUNCA', texto: 'Quase nunca' },
      { value: 'AS_VEZES', texto: 'Às vezes' },
      { value: 'TODO_DIA', texto: 'Todo dia' },
    ],
  },
  {
    campo: 'sistema_gestao',
    pergunta: 'Você já usou algum sistema de gestão (de loja, oficina, escritório...)?',
    opcoes: [
      { value: 'SIM', texto: 'Sim' },
      { value: 'NAO', texto: 'Não' },
    ],
  },
  {
    campo: 'relacao_oficina',
    pergunta: 'Você trabalha em oficina mecânica?',
    opcoes: [
      { value: 'TRABALHA', texto: 'Trabalho' },
      { value: 'JA_TRABALHOU', texto: 'Já trabalhei' },
      { value: 'NUNCA', texto: 'Nunca trabalhei' },
    ],
  },
  {
    campo: 'familiaridade_carro',
    pergunta: 'Qual frase combina mais com você?',
    opcoes: [
      { value: 'NAO_DIRIGE', texto: 'Não dirijo' },
      { value: 'DIRIGE', texto: 'Dirijo, mas não entendo de mecânica' },
      { value: 'ENTENDE_MECANICA', texto: 'Entendo de mecânica' },
    ],
  },
  {
    campo: 'habito_formularios',
    pergunta: 'Você costuma preencher formulários ou cadastros (no papel ou no computador)?',
    opcoes: [
      { value: 'QUASE_NUNCA', texto: 'Quase nunca' },
      { value: 'AS_VEZES', texto: 'Às vezes' },
      { value: 'COM_FREQUENCIA', texto: 'Com frequência' },
    ],
  },
]

// Placa única de cada sessão (formato Mercosul VAL1A23), para duas pessoas não cadastrarem
// a mesma placa (o sistema recusa placa repetida). Vale para 26 mil sessões.
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export function placaDaSessao(sessao) {
  const letra = LETRAS[Math.floor(sessao / 10) % 26]
  const final = String(Math.floor(sessao / 260) % 100).padStart(2, '0')
  return `VAL${sessao % 10}${letra}${final}`
}

// Cliente única de cada sessão, pelo mesmo motivo: com várias pessoas, a lista de clientes
// teria várias "Ana Souza" iguais e a pessoa escolheria a de outra sessão. 10 nomes e 26
// sobrenomes: o nome completo só se repete depois de 130 sessões.
const NOMES = ['Ana', 'Bruna', 'Carla', 'Daniela', 'Elaine', 'Fernanda', 'Gabriela', 'Helena', 'Isabel', 'Juliana']
const SOBRENOMES = [
  'Souza',
  'Almeida',
  'Barbosa',
  'Cardoso',
  'Duarte',
  'Esteves',
  'Freitas',
  'Gomes',
  'Holanda',
  'Machado',
  'Lima',
  'Lopes',
  'Martins',
  'Nogueira',
  'Oliveira',
  'Pereira',
  'Queiroz',
  'Ramos',
  'Santana',
  'Teixeira',
  'Uchoa',
  'Vieira',
  'Xavier',
  'Andrade',
  'Batista',
  'Campos',
]
export function clienteDaSessao(sessao) {
  return `${NOMES[sessao % 10]} ${SOBRENOMES[sessao % 26]}`
}

// As 4 tarefas. `cenario` é a frase da tela antes do "Começar" (recebe o número da sessão).
// `terminou` diz qual resposta do backend conclui a tarefa (a tela não pergunta "conseguiu?").
export const TAREFAS = [
  {
    numero: 1,
    titulo: 'Cadastrar cliente',
    cenario: (sessao) =>
      `Chegou uma cliente nova na oficina: ${clienteDaSessao(sessao)}, telefone (11) 98765-4321. Cadastre essa cliente.`,
    terminou: ({ metodo, caminho, status }) => metodo === 'POST' && caminho === '/clientes' && status === 201,
  },
  {
    numero: 2,
    titulo: 'Cadastrar veículo',
    cenario: (sessao) =>
      `A ${clienteDaSessao(sessao)} trouxe o carro dela: um Fiat Uno 2015, placa ${placaDaSessao(sessao)}. Cadastre esse veículo para ela.`,
    terminou: ({ metodo, caminho, status }) => metodo === 'POST' && caminho === '/veiculos' && status === 201,
  },
  {
    numero: 3,
    titulo: 'Abrir ordem de serviço',
    cenario: (sessao) =>
      `O Uno de placa ${placaDaSessao(sessao)} está com barulho no freio. Abra uma ordem de serviço para ele.`,
    terminou: ({ metodo, caminho, status }) => metodo === 'POST' && caminho === '/ordens-servico' && status === 201,
  },
  {
    numero: 4,
    titulo: 'Lançar item na OS',
    cenario: () => 'Na ordem de serviço que você abriu, lance o serviço de troca de pastilhas de freio.',
    terminou: ({ metodo, caminho, status }) =>
      metodo === 'POST' && /^\/ordens-servico\/\d+\/itens$/.test(caminho) && status === 201,
  },
]

// As 10 afirmações do SUS (System Usability Scale), na tradução usual e na ordem original
// (as mesmas do instrumento da validação). `explicacao` aparece em letra menor, embaixo.
export const AFIRMACOES_SUS = [
  {
    texto: 'Eu acho que gostaria de usar este sistema com frequência.',
    explicacao: 'Se tivesse esse sistema na oficina, usaria sempre.',
  },
  { texto: 'Eu achei o sistema desnecessariamente complexo.', explicacao: 'Mais complicado do que precisava ser.' },
  { texto: 'Eu achei o sistema fácil de usar.' },
  {
    texto: 'Eu acho que precisaria da ajuda de uma pessoa com conhecimentos técnicos para usar o sistema.',
    explicacao: 'Alguém que entende de informática.',
  },
  {
    texto: 'Eu achei que as várias funções do sistema estavam muito bem integradas.',
    explicacao: 'As partes do sistema funcionam bem juntas.',
  },
  {
    texto: 'Eu achei que o sistema apresentava muita inconsistência.',
    explicacao: 'Coisas parecidas funcionando de jeitos diferentes.',
  },
  {
    texto: 'Eu imagino que as pessoas aprenderão a usar este sistema rapidamente.',
    explicacao: 'As pessoas que trabalham numa oficina.',
  },
  { texto: 'Eu achei o sistema atrapalhado de usar.', explicacao: 'Confuso, difícil de mexer.' },
  { texto: 'Eu me senti confiante ao usar o sistema.', explicacao: 'Segura de que estava fazendo certo.' },
  { texto: 'Eu precisei aprender várias coisas novas antes de conseguir usar o sistema.' },
]

export const ESCALA_SUS = [
  'Discordo totalmente',
  'Discordo',
  'Nem concordo nem discordo',
  'Concordo',
  'Concordo totalmente',
]

// As etapas da barra de progresso.
export const ETAPAS_PROGRESSO = ['Perfil', 'T1', 'T2', 'T3', 'T4', 'Feedback']
