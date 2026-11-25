// Antes de cada tarefa: a frase do cenário e o botão Começar. A tarefa começa no Painel.
// Se a pessoa reabrir o link no meio de uma tarefa, a mesma tela aparece com "Continuar".
import { useNavigate } from 'react-router-dom'
import Botao from '../../components/ui/Botao'
import { TAREFAS } from '../../constants/validacao'
import { salvarEstado } from '../../utils/modoValidacao'
import { registrar } from '../../utils/registrador'

export default function Cenario({ estado }) {
  const navigate = useNavigate()
  const tarefa = TAREFAS[estado.tarefa - 1]
  const jaComecou = estado.etapa === 'tarefa'

  function comecar() {
    if (!jaComecou) {
      salvarEstado({ etapa: 'tarefa' })
      registrar({ tipo: 'INICIO_TAREFA' })
    }
    navigate('/')
  }

  return (
    <>
      <h1 className="validacao__titulo">Tarefa {tarefa.numero} de 4</h1>
      <p className="validacao__cenario">{tarefa.cenario(estado.sessao)}</p>
      <Botao larguraTotal data-validacao={jaComecou ? 'continuar' : 'comecar'} onClick={comecar}>
        {jaComecou ? 'Continuar' : 'Começar'}
      </Botao>
    </>
  )
}
