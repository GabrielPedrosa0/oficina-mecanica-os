// P2: como funciona. Texto genérico, igual para todos (ninguém explica nada além disto).
import Botao from '../../components/ui/Botao'
import { salvarEstado } from '../../utils/modoValidacao'

export default function ComoFunciona() {
  return (
    <>
      <h1 className="validacao__titulo">Como funciona</h1>
      <p className="validacao__texto">
        São 4 tarefas curtas, como se você trabalhasse na recepção de uma oficina mecânica. Não precisa entender de
        oficina.
      </p>
      <p className="validacao__texto">
        Na oficina, cada carro que chega para conserto ganha uma ordem de serviço (OS): a ficha com o problema do carro
        e os serviços que serão feitos.
      </p>
      <p className="validacao__texto">
        Estamos testando o sistema, não você. Faça do jeito que achar melhor; quando a tarefa der certo, o sistema avisa
        sozinho.
      </p>
      <Botao larguraTotal onClick={() => salvarEstado({ etapa: 'cenario', tarefa: 1 })}>
        Entendi
      </Botao>
    </>
  )
}
