// Mecânicos (backend/routers/mecanicos.py).
import { apiGet } from './api'

// GET /api/mecanicos  ->  [{ id, nome, cpf, telefone, hora_inicio_expediente, hora_fim_expediente }]
export const listarMecanicos = () => apiGet('/mecanicos')
