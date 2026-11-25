// Clientes (guia 3.6). Integrante 5. Rotas em backend/routers/clientes.py.
// As telas chamam a rua de `rua`; no backend (tabela cliente) ela se chama `logradouro`.
// Este service traduz nos dois sentidos.
import { apiDelete, apiGet, apiPost, apiPut } from './api'

function paraTela(cliente) {
  if (!cliente) return cliente
  const { logradouro, ...resto } = cliente
  return { ...resto, rua: logradouro ?? null }
}

function paraApi({ rua, ...dados }) {
  return { ...dados, logradouro: rua ?? null }
}

// GET /api/clientes  ·  GET /api/clientes?nome=Marina  (acha também por CPF, telefone ou placa)
export const listarClientes = async ({ nome } = {}) => (await apiGet('/clientes', { nome })).map(paraTela)

// GET /api/clientes/1  (vem com quantidade_veiculos)
export const consultarCliente = async (id) => paraTela(await apiGet(`/clientes/${id}`))

// POST /api/clientes  { nome, cpf_cnpj, telefone, email, cep, rua, numero, complemento, bairro, cidade, uf }
export const cadastrarCliente = async (dados) => paraTela(await apiPost('/clientes', paraApi(dados)))

// PUT /api/clientes/1
export const atualizarCliente = async (id, dados) => paraTela(await apiPut(`/clientes/${id}`, paraApi(dados)))

// DELETE /api/clientes/1  (409 se o cliente tem veículos)
export const excluirCliente = (id) => apiDelete(`/clientes/${id}`)

// GET /api/clientes/1/veiculos
export const listarVeiculosDoCliente = (id) => apiGet(`/clientes/${id}/veiculos`)

// GET /api/clientes/1/historico  (OS do cliente, da mais nova para a mais antiga)
export const consultarHistoricoDoCliente = (id) => apiGet(`/clientes/${id}/historico`)
