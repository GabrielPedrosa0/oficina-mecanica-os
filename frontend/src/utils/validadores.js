// Leitura e conferência do que a pessoa digita nos formulários.
// O backend confere tudo de novo; aqui é só para avisar logo, ao lado do campo.

// "120,50" -> 120.5 · "1.200,50" -> 1200.5 · "120.5" -> 120.5 · "abc" -> NaN
export function lerValor(texto) {
  const limpo = String(texto ?? '')
    .trim()
    .replace(/^R\$\s*/, '')
  if (!limpo) return NaN
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  return /^\d+(\.\d+)?$/.test(normal) ? Number(normal) : NaN
}

// 120.5 -> "120,50" (valor para preencher o campo de edição)
export function valorParaCampo(valor) {
  return valor == null || Number.isNaN(Number(valor)) ? '' : Number(valor).toFixed(2).replace('.', ',')
}

// Quantidade: número inteiro maior que zero. Devolve a mensagem de erro, ou '' se estiver certo.
export function erroQuantidade(texto) {
  const quantidade = Number(texto)
  if (String(texto).trim() === '' || !Number.isInteger(quantidade) || quantidade <= 0) {
    return 'Informe uma quantidade inteira maior que zero.'
  }
  return ''
}

// Valor em reais: maior que zero (regra do cenário). Devolve a mensagem de erro, ou '' se estiver certo.
export function erroValor(texto) {
  const valor = lerValor(texto)
  if (Number.isNaN(valor)) return 'Informe o valor, por exemplo 120,50.'
  if (valor <= 0) return 'O valor deve ser maior que zero.'
  return ''
}
