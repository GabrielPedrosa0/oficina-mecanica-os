// Mecânicos e expediente (Figma "Mecânicos" e "Mecânicos em expediente" no Painel). Integrante 1.
// Rotas em backend/routers/mecanicos.py. As telas usam:
//   { id, nome, cpf, telefone, expediente_inicio: "08:00", expediente_fim: "17:00", os_em_servico: 2 }
// No backend (tabela mecanico) o expediente se chama hora_inicio_expediente / hora_fim_expediente
// e vem com segundos ("08:00:00"); este service traduz nos dois sentidos.
import { apiDelete, apiGet, apiPost, apiPut } from './api'

const hora = (valor) => (valor ? String(valor).slice(0, 5) : '')

function paraTela(mecanico) {
  if (!mecanico) return mecanico
  return {
    ...mecanico,
    expediente_inicio: hora(mecanico.hora_inicio_expediente),
    expediente_fim: hora(mecanico.hora_fim_expediente),
  }
}

function paraApi({ expediente_inicio, expediente_fim, ...dados }) {
  return {
    ...dados,
    hora_inicio_expediente: expediente_inicio || null,
    hora_fim_expediente: expediente_fim || null,
  }
}

// GET /api/mecanicos  ·  GET /api/mecanicos?em_expediente=true (só quem está no horário agora)
export const listarMecanicos = async ({ emExpediente } = {}) =>
  (await apiGet('/mecanicos', { em_expediente: emExpediente ? 'true' : undefined })).map(paraTela)

// GET /api/mecanicos/1
export const consultarMecanico = async (id) => paraTela(await apiGet(`/mecanicos/${id}`))
export const cadastrarMecanico = async (dados) => paraTela(await apiPost('/mecanicos', paraApi(dados)))
export const atualizarMecanico = async (id, dados) => paraTela(await apiPut(`/mecanicos/${id}`, paraApi(dados)))
export const excluirMecanico = (id) => apiDelete(`/mecanicos/${id}`)
