// Perguntas finais: as 10 do SUS (tocar de 1 a 5) e as 2 abertas (não obrigatórias).
import { useState } from 'react'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import { AFIRMACOES_SUS, ESCALA_SUS } from '../../constants/validacao'
import { useAcao } from '../../hooks/useApi'
import { gravarFeedback } from '../../services/validacaoService'
import { salvarEstado } from '../../utils/modoValidacao'

const NOTAS = [1, 2, 3, 4, 5]

export default function Feedback({ estado }) {
  const [sus, setSus] = useState(Array(10).fill(null))
  const [maisDificil, setMaisDificil] = useState('')
  const [mudaria, setMudaria] = useState('')
  const pedido = useAcao(gravarFeedback)
  const completo = sus.every(Boolean)

  function marcar(posicao, nota) {
    setSus(sus.map((atual, i) => (i === posicao ? nota : atual)))
  }

  async function enviar() {
    const resposta = await pedido.executar(estado.sessao, { sus, mais_dificil: maisDificil, mudaria })
    if (resposta) salvarEstado({ etapa: 'fim' })
  }

  return (
    <>
      <h1 className="validacao__titulo">O que você achou?</h1>
      <p className="validacao__texto">
        Para cada frase, toque de 1 a 5: 1 = {ESCALA_SUS[0].toLowerCase()}, 3 = {ESCALA_SUS[2].toLowerCase()}, 5 ={' '}
        {ESCALA_SUS[4].toLowerCase()}.
      </p>
      {AFIRMACOES_SUS.map((afirmacao, posicao) => (
        <fieldset key={afirmacao.texto} className="validacao__pergunta">
          <legend>
            {posicao + 1}. {afirmacao.texto}
            {afirmacao.explicacao && <span className="validacao__explicacao">{afirmacao.explicacao}</span>}
          </legend>
          <div className="validacao__opcoes validacao__opcoes--escala">
            {NOTAS.map((nota) => (
              <Botao
                key={nota}
                variante={sus[posicao] === nota ? 'primario' : 'secundario'}
                aria-pressed={sus[posicao] === nota}
                aria-label={`${nota}: ${ESCALA_SUS[nota - 1]}`}
                data-validacao={`sus_${posicao + 1}:${nota}`}
                onClick={() => marcar(posicao, nota)}
              >
                {String(nota)}
              </Botao>
            ))}
          </div>
          <div className="validacao__escala-legenda" aria-hidden="true">
            <span>Discordo</span>
            <span>Concordo</span>
          </div>
        </fieldset>
      ))}
      <Campo
        rotulo="O que foi mais difícil ou confuso?"
        tipo="textarea"
        opcional
        maxLength={1000}
        value={maisDificil}
        onChange={(e) => setMaisDificil(e.target.value)}
      />
      <Campo
        rotulo="O que você mudaria ou sentiu falta?"
        tipo="textarea"
        opcional
        maxLength={1000}
        value={mudaria}
        onChange={(e) => setMudaria(e.target.value)}
      />
      {pedido.erro && <Aviso tom="perigo">{pedido.erro.message}</Aviso>}
      <Botao larguraTotal disabled={!completo} carregando={pedido.executando} onClick={enviar}>
        Enviar respostas
      </Botao>
    </>
  )
}
