// Chamadas do modo validação. Rotas em backend/routers/validacao.py.
import { api, apiBaixarArquivo, apiPost, apiPut } from './api'

// POST /api/validacao/aplicadores (com login)  -> { id, codigo, nome, criado_em }
export const gerarCodigoAplicador = (nome) => apiPost('/validacao/aplicadores', { nome })

// POST /api/validacao/sessoes  -> { id, ... }  (404 = código do link não existe)
export const criarSessao = (dados) => apiPost('/validacao/sessoes', dados)

// PUT /api/validacao/sessoes/{id}/perfil
export const gravarPerfil = (sessao, perfil) => apiPut(`/validacao/sessoes/${sessao}/perfil`, perfil)

// POST /api/validacao/sessoes/{id}/eventos  -> { gravados }
// keepalive: o envio termina mesmo se a pessoa fechar a aba logo depois.
export const enviarEventos = (sessao, eventos) =>
  api(`/validacao/sessoes/${sessao}/eventos`, { method: 'POST', body: JSON.stringify(eventos), keepalive: true })

// POST /api/validacao/sessoes/{id}/feedback  { sus: [10 notas], mais_dificil, mudaria }
export const gravarFeedback = (sessao, respostas) => apiPost(`/validacao/sessoes/${sessao}/feedback`, respostas)

// GET /api/validacao/exportar/... (com login): baixa o CSV.
export const baixarSessoes = () => apiBaixarArquivo('/validacao/exportar/sessoes', 'validacao-sessoes.csv')
export const baixarEventos = () => apiBaixarArquivo('/validacao/exportar/eventos', 'validacao-eventos.csv')
