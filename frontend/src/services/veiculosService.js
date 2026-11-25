// Veículos (guia 3.1). Integrante 1. Rotas em backend/routers/veiculos.py.
import { apiDelete, apiGet, apiPost, apiPut } from './api'

// GET /api/veiculos  ·  ?placa=QRS  ·  ?busca=gol (placa, chassi, marca, modelo ou nome do cliente)
// Cada veículo vem com cliente_nome, status_os_aberta e os_aberta_id.
export const listarVeiculos = ({ placa, busca } = {}) => apiGet('/veiculos', { placa, busca })

// GET /api/veiculos/1
export const consultarVeiculo = (id) => apiGet(`/veiculos/${id}`)

// POST /api/veiculos  { placa, chassi, marca, modelo, ano, quilometragem, cliente_id }
export const cadastrarVeiculo = (dados) => apiPost('/veiculos', dados)

// PUT /api/veiculos/1
export const atualizarVeiculo = (id, dados) => apiPut(`/veiculos/${id}`, dados)

// DELETE /api/veiculos/1  (409 se o veículo tem OS)
export const excluirVeiculo = (id) => apiDelete(`/veiculos/${id}`)
