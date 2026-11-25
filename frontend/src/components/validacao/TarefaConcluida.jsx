// Aparece por cima da tela real quando a tarefa termina (a chamada final deu certo).
// Modo validação. O registrador muda a etapa para 'concluida'; este aviso leva à próxima.
import { useNavigate } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import Botao from '../ui/Botao'
import { salvarEstado } from '../../utils/modoValidacao'
import './validacao.css'

export default function TarefaConcluida({ estado }) {
  const navigate = useNavigate()
  const ultima = estado.tarefa === 4

  function seguir() {
    salvarEstado(ultima ? { etapa: 'feedback' } : { etapa: 'cenario', tarefa: estado.tarefa + 1 })
    navigate('/validacao')
  }

  return (
    <div className="tarefa-concluida" role="dialog" aria-modal="true" aria-labelledby="tarefa-concluida-titulo">
      <div className="tarefa-concluida__caixa">
        <ThumbsUp size={48} className="tarefa-concluida__icone" aria-hidden="true" />
        <h2 id="tarefa-concluida-titulo" className="tarefa-concluida__titulo">
          Pronto, tarefa concluída!
        </h2>
        <Botao larguraTotal data-validacao="proxima" onClick={seguir}>
          {ultima ? 'Ir para as perguntas finais' : 'Próxima tarefa'}
        </Botao>
      </div>
    </div>
  )
}
