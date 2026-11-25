// Barra fixa no topo durante o teste: Perfil, T1 a T4, Feedback. Modo validação.
import { ETAPAS_PROGRESSO } from '../../constants/validacao'
import './validacao.css'

// Em que posição da barra a pessoa está (0 = Perfil, 1 a 4 = tarefas, 5 = Feedback, 6 = fim).
function posicaoNaBarra(estado) {
  if (!estado || estado.etapa === 'perfil' || estado.etapa === 'como_funciona') return 0
  if (estado.etapa === 'feedback') return 5
  if (estado.etapa === 'fim') return 6
  return estado.tarefa
}

// fixa: dentro do app (LayoutPrincipal), presa no topo da janela.
export default function BarraProgresso({ estado, fixa = false }) {
  const atual = posicaoNaBarra(estado)
  return (
    <ol className={fixa ? 'barra-progresso barra-progresso--fixa' : 'barra-progresso'} aria-label="Progresso do teste">
      {ETAPAS_PROGRESSO.map((nome, posicao) => (
        <li
          key={nome}
          className={[
            'barra-progresso__etapa',
            posicao < atual && 'barra-progresso__etapa--feita',
            posicao === atual && 'barra-progresso__etapa--atual',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-current={posicao === atual ? 'step' : undefined}
        >
          {nome}
        </li>
      ))}
    </ol>
  )
}
