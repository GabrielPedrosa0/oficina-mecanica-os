// Pesquisa geral (guia 3.7). Rota em backend/routers/busca.py.
import { apiGet } from './api'

// GET /api/busca?q=QRS4F21  ->  { ordens: [...], veiculos: [...], clientes: [...] }
// Placa, nome do cliente ou número da OS ("1042" ou "OS 1042").
export const pesquisar = (q) => apiGet('/busca', { q })
