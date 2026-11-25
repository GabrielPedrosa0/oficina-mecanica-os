// Formatação para a tela (seção 2.3 da especificação). Integrante 6.
// Nenhuma função aqui muda o dado: só transforma em texto para mostrar.

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const moedaSemCentavos = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})
const numero = new Intl.NumberFormat('pt-BR')
const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Intl usa um espaço especial depois do "R$"; trocamos por espaço comum para copiar/colar sem surpresa.
const limparEspaco = (texto) => texto.replace(/\u00a0/g, ' ')

// 1250 -> "R$ 1.250,00". O backend de hoje manda o valor em reais (valor_total: 340.0).
export function formatarMoeda(valorEmReais) {
  if (valorEmReais == null || Number.isNaN(Number(valorEmReais))) return '—'
  return limparEspaco(moeda.format(Number(valorEmReais)))
}

// 18240 -> "R$ 18.240" (indicadores e coluna Valor da tabela, como no Figma).
export function formatarMoedaCurta(valorEmReais) {
  if (valorEmReais == null || Number.isNaN(Number(valorEmReais))) return '—'
  return limparEspaco(moedaSemCentavos.format(Number(valorEmReais)))
}

// Para quando o banco passar a guardar em centavos (total_centavos): 34000 -> "R$ 340,00".
export function formatarCentavos(centavos) {
  if (centavos == null) return '—'
  return formatarMoeda(Number(centavos) / 100)
}

// "qrs-4f21" -> "QRS4F21" (guardada sem hífen e em maiúsculas).
export function formatarPlaca(placa) {
  return (placa ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// "85900000001" -> "(85) 90000-0001"
export function formatarTelefone(telefone) {
  const d = String(telefone ?? '').replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone ?? ''
}

// Link para ligar ou abrir o WhatsApp a partir do telefone.
export function linkTelefone(telefone) {
  return `tel:+55${String(telefone ?? '').replace(/\D/g, '')}`
}
export function linkWhatsApp(telefone, mensagem = '') {
  const d = String(telefone ?? '').replace(/\D/g, '')
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''
  return `https://wa.me/55${d}${texto}`
}

// 82300 -> "82.300 km"
export function formatarKm(km) {
  if (km == null || km === '') return '—'
  return `${numero.format(Number(km))} km`
}

// 2 -> "2 veículos", 1 -> "1 veículo"
export function plural(qtd, singular, pluralTexto = `${singular}s`) {
  return `${qtd} ${qtd === 1 ? singular : pluralTexto}`
}

// Datas do backend chegam sem fuso ("2026-11-11T17:00:00") e já estão no horário da
// oficina; `new Date()` lê esse formato como horário local, que é o que queremos.
function paraData(valor) {
  if (!valor) return null
  const data = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data
}

const doisDigitos = (n) => String(n).padStart(2, '0')
const hora = (d) => `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`

function diferencaEmDias(data, hoje = new Date()) {
  const a = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  const b = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((a - b) / 86_400_000)
}

// "11/11/2026"
export function formatarData(valor) {
  const d = paraData(valor)
  if (!d) return '—'
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`
}

// "11/11/2026 08:10"
export function formatarDataHora(valor) {
  const d = paraData(valor)
  return d ? `${formatarData(d)} ${hora(d)}` : '—'
}

// Previsão nas listas (Figma): "Hoje, 17:00", "Amanhã", "Ontem", "Quinta" (na semana) ou "18/11".
// `separador` = ', ' nos cartões e ' ' na tabela do PC ("Hoje 17:00").
export function formatarPrevisao(valor, { separador = ', ', vazio = 'Sem data' } = {}) {
  const d = paraData(valor)
  if (!d) return vazio
  const dias = diferencaEmDias(d)
  if (dias === 0) return `Hoje${separador}${hora(d)}`
  if (dias === 1) return 'Amanhã'
  if (dias === -1) return 'Ontem'
  if (dias > 1 && dias < 7) return DIAS_SEMANA[d.getDay()]
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}`
}

// Igual à previsão, mas sempre com a hora: "Hoje, 08:10", "Ontem, 14:00", "12/11, 09:30".
export function formatarMomento(valor) {
  const d = paraData(valor)
  if (!d) return '—'
  const dias = diferencaEmDias(d)
  const dia =
    dias === 0
      ? 'Hoje'
      : dias === 1
        ? 'Amanhã'
        : dias === -1
          ? 'Ontem'
          : `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}`
  return `${dia}, ${hora(d)}`
}

// O inverso: Date -> "2026-11-11T17:00:00" (sem fuso), o formato que o backend aceita.
export function paraDataSemFuso(data) {
  const d = paraData(data)
  if (!d) return null
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}T${hora(d)}:00`
}

// Valor de <input type="datetime-local"> ("2026-11-11T17:00") -> formato do backend.
export function deCampoDataHora(valorDoCampo) {
  return valorDoCampo ? `${valorDoCampo}:00`.slice(0, 19) : null
}

// Formato do backend -> valor de <input type="datetime-local">.
export function paraCampoDataHora(valor) {
  return valor ? String(valor).slice(0, 16) : ''
}

// "12345678900" -> "123.456.789-00"; 14 dígitos -> "12.345.678/0001-90" (CNPJ)
export function formatarCpfCnpj(valor) {
  const d = String(valor ?? '').replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return valor ?? ''
}

// "61800000" -> "61800-000"
export function formatarCep(valor) {
  const d = String(valor ?? '').replace(/\D/g, '')
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : (valor ?? '')
}

// Minutos -> "40 min", "1 h", "1 h 30 min" (tempo estimado dos serviços)
export function formatarDuracao(minutos) {
  const m = Number(minutos)
  if (!m) return '—'
  const h = Math.floor(m / 60)
  const resto = m % 60
  if (!h) return `${resto} min`
  return resto ? `${h} h ${resto} min` : `${h} h`
}

// "08:00:00" e "17:00" -> "08:00–17:00" (expediente do mecânico)
export function formatarExpediente(inicio, fim) {
  if (!inicio || !fim) return 'Sem horário'
  return `${String(inicio).slice(0, 5)}–${String(fim).slice(0, 5)}`
}

// "2024-03-10" -> "Março de 2024" ("Cliente desde")
export function formatarMesAno(valor) {
  const d = paraData(valor)
  if (!d) return '—'
  const mes = d.toLocaleDateString('pt-BR', { month: 'long' })
  return `${mes[0].toUpperCase()}${mes.slice(1)} de ${d.getFullYear()}`
}

// Chassi tem 17 caracteres; no celular cabe só o começo e o fim: "9BWAB05U…4821"
export function encurtarChassi(chassi) {
  const c = String(chassi ?? '')
  return c.length > 12 ? `${c.slice(0, 8)}…${c.slice(-4)}` : c || '—'
}

// "Rafael Lima" -> "Rafael" (coluna Mecânico da tabela)
export function primeiroNome(nome) {
  return (
    String(nome ?? '')
      .trim()
      .split(/\s+/)[0] || ''
  )
}

// "Marina Souza" -> "MS"; "Usuário" -> "U"
export function iniciais(nome) {
  const partes = String(nome ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Número da OS: 1042 -> "OS 1042"
export function formatarNumeroOS(id) {
  return id == null ? 'OS —' : `OS ${id}`
}
