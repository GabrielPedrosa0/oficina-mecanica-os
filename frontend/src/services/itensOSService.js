// Itens da OS: serviços (mão de obra) e peças (guia 3.3). Integrante 3.
// Rotas em backend/routers/itens_os.py.
//
// No backend, todo item da OS aponta para um item do catálogo (tabela item) pelo `item_id`.
// As telas trabalham com { tipo: 'servico' | 'peca', servico_id, peca_id }; este service
// traduz nos dois sentidos, então as telas não precisam saber do `item_id`.
// Serviço ou peça digitado à mão (fora do catálogo) usa o item genérico do sistema:
// 1 = "Peça" e 2 = "Serviço" (banco/modelo_logico_oficina.sql).
import { apiDelete, apiGet, apiPost, apiPut } from './api'

const PECA_GENERICA = 1
const SERVICO_GENERICO = 2

// Item como vem do backend -> item como as telas usam.
function paraTela(item) {
  if (!item) return item
  const tipo = String(item.tipo ?? '').toLowerCase() === 'peca' ? 'peca' : 'servico'
  const generico = item.item_id === PECA_GENERICA || item.item_id === SERVICO_GENERICO
  return {
    ...item,
    tipo,
    peca_id: tipo === 'peca' && !generico ? item.item_id : null,
    servico_id: tipo === 'servico' && !generico ? item.item_id : null,
  }
}

// { tipo, descricao, quantidade, valor_unitario, peca_id, servico_id } -> corpo do backend.
function paraApi(dados) {
  const catalogo = dados.tipo === 'peca' ? dados.peca_id : dados.servico_id
  return {
    item_id: catalogo ?? (dados.tipo === 'peca' ? PECA_GENERICA : SERVICO_GENERICO),
    descricao: dados.descricao,
    quantidade: dados.quantidade,
    valor_unitario: dados.valor_unitario,
  }
}

// GET /api/ordens-servico/1042/itens
export const listarItens = async (osId) => (await apiGet(`/ordens-servico/${osId}/itens`)).map(paraTela)

// POST /api/ordens-servico/1042/itens
export const adicionarItem = async (osId, dados) =>
  paraTela(await apiPost(`/ordens-servico/${osId}/itens`, paraApi(dados)))

// PUT /api/ordens-servico/1042/itens/7
export const atualizarItem = async (osId, itemId, dados) =>
  paraTela(await apiPut(`/ordens-servico/${osId}/itens/${itemId}`, paraApi(dados)))

// DELETE /api/ordens-servico/1042/itens/7
export const removerItem = (osId, itemId) => apiDelete(`/ordens-servico/${osId}/itens/${itemId}`)
