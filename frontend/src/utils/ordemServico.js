// Funções de apoio para mostrar uma ordem de serviço.
// Usadas por CartaoOS, TabelaOS (resumoServico), ItensOS (separarItens) e pelo Detalhe da OS (textoOrcamento).
import { formatarMoeda, formatarNumeroOS, formatarPlaca } from './formatadores'

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

// Texto do orçamento para conferir, copiar ou mandar pelo WhatsApp.
// `ordem` vem de GET /api/ordens-servico/{id}; `itens` de listarItens (tipo servico / peca).
export function textoOrcamento(ordem, itens = []) {
  const { servicos, pecas, totalServicos, totalPecas } = separarItens(itens)
  const linha = (item) => `- ${item.descricao}: ${item.quantidade} x ${formatarMoeda(item.valor_unitario)} = ${formatarMoeda(valorLinha(item))}`
  const bloco = (titulo, lista) => (lista.length > 0 ? [`${titulo}:`, ...lista.map(linha), ''] : [])
  return [
    `Olá${ordem.cliente_nome ? `, ${ordem.cliente_nome}` : ''}! Segue o orçamento da ${formatarNumeroOS(ordem.id)}.`,
    `Veículo: ${ordem.veiculo || '—'} (placa ${formatarPlaca(ordem.placa) || '—'})`,
    '',
    ...bloco('Serviços', servicos),
    ...bloco('Peças', pecas),
    `Serviços: ${formatarMoeda(totalServicos)}`,
    `Peças: ${formatarMoeda(totalPecas)}`,
    `Total: ${formatarMoeda(totalServicos + totalPecas)}`,
    '',
    'Posso iniciar o serviço?',
  ].join('\n')
}
