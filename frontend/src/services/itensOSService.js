// Itens da OS (serviços e peças) e o catálogo de onde eles vêm.
// Rotas em backend/routers/itens_os.py (itens da OS) e backend/routers/itens.py (catálogo).
import { apiDelete, apiGet, apiPost, apiPut } from './api'

// O backend manda o tipo como PECA / SERVICO; os componentes (ItensOS, separarItens) usam peca / servico.
const TIPO_DA_TELA = { PECA: 'peca', SERVICO: 'servico' }
const paraATela = (item) => ({ ...item, tipo: TIPO_DA_TELA[item.tipo] ?? item.tipo })

// GET /api/ordens-servico/1042/itens
//   -> [{ id, item_id, descricao, quantidade, valor_unitario, tipo, codigo, tempo_estimado_min }]
export const listarItens = async (osId) => (await apiGet(`/ordens-servico/${osId}/itens`)).map(paraATela)

// POST /api/ordens-servico/1042/itens  { item_id, descricao, quantidade, valor_unitario }
export const adicionarItem = async (osId, dados) => paraATela(await apiPost(`/ordens-servico/${osId}/itens`, dados))

// PUT /api/ordens-servico/1042/itens/3  (mesmo corpo do POST)
export const atualizarItem = async (osId, itemOsId, dados) =>
  paraATela(await apiPut(`/ordens-servico/${osId}/itens/${itemOsId}`, dados))

// DELETE /api/ordens-servico/1042/itens/3
export const removerItem = (osId, itemOsId) => apiDelete(`/ordens-servico/${osId}/itens/${itemOsId}`)

// ---- Catálogo (GET /api/itens?tipo=SERVICO|PECA) ----
// -> [{ id, tipo, descricao, codigo, preco, qtd_estoque, tempo_estimado_min }]
export const listarServicosCatalogo = () => apiGet('/itens', { tipo: 'SERVICO' })
export const listarPecas = () => apiGet('/itens', { tipo: 'PECA' })
