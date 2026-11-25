// Veículos (backend/routers/veiculos.py).
// SÓ USE ESTE ARQUIVO SE services/veiculosService.js ainda estiver vazio no seu repositório.
import { apiGet } from './api'

// GET /api/veiculos?placa=QRS4F21  ->  [{ id, placa, marca, modelo, ano, quilometragem, cliente_id, ... }]
export const listarVeiculos = ({ placa } = {}) => apiGet('/veiculos', { placa })
