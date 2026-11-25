// Agenda (guia 3.9). Fora do Figma do MVP. Rota em backend/routers/agenda.py (ainda vazia).
import { apiGet } from './api'

// GET /api/agenda?data=2026-11-11  -> OS previstas para a data
export const consultarAgenda = (data) => apiGet('/agenda', { data })
