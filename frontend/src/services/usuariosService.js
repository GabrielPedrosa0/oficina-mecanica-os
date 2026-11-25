// Usuários e perfis de acesso (Figma "Usuários": só o Gerente vê). Integrante 6.
// Rotas em backend/routers/usuarios.py (exigem login com perfil Gerente). Senha só no cadastro;
// no editar, senha vazia mantém a atual.
//   { id, nome, email, perfil: "ADMIN" | "RECEPCAO" | "MECANICO" }
import { apiDelete, apiGet, apiPost, apiPut } from './api'

export const listarUsuarios = () => apiGet('/usuarios')
export const cadastrarUsuario = (dados) => apiPost('/usuarios', dados)
export const atualizarUsuario = (id, dados) => apiPut(`/usuarios/${id}`, dados)
export const excluirUsuario = (id) => apiDelete(`/usuarios/${id}`)
