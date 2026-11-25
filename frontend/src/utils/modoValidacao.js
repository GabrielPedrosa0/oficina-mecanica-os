// Onde o participante está no teste, guardado no aparelho (localStorage). Assim, se ele
// fechar e abrir o link de novo, continua de onde parou.
//
// Estado: { codigo, sessao, origem, placa, etapa, tarefa }
//   etapa: 'perfil' | 'como_funciona' | 'cenario' | 'tarefa' | 'concluida' | 'feedback' | 'fim'
//   tarefa: 1 a 4 (nas etapas cenario, tarefa e concluida)
// Sem estado (ou com etapa 'fim') o app funciona normalmente, com login.
import { useEffect, useState } from 'react'

const CHAVE = 'oficina_validacao'
const EVENTO_MUDOU = 'oficina:validacao-mudou'

export function lerEstado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE))
  } catch {
    return null
  }
}

// Junta as mudanças ao estado atual e avisa as telas (ver useModoValidacao).
export function salvarEstado(mudancas) {
  const novo = { ...lerEstado(), ...mudancas }
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo))
  } catch {
    // sem localStorage o teste continua, só não retoma se a pessoa fechar a aba
  }
  window.dispatchEvent(new Event(EVENTO_MUDOU))
  return novo
}

export function apagarEstado() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // nada a apagar
  }
  window.dispatchEvent(new Event(EVENTO_MUDOU))
}

// Modo validação ligado: o app deixa entrar sem login e mostra a barra de progresso.
export function emValidacao(estado = lerEstado()) {
  return Boolean(estado?.sessao) && estado.etapa !== 'fim'
}

// A tarefa que está sendo feita agora (0 fora das tarefas).
export function tarefaAtual(estado = lerEstado()) {
  return estado && (estado.etapa === 'tarefa' || estado.etapa === 'concluida') ? estado.tarefa : 0
}

// Hook: o estado atual, atualizado a cada salvarEstado.
export function useModoValidacao() {
  const [estado, setEstado] = useState(lerEstado)
  useEffect(() => {
    const atualizar = () => setEstado(lerEstado())
    window.addEventListener(EVENTO_MUDOU, atualizar)
    return () => window.removeEventListener(EVENTO_MUDOU, atualizar)
  }, [])
  return estado
}

// CELULAR, TABLET ou COMPUTADOR, pela tela e pelo tipo de toque (dedo ou mouse).
export function tipoDoAparelho() {
  const dedo = window.matchMedia?.('(pointer: coarse)').matches
  if (!dedo) return 'COMPUTADOR'
  return Math.min(window.screen.width, window.screen.height) < 600 ? 'CELULAR' : 'TABLET'
}
