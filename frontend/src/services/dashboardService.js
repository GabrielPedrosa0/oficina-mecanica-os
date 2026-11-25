// Painel / Início (guia 3.4). Integrante 4. Rotas em backend/routers/dashboard.py.
import { apiGet } from './api'

// GET /api/dashboard/resumo
// { em_servico, em_servico_previsao_hoje, aguardando_peca, aguardando_peca_atrasadas,
//   prontas, faturamento_mes (null se não for Gerente), mes_referencia, gerado_em }
export const obterResumo = () => apiGet('/dashboard/resumo')

// GET /api/dashboard/entregas-hoje?limite=20&offset=0  -> { itens, total, tem_mais, mensagem_vazia, ... }
export const listarEntregasHoje = ({ limite = 20, offset = 0 } = {}) =>
  apiGet('/dashboard/entregas-hoje', { limite, offset })

// GET /api/dashboard/ordens-recentes?limite=10  -> { total, itens }
export const listarOrdensRecentes = ({ limite = 10 } = {}) => apiGet('/dashboard/ordens-recentes', { limite })
