// Números digitados com vírgula ("120,50") nos formulários: itens da OS, serviços e peças.

// "120,50" -> 120.5 ; "1.250,00" -> 1250 ; vazio ou inválido -> NaN
export function paraNumero(texto) {
  const t = String(texto ?? '').trim()
  if (t === '') return NaN
  return Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t)
}

// 120.5 -> "120,50" (para preencher o campo)
export function paraTextoDecimal(numero) {
  return numero == null ? '' : Number(numero).toFixed(2).replace('.', ',')
}
