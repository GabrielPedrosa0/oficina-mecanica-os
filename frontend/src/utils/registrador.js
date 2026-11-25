// O registrador do modo validação: anota o que acontece na tela e manda para o backend
// em lotes, a cada poucos segundos. As telas do app não precisam fazer nada: os ouvintes
// ficam na página inteira.
//
// O que ele anota (tipos em backend/schemas/validacao_schema.py):
//   CLIQUE               toque em qualquer lugar (botão, link, campo ou fundo da tela)
//   CLIQUE_DESABILITADO  toque num botão ou campo desabilitado
//   ERRO_FORMULARIO      mensagem de erro que apareceu na tela (campo ou aviso vermelho)
//   CHAMADA_API          cada resposta do backend (método, caminho, status, id devolvido)
//   SAIU / VOLTOU        a pessoa saiu do app (outra aba, celular bloqueado) e voltou
//   TELA                 troca de tela (ver OuvinteDeTelas em routes/AppRoutes.jsx)
//   INICIO_TAREFA / FIM_TAREFA
// O que a pessoa DIGITA nunca é anotado: só qual campo ela tocou.
//
// Para um nome melhor que o texto do botão, ponha data-validacao="nome" no componente.
import { TAREFAS } from '../constants/validacao'
import { EVENTO_CHAMADA_API } from '../services/api'
import { enviarEventos } from '../services/validacaoService'
import { capturando, lerEstado, salvarEstado, tarefaAtual } from './modoValidacao'

const SEGUNDOS_ENTRE_ENVIOS = 5
const TAMANHO_DO_LOTE = 200
const MAXIMO_NA_FILA = 2000 // sem internet por muito tempo, guarda só os mais recentes

const INTERATIVOS = 'button, a, input, select, textarea, label, summary, [role="button"], [role="tab"]'
const ERROS = '.campo__erro, [role="alert"]'

let fila = []
let instalado = false
let ultimoErro = ''

const encurtar = (texto, tamanho = 80) => (texto ?? '').replace(/\s+/g, ' ').trim().slice(0, tamanho) || null

export function registrar(evento) {
  const estado = lerEstado()
  if (!capturando(estado)) return
  fila.push({
    tarefa: tarefaAtual(estado),
    tela: window.location.pathname,
    instante: new Date().toISOString(),
    ...evento,
  })
}

// Manda o que está na fila. Se falhar (sem internet), devolve para a fila e tenta depois.
export async function enviarFila() {
  const estado = lerEstado()
  if (!estado?.sessao || fila.length === 0) return
  const lote = fila.splice(0, TAMANHO_DO_LOTE)
  try {
    await enviarEventos(estado.sessao, lote)
  } catch {
    fila = [...lote, ...fila].slice(-MAXIMO_NA_FILA)
  }
}

// Nome do componente: data-validacao, ou o texto que a pessoa vê (rótulo do campo, texto do
// botão, aria-label).
function descrever(elemento) {
  if (elemento.dataset.validacao) return elemento.dataset.validacao
  const rotulo = elemento.id && document.querySelector(`label[for="${CSS.escape(elemento.id)}"]`)
  return encurtar(
    elemento.getAttribute('aria-label') || (rotulo && rotulo.textContent) || elemento.textContent || elemento.name,
  )
}

function aoClicar(evento) {
  ultimoErro = '' // depois de um toque, o mesmo erro pode aparecer de novo e é anotado
  const alvo = evento.target.closest?.(`[data-validacao], ${INTERATIVOS}`)
  if (!alvo) {
    registrar({ tipo: 'CLIQUE', componente: 'fundo', texto: encurtar(evento.target.textContent, 60) })
    return
  }
  registrar({ tipo: 'CLIQUE', componente: alvo.tagName.toLowerCase(), texto: descrever(alvo) })
}

// O navegador não dispara "click" em botão desabilitado, mas dispara "pointerdown".
function aoTocar(evento) {
  const alvo = evento.target.closest?.('button, input, select, textarea')
  if (alvo?.disabled) {
    registrar({ tipo: 'CLIQUE_DESABILITADO', componente: alvo.tagName.toLowerCase(), texto: descrever(alvo) })
  }
}

// Erros que aparecem na tela: o Campo mostra o erro em .campo__erro e o Aviso vermelho usa
// role="alert". Anota cada mensagem nova (sem repetir a mesma em seguida).
function errosDentro(no) {
  if (!(no instanceof Element)) return []
  const pai = no.closest(ERROS)
  return pai ? [pai] : [...no.querySelectorAll(ERROS)]
}

function aoMudarTela(mudancas) {
  for (const mudanca of mudancas) {
    const nos = mudanca.type === 'characterData' ? [mudanca.target.parentElement] : [...mudanca.addedNodes]
    for (const erro of nos.flatMap(errosDentro)) {
      const texto = encurtar(erro.textContent, 200)
      if (texto && texto !== ultimoErro) {
        ultimoErro = texto
        registrar({ tipo: 'ERRO_FORMULARIO', texto })
      }
    }
  }
}

function aoTrocarVisibilidade() {
  if (document.visibilityState === 'hidden') {
    registrar({ tipo: 'SAIU' })
    enviarFila()
  } else {
    registrar({ tipo: 'VOLTOU' })
  }
}

// Cada resposta do backend. As chamadas do próprio registrador (/validacao/...) ficam de fora.
// Se for a chamada que termina a tarefa atual, a tarefa fica concluída.
function aoChamarApi({ detail }) {
  if (detail.caminho.startsWith('/validacao')) return
  registrar({
    tipo: 'CHAMADA_API',
    metodo: detail.metodo,
    caminho: detail.caminho.split('?')[0],
    texto: detail.caminho.includes('?') ? encurtar(detail.caminho.split('?')[1], 200) : null,
    status: detail.status,
    id_registro: Number.isInteger(detail.id) ? detail.id : null,
  })
  const estado = lerEstado()
  const tarefa = TAREFAS[estado?.tarefa - 1]
  if (estado?.etapa === 'tarefa' && tarefa?.terminou({ ...detail, caminho: detail.caminho.split('?')[0] })) {
    registrar({ tipo: 'FIM_TAREFA' })
    salvarEstado({ etapa: 'concluida' })
    enviarFila()
  }
}

// Liga os ouvintes uma vez só (pode ser chamada de novo sem problema).
export function instalarRegistrador() {
  if (instalado) return
  instalado = true
  document.addEventListener('click', aoClicar, true)
  document.addEventListener('pointerdown', aoTocar, true)
  document.addEventListener('visibilitychange', aoTrocarVisibilidade)
  window.addEventListener(EVENTO_CHAMADA_API, aoChamarApi)
  new MutationObserver(aoMudarTela).observe(document.body, { childList: true, subtree: true, characterData: true })
  setInterval(enviarFila, SEGUNDOS_ENTRE_ENVIOS * 1000)
}
