// Onde o participante está no teste, guardado no aparelho (localStorage). Assim, se ele
// fechar e abrir o link de novo, continua de onde parou.
//
// Dois modos:
//   CAPTURA  só o registrador (toques, erros, pausas, chamadas à API) numa sessão própria.
//            O app funciona normal, com login. Entrada: /validacao/captura?a=CODIGO
//   TRILHA   o nosso instrumento: as 4 tarefas, a barra de progresso, o perfil e o SUS,
//            sem login. Usa a captura por baixo. Entrada: /validacao?a=CODIGO
//
// Estado: { modo, codigo, sessao, origem, placa, etapa, tarefa }
//   modo: 'trilha' | 'captura'
//   etapa (trilha): 'perfil' | 'como_funciona' | 'cenario' | 'tarefa' | 'concluida' | 'feedback' | 'fim'
//   tarefa: 1 a 4 (nas etapas cenario, tarefa e concluida)
// Sem estado (ou com etapa 'fim') o app funciona normalmente, sem registrar nada.
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

// Registrador ligado (nos dois modos).
export function capturando(estado = lerEstado()) {
  return Boolean(estado?.sessao) && estado.etapa !== 'fim'
}

// Trilha ligada: o app deixa entrar sem login e mostra a barra de progresso.
export function emTrilha(estado = lerEstado()) {
  return capturando(estado) && estado.modo !== 'captura'
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
