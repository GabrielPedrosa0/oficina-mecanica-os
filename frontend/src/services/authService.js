// Autenticação (especificação 3.8): entrar, sair e lembrar quem está logado.
// O backend devolve { access_token, token_type, usuario } em POST /api/auth/login.
// O token fica no localStorage (CHAVE_TOKEN) e o api.js já manda ele em "Authorization: Bearer".
import { apiGet, apiPost, CHAVE_TOKEN, lerToken } from './api'

const CHAVE_USUARIO = 'oficina_usuario'

// localStorage pode falhar (navegação anônima, iframe bloqueado): aí só não lembra o login.
function gravar(chave, valor) {
  try {
    if (valor === null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, valor)
  } catch {
    /* sem armazenamento: segue sem lembrar */
  }
}

// POST /api/auth/login -> guarda token e usuário. Devolve o usuário.
export async function entrar(email, senha) {
  const resposta = await apiPost('/auth/login', { email: email.trim(), senha })
  gravar(CHAVE_TOKEN, resposta.access_token)
  gravar(CHAVE_USUARIO, JSON.stringify(resposta.usuario))
  return resposta.usuario
}

// Apaga a sessão guardada no navegador.
export function sair() {
  gravar(CHAVE_TOKEN, null)
  gravar(CHAVE_USUARIO, null)
}

// POST /api/auth/esqueci-senha (responde igual exista o e-mail ou não).
export function esqueciSenha(email) {
  return apiPost('/auth/esqueci-senha', { email: email.trim() })
}

// GET /api/auth/me: confirma que o token ainda vale (401 se expirou).
export function consultarUsuarioLogado() {
  return apiGet('/auth/me')
}

export function estaLogado() {
  return Boolean(lerToken())
}

// O usuário salvo no login, ou null.
export function usuarioSalvo() {
  try {
    const texto = localStorage.getItem(CHAVE_USUARIO)
    return texto ? JSON.parse(texto) : null
  } catch {
    return null
  }
}
