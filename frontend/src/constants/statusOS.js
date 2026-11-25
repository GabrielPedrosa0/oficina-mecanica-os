// Status da ordem de serviço. Integrante 3.
// Os códigos (chaves) são os mesmos do backend: schemas/ordem_servico_schema.py e o CHECK ck_os_status do banco.
//
// `tom` liga o status à cor do selo (ver SeloStatus.jsx e --status-* no tokens.css).
// Status sempre aparece com texto, nunca só com cor.

export const STATUS_OS = {
  ORCAMENTO: { valor: 'ORCAMENTO', rotulo: 'Orçamento', rotuloFiltro: 'Orçamento', tom: 'neutro' },
  EM_SERVICO: { valor: 'EM_SERVICO', rotulo: 'Em serviço', rotuloFiltro: 'Em serviço', tom: 'info' },
  AGUARDANDO_PECA: {
    valor: 'AGUARDANDO_PECA',
    rotulo: 'Aguardando peça',
    rotuloFiltro: 'Aguardando peça',
    tom: 'atencao',
  },
  PRONTA: { valor: 'PRONTA', rotulo: 'Pronto', rotuloFiltro: 'Prontas', tom: 'sucesso' },
  ENTREGUE: { valor: 'ENTREGUE', rotulo: 'Entregue', rotuloFiltro: 'Entregues', tom: 'entregue' },
  CANCELADA: { valor: 'CANCELADA', rotulo: 'Cancelada', rotuloFiltro: 'Canceladas', tom: 'perigo' },
}

// Na ordem do ciclo da OS.
export const LISTA_STATUS = Object.values(STATUS_OS)

// Filtros da tela Ordens de serviço (seção 3.3): um ativo por vez. '' = Todas.
export const FILTROS_OS = [
  { valor: '', rotulo: 'Todas' },
  ...['ORCAMENTO', 'EM_SERVICO', 'AGUARDANDO_PECA', 'PRONTA', 'ENTREGUE'].map((s) => ({
    valor: s,
    rotulo: STATUS_OS[s].rotuloFiltro,
  })),
]

// Garantia não é um status: é uma marca da OS (retorno de serviço já feito, sem cobrança).
// No PC ela aparece como mais um filtro (Figma "PC — Ordens de serviço").
export const FILTRO_GARANTIA = { valor: 'GARANTIA', rotulo: 'Garantia' }
export const FILTROS_OS_PC = [...FILTROS_OS, FILTRO_GARANTIA]

// No celular cabem menos pílulas (Figma "Celular — Ordens de serviço").
export const FILTROS_OS_CELULAR = FILTROS_OS.filter((f) =>
  ['', 'EM_SERVICO', 'AGUARDANDO_PECA', 'PRONTA'].includes(f.valor),
)

// Botão principal do Detalhe da OS, conforme o status atual (seção 3.4).
// Entregue e Cancelada não têm botão.
export const ACAO_PRINCIPAL = {
  ORCAMENTO: { rotulo: 'Aprovar orçamento', proximo: 'EM_SERVICO' },
  EM_SERVICO: { rotulo: 'Marcar pronta', proximo: 'PRONTA' },
  AGUARDANDO_PECA: { rotulo: 'Retomar serviço', proximo: 'EM_SERVICO' },
  PRONTA: { rotulo: 'Entregar veículo', proximo: 'ENTREGUE' },
}

// Para onde cada status pode ir: as mesmas de TRANSICOES em backend/services/acao_os_service.py.
// O backend é quem decide de verdade; isto serve só para esconder botões que não fazem sentido.
// Só se cancela no ORCAMENTO (o cliente recusou o orçamento); PRONTA pode voltar para EM_SERVICO.
export const TRANSICOES = {
  ORCAMENTO: ['EM_SERVICO', 'CANCELADA'],
  EM_SERVICO: ['AGUARDANDO_PECA', 'PRONTA'],
  AGUARDANDO_PECA: ['EM_SERVICO'],
  PRONTA: ['ENTREGUE', 'EM_SERVICO'],
  ENTREGUE: [],
  CANCELADA: [],
}

export function dadosStatus(status) {
  return STATUS_OS[status] ?? { valor: status, rotulo: status ?? '—', rotuloFiltro: status, tom: 'neutro' }
}

export function rotuloStatus(status) {
  return dadosStatus(status).rotulo
}

// OS entregue ou cancelada fica só para leitura.
export function statusEncerrado(status) {
  return status === 'ENTREGUE' || status === 'CANCELADA'
}

export function podeMudar(de, para) {
  return (TRANSICOES[de] ?? []).includes(para)
}
