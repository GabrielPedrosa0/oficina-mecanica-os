// Validações dos formulários (RNF02). Integrante 6.
// Cada função devolve a MENSAGEM de erro (texto curto e acionável) ou null se está tudo certo.
// O backend valida de novo: isto é só para avisar antes de enviar.

// Placa antiga ABC1234 ou Mercosul ABC1D23. Aceita hífen e minúsculas na digitação.
export const REGEX_PLACA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/
const REGEX_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function limparPlaca(placa) {
  return String(placa ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

// obrigatorio(form.descricao, 'Informe a descrição.')
export function obrigatorio(valor, mensagem = 'Preencha este campo.') {
  const vazio = valor == null || String(valor).trim() === ''
  return vazio ? mensagem : null
}

export function validarPlaca(placa) {
  const limpa = limparPlaca(placa)
  if (!limpa) return 'Informe a placa.'
  if (!REGEX_PLACA.test(limpa)) return 'Placa inválida. Use ABC1234 ou ABC1D23.'
  return null
}

export function validarEmail(email, { obrigatorio: exigir = true } = {}) {
  const texto = String(email ?? '').trim()
  if (!texto) return exigir ? 'Informe o e-mail.' : null
  return REGEX_EMAIL.test(texto) ? null : 'E-mail inválido. Ex.: voce@oficina.com.br'
}

export function validarTelefone(telefone) {
  const d = String(telefone ?? '').replace(/\D/g, '')
  if (!d) return 'Informe o telefone.'
  return d.length === 10 || d.length === 11 ? null : 'Telefone inválido. Use DDD + número, ex.: (85) 90000-0001.'
}

export function validarSenha(senha) {
  if (!senha) return 'Informe a senha.'
  return senha.length >= 8 ? null : 'A senha precisa ter pelo menos 8 caracteres.'
}

// Quilometragem, quantidade, valor: vazio passa (use `obrigatorio` junto se precisar).
export function validarNumeroNaoNegativo(valor) {
  if (valor === '' || valor == null) return null
  const n = Number(String(valor).replace(',', '.'))
  return Number.isNaN(n) || n < 0 ? 'Use um número maior ou igual a zero.' : null
}

export function validarAno(ano) {
  const n = Number(ano)
  const limite = new Date().getFullYear() + 1
  if (!ano) return 'Informe o ano.'
  return n >= 1950 && n <= limite ? null : `Ano inválido. Use um ano entre 1950 e ${limite}.`
}

// CPF (11 dígitos) ou CNPJ (14), conferindo os dígitos verificadores.
export function validarCpfCnpj(valor, { obrigatorio: exigir = true } = {}) {
  const d = String(valor ?? '').replace(/\D/g, '')
  if (!d) return exigir ? 'Informe o CPF ou CNPJ.' : null
  const valido = d.length === 11 ? cpfValido(d) : d.length === 14 ? cnpjValido(d) : false
  return valido ? null : 'CPF ou CNPJ inválido. Confira os números.'
}

function cpfValido(d) {
  if (/^(\d)\1+$/.test(d)) return false
  const digito = (n) => {
    const soma = [...d.slice(0, n)].reduce((s, x, i) => s + Number(x) * (n + 1 - i), 0)
    return ((soma * 10) % 11) % 10
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

function cnpjValido(d) {
  if (/^(\d)\1+$/.test(d)) return false
  const digito = (n) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const resto = pesos.reduce((s, p, i) => s + Number(d[i]) * p, 0) % 11
    return resto < 2 ? 0 : 11 - resto
  }
  return digito(12) === Number(d[12]) && digito(13) === Number(d[13])
}

export function validarCep(valor, { obrigatorio: exigir = false } = {}) {
  const d = String(valor ?? '').replace(/\D/g, '')
  if (!d) return exigir ? 'Informe o CEP.' : null
  return d.length === 8 ? null : 'CEP inválido. Use 8 números, ex.: 61800-000.'
}

// Chassi (VIN): 17 letras e números, sem I, O e Q.
export function validarChassi(valor, { obrigatorio: exigir = false } = {}) {
  const c = String(valor ?? '')
    .toUpperCase()
    .replace(/\s/g, '')
  if (!c) return exigir ? 'Informe o chassi.' : null
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(c) ? null : 'Chassi inválido. São 17 letras e números (sem I, O e Q).'
}

// Expediente do mecânico: "08:00" até "17:00", o fim depois do começo.
export function validarExpediente(inicio, fim) {
  const hora = /^([01]\d|2[0-3]):[0-5]\d$/
  if (!inicio || !fim) return 'Informe o começo e o fim do expediente.'
  if (!hora.test(inicio) || !hora.test(fim)) return 'Use o formato 08:00.'
  return fim > inicio ? null : 'O fim do expediente precisa ser depois do começo.'
}

// Data de previsão não pode ser antes da abertura (nem no passado, na Nova OS).
export function validarPrevisao(previsao, abertura = new Date()) {
  if (!previsao) return null
  return new Date(previsao) < new Date(abertura) ? 'A previsão não pode ser antes da entrada.' : null
}

// Roda várias regras e junta os erros por campo: { placa: '...', email: '...' }.
// Uso: const erros = validar({ placa: validarPlaca(form.placa), email: validarEmail(form.email) })
export function validar(regras) {
  return Object.fromEntries(Object.entries(regras).filter(([, msg]) => msg))
}
