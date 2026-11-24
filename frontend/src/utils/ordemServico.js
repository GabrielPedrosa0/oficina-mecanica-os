// Funções de apoio para mostrar uma ordem de serviço.
// Usadas por CartaoOS, TabelaOS (resumoServico) e ItensOS (separarItens).

// Texto curto do "Serviço" na lista. A lista do backend ainda não traz os itens,
// então usamos o problema relatado; se a OS vier com itens, mostra o 1º serviço (+N).
export function resumoServico(ordem) {
  const servicos = (ordem.itens ?? []).filter((i) => i.tipo === 'servico')
  if (servicos.length > 0) {
    const resto = servicos.length - 1
    return resto > 0 ? `${servicos[0].descricao} +${resto}` : servicos[0].descricao
  }
  return ordem.servico ?? ordem.problema_relatado ?? ''
}

// Valor de uma linha: quantidade (padrão 1) x valor unitário.
const valorLinha = (item) => (item.quantidade ?? 1) * (item.valor_unitario ?? 0)

// Separa os itens em serviços e peças e calcula os totais de cada grupo.
export function separarItens(itens = []) {
  const servicos = itens.filter((i) => i.tipo === 'servico')
  const pecas = itens.filter((i) => i.tipo === 'peca')
  const soma = (lista) => lista.reduce((total, item) => total + valorLinha(item), 0)
  return { servicos, pecas, totalServicos: soma(servicos), totalPecas: soma(pecas) }
}