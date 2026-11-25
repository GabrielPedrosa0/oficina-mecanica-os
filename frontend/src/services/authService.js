// Autenticação (guia 3.8). Integrante 6. Rotas em backend/routers/autenticacao.py.
// O token fica no localStorage e o api.js manda ele em todo pedido (Authorization: Bearer).
import { CHAVE_TOKEN, CHAVE_USUARIO, apiGet, apiPost, lerToken } from './api'

// POST /api/auth/login  -> { access_token, token_type, usuario: { id, nome, email, perfil } }
export async function entrar(email, senha) {
  const resposta = await apiPost('/auth/login', { email, senha })
  try {
    localStorage.setItem(CHAVE_TOKEN, resposta.access_token)
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario))
  } catch {
    // sem localStorage o login vale só até recarregar a página
  }
  return resposta.usuario
}

export function sair() {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
  } catch {
    // nada a limpar
  }
}

// O usuário salvo no último login (sem chamar o servidor). null se ninguém entrou.
export function usuarioSalvo() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO))
  } catch {
    return null
  }
}

export const estaLogado = () => Boolean(lerToken())

// GET /api/auth/me  (confere se o token ainda vale e atualiza o usuário salvo)
export async function consultarUsuarioLogado() {
  const usuario = await apiGet('/auth/me')
  try {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  } catch {
    // sem localStorage, só não guarda
  }
  return usuario
}

// Perfil em maiúsculas, sem acento: 'ADMIN', 'RECEPCAO' ou 'MECANICO'.
export function perfilDe(usuario) {
  return String(usuario?.perfil ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

// POST /api/auth/esqueci-senha  -> { mensagem } (a resposta é sempre a mesma)
export const esqueciSenha = (email) => apiPost('/auth/esqueci-senha', { email })
