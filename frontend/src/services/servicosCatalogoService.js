// Catálogo de serviços / mão de obra (Figma "Serviços"). Integrante 4.
// O valor cobrado em cada OS parte do preço base e pode ser ajustado.
//   { id, descricao, tempo_estimado_min: 40, preco_base: 120.0 }
import { apiDelete, apiGet, apiPost, apiPut } from './api'

// GET /api/servicos?busca=oleo
export const listarServicosCatalogo = ({ busca } = {}) => apiGet('/servicos', { busca })
export const cadastrarServicoCatalogo = (dados) => apiPost('/servicos', dados)
export const atualizarServicoCatalogo = (id, dados) => apiPut(`/servicos/${id}`, dados)
export const excluirServicoCatalogo = (id) => apiDelete(`/servicos/${id}`)
