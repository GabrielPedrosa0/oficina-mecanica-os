// Base das chamadas ao backend. Integrante 6.
//
// Na Vercel, frontend e backend ficam no mesmo domínio: tudo que começa com /api vai para o
// serviço FastAPI (ver vercel.json). Por isso a URL é relativa.
// Localmente: rode o backend (`uvicorn app:app --reload`, porta 8000) e o `npm run dev`;
// o vite.config.js repassa /api para http://127.0.0.1:8000. Também funciona com `vercel dev`.
//
// Regra do grupo: as telas NÃO chamam fetch direto. Cada tela usa as funções do service do
// seu grupo (veiculosService.js, ordensServicoService.js...), e os services usam `api()`.

export const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
export const CHAVE_TOKEN = 'oficina_token'

// Erro com o status HTTP e a mensagem que o backend mandou em `detail`.
export class ErroApi extends Error {
  constructor(mensagem, status, detalhe) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.detalhe = detalhe
  }
}

// O FastAPI manda o erro em `detail`: texto (nossos HTTPException) ou lista (validação 422 do Pydantic).
function mensagemDoErro(corpo, status) {
  const detalhe = corpo?.detail
  // "Not Found" é a resposta padrão do FastAPI para um endereço que não tem rota.
  if (status === 404 && detalhe === 'Not Found') return 'Essa rota ainda não existe no backend.'
  if (typeof detalhe === 'string') return detalhe
  if (Array.isArray(detalhe) && detalhe.length > 0) {
    const primeiro = detalhe[0]
    const campo = primeiro.loc?.filter((p) => p !== 'body').join('.')
    return campo ? `Confira o campo "${campo}": ${primeiro.msg}` : primeiro.msg
  }
  if (status === 401) return 'Sessão inválida ou expirada. Entre novamente.'
  if (status === 404) return 'Não encontrado.'
  if (status >= 500) return 'O servidor teve um problema. Tente de novo em instantes.'
  return `Erro ${status}.`
}

// { status: 'EM_SERVICO', placa: '', cliente: null } -> "?status=EM_SERVICO" (ignora vazios)
export function montarQuery(parametros = {}) {
  const busca = new URLSearchParams()
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') busca.append(chave, valor)
  })
  const texto = busca.toString()
  return texto ? `?${texto}` : ''
}

// localStorage pode falhar (navegação anônima, iframe bloqueado): sem ele, só não manda o token.
export function lerToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN)
  } catch {
    return null
  }
}

function cabecalhos(extra = {}) {
  const token = lerToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

const MENSAGEM_DESLIGADO = 'Sem conexão com o servidor. Confira se o backend está ligado e a internet funcionando.'

function lerJson(texto) {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

async function requisitar(caminho, opcoes = {}) {
  let resposta
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers: cabecalhos(opcoes.headers) })
  } catch {
    throw new ErroApi(MENSAGEM_DESLIGADO, 0)
  }
  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '')
    // Erro 5xx sem corpo nenhum = o repasse do Vite não achou o backend (ele está desligado).
    if (!texto && resposta.status >= 500) throw new ErroApi(MENSAGEM_DESLIGADO, 0)
    const corpo = lerJson(texto)
    throw new ErroApi(mensagemDoErro(corpo, resposta.status), resposta.status, corpo?.detail)
  }
  return resposta
}

// Chamada padrão: devolve o JSON da resposta (ou null no 204).
// Ex.: api('/veiculos')  ·  api('/veiculos', { method: 'POST', body: JSON.stringify(dados) })
export async function api(caminho, opcoes = {}) {
  const resposta = await requisitar(caminho, opcoes)
  return resposta.status === 204 ? null : resposta.json()
}

// Atalhos para não repetir method/body em todo service.
export const apiGet = (caminho, parametros) => api(`${caminho}${montarQuery(parametros)}`)
export const apiPost = (caminho, dados) => api(caminho, { method: 'POST', body: JSON.stringify(dados ?? {}) })
export const apiPut = (caminho, dados) => api(caminho, { method: 'PUT', body: JSON.stringify(dados) })
export const apiPatch = (caminho, dados) => api(caminho, { method: 'PATCH', body: JSON.stringify(dados) })
export const apiDelete = (caminho) => api(caminho, { method: 'DELETE' })

// Baixa um arquivo (ex.: o CSV da exportação) e abre o "Salvar como" do navegador.
export async function apiBaixarArquivo(caminho, nomePadrao = 'arquivo') {
  const resposta = await requisitar(caminho)
  const disposicao = resposta.headers.get('Content-Disposition') ?? ''
  const nome = disposicao.match(/filename="?([^"]+)"?/)?.[1] ?? nomePadrao
  const blob = await resposta.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.click()
  URL.revokeObjectURL(url)
}
