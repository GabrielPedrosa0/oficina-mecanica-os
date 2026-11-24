// Clientes (issues #35, #58, #59, #60). Rotas em backend/routers/clientes.py.
import { apiGet, apiPost, apiPut } from './api'

// GET /api/clientes  ou  GET /api/clientes?nome=Marina
export const listarClientes = (nome) => apiGet('/clientes', { nome })

// GET /api/clientes/1
export const consultarCliente = (id) => apiGet(`/clientes/${id}`)

// POST /api/clientes  { nome, telefone, cpf_cnpj, email, ... }
export const cadastrarCliente = (dados) => apiPost('/clientes', dados)

// PUT /api/clientes/1
export const atualizarCliente = (id, dados) => apiPut(`/clientes/${id}`, dados)
