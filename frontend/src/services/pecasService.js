// Peças e estoque (Figma "Peças"). Integrante 4.
// A quantidade em estoque diminui quando a peça é lançada numa OS.
//   { id, codigo, descricao, estoque: 24, estoque_minimo: 5, preco_venda: 40.0 }
import { apiDelete, apiGet, apiPost, apiPut } from './api'

// GET /api/pecas?busca=filtro&estoque_baixo=true
export const listarPecas = ({ busca, estoqueBaixo } = {}) =>
  apiGet('/pecas', { busca, estoque_baixo: estoqueBaixo ? 'true' : undefined })
export const cadastrarPeca = (dados) => apiPost('/pecas', dados)
export const atualizarPeca = (id, dados) => apiPut(`/pecas/${id}`, dados)
export const excluirPeca = (id) => apiDelete(`/pecas/${id}`)

// POST /api/pecas/7/entradas  { quantidade, observacao }  (botão "Entrada de estoque")
export const registrarEntradaEstoque = (id, dados) => apiPost(`/pecas/${id}/entradas`, dados)
