// Tipos de apontamento da OS (Figma: "Apontamentos" no Detalhe da OS). Integrante 3.
// Apontamento = um registro do que aconteceu com o carro, com data e hora: a linha do tempo da OS.
export const TIPOS_APONTAMENTO = {
  ABERTURA: { valor: 'ABERTURA', rotulo: 'Abertura' },
  DIAGNOSTICO: { valor: 'DIAGNOSTICO', rotulo: 'Diagnóstico' },
  ORCAMENTO: { valor: 'ORCAMENTO', rotulo: 'Orçamento' },
  APROVACAO: { valor: 'APROVACAO', rotulo: 'Aprovação' },
  EXECUCAO: { valor: 'EXECUCAO', rotulo: 'Execução' },
  PECA: { valor: 'PECA', rotulo: 'Peça' },
  ENTREGA: { valor: 'ENTREGA', rotulo: 'Entrega' },
  OBSERVACAO: { valor: 'OBSERVACAO', rotulo: 'Observação' },
}

// Os que a pessoa escolhe ao "Registrar apontamento" (Abertura, Orçamento e Entrega o sistema registra sozinho).
export const TIPOS_REGISTRAVEIS = ['DIAGNOSTICO', 'APROVACAO', 'EXECUCAO', 'PECA', 'OBSERVACAO'].map(
  (t) => TIPOS_APONTAMENTO[t],
)

export function rotuloApontamento(tipo) {
  return TIPOS_APONTAMENTO[tipo]?.rotulo ?? tipo
}
