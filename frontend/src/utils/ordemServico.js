// Regras de exibição da OS usadas em mais de um componente. Integrantes 2 e 3.
import { formatarMoeda } from './formatadores'

// Texto da coluna "Serviço": o resumo do painel, o serviço ou o problema relatado.
export function resumoServico(ordem) {
  return ordem.servico_resumo || ordem.servico || ordem.problema_relatado || ''
}

// Total da OS = soma de quantidade x valor unitário de todos os itens (especificação 3.4).
export function totalDosItens(itens = []) {
  return itens.reduce((soma, i) => soma + Number(i.quantidade ?? 1) * Number(i.valor_unitario ?? 0), 0)
}

// Separa os itens da OS como no Figma: "Serviços" (mão de obra) e "Peças", cada um com o seu subtotal.
export function separarItens(itens = []) {
  const servicos = itens.filter((i) => i.tipo === 'servico')
  const pecas = itens.filter((i) => i.tipo !== 'servico')
  return { servicos, pecas, totalServicos: totalDosItens(servicos), totalPecas: totalDosItens(pecas) }
}

// Peça com estoque no mínimo ou abaixo (Figma "Peças": etiqueta "Estoque baixo").
export function estoqueBaixo(peca) {
  return Number(peca.estoque ?? 0) <= Number(peca.estoque_minimo ?? 3)
}

// Texto do orçamento para mandar pelo WhatsApp do próprio aparelho (Detalhe da OS → Enviar orçamento).
export function textoOrcamento(os, itens = []) {
  const linhas = itens.map((i) => {
    const qtd = Number(i.quantidade) !== 1 ? `${i.quantidade} × ` : ''
    return `• ${qtd}${i.descricao}: ${formatarMoeda(i.quantidade * i.valor_unitario)}`
  })
  return [
    `Olá, ${os.cliente_nome ?? 'cliente'}! Segue o orçamento da OS ${os.id}`,
    `${os.veiculo} (${os.placa})`,
    '',
    ...(linhas.length ? linhas : ['(sem itens lançados)']),
    '',
    `Total: ${formatarMoeda(itens.length ? totalDosItens(itens) : os.valor_total)}`,
    ...(os.eh_garantia ? ['Serviço em garantia: não será cobrado.'] : []),
  ].join('\n')
}
