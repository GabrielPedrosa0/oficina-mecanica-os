// Base das chamadas ao backend. Na Vercel, frontend e backend ficam no mesmo domínio:
// tudo que começa com /api vai para o serviço FastAPI (ver vercel.json). Por isso a URL é relativa.
// Para testar localmente com os dois juntos, use `vercel dev` na raiz do repositório.
export const API_BASE = '/api'

export async function api(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_BASE}${caminho}`, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', ...opcoes.headers },
  })
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} em ${caminho}`)
  }
  return resposta.status === 204 ? null : resposta.json()
}
