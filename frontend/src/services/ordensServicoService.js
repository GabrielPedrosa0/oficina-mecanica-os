// Ordens de serviço (guia 3.2, 3.5 e 3.10). Integrante 2; ações de status: Integrante 3.
// Rotas em backend/routers/ordens_servico.py, acoes_os.py e exportacao.py.
import { apiBaixarArquivo, apiDelete, apiGet, apiPatch, apiPost, apiPut, montarQuery } from './api'

// GET /api/ordens-servico?status=&placa=&cliente=&garantia=true  (filtros opcionais e combináveis)
export const listarOrdens = ({ status, placa, cliente, garantia } = {}) =>
  apiGet('/ordens-servico', { status, placa, cliente, garantia: garantia ? 'true' : undefined })

// GET /api/ordens-servico/1042
export const consultarOrdem = (id) => apiGet(`/ordens-servico/${id}`)

// POST /api/ordens-servico  { veiculo_id, problema_relatado, quilometragem, mecanico, data_previsao, ... }
export const cadastrarOrdem = (dados) => apiPost('/ordens-servico', dados)

// PUT /api/ordens-servico/1042
export const atualizarOrdem = (id, dados) => apiPut(`/ordens-servico/${id}`, dados)

// DELETE /api/ordens-servico/1042
export const excluirOrdem = (id) => apiDelete(`/ordens-servico/${id}`)

// GET /api/ordens-servico/exportar  (CSV com os mesmos filtros da lista)
export const exportarOrdensCSV = ({ status, placa, cliente, garantia } = {}) =>
  apiBaixarArquivo(
    `/ordens-servico/exportar${montarQuery({ status, placa, cliente, garantia: garantia ? 'true' : undefined })}`,
    'ordens-servico.csv',
  )

// ---- Ações (Integrante 3, backend/routers/acoes_os.py) ----

// PATCH /api/ordens-servico/1042/status  { status, motivo? }  (motivo obrigatório para CANCELADA)
export const mudarStatus = (id, status, motivo) =>
  apiPatch(`/ordens-servico/${id}/status`, { status, ...(motivo ? { motivo } : {}) })

// POST /api/ordens-servico/1042/enviar-orcamento
export const enviarOrcamento = (id) => apiPost(`/ordens-servico/${id}/enviar-orcamento`)

// POST /api/ordens-servico/1042/marcar-pronta
export const marcarPronta = (id) => apiPost(`/ordens-servico/${id}/marcar-pronta`)

// ---- Apontamentos: a linha do tempo da OS (Integrante 3, rota proposta) ----

// GET /api/ordens-servico/1042/apontamentos  -> [{ id, tipo, data, descricao, usuario }]
export const listarApontamentos = (id) => apiGet(`/ordens-servico/${id}/apontamentos`)

// POST /api/ordens-servico/1042/apontamentos  { tipo, descricao }
export const registrarApontamento = (id, dados) => apiPost(`/ordens-servico/${id}/apontamentos`, dados)
