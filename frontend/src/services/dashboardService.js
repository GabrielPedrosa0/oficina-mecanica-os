// Chamadas do Painel (PC) / Início (celular). Ver backend/routers/dashboard.py.
import { apiGet } from './api'

// Os quatro indicadores do topo. faturamento_mes vem null para quem não é Gerente.
export const obterResumo = () => apiGet('/dashboard/resumo')

// OS abertas com previsão para hoje, paginadas ({ itens, total, tem_mais, mensagem_vazia }).
export const listarEntregasHoje = ({ limite = 20, offset = 0 } = {}) =>
  apiGet('/dashboard/entregas-hoje', { limite, offset })

// As OS abertas mais recentes ({ itens, total }).
export const listarOrdensRecentes = (limite = 10) => apiGet('/dashboard/ordens-recentes', { limite })
