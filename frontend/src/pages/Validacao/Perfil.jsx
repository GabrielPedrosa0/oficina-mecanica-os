// P1: perfil anônimo, 6 perguntas de tocar. Aparelho e tela já foram gravados na sessão.
import { useState } from 'react'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import { PERGUNTAS_PERFIL } from '../../constants/validacao'
import { useAcao } from '../../hooks/useApi'
import { gravarPerfil } from '../../services/validacaoService'
import { salvarEstado } from '../../utils/modoValidacao'

export default function Perfil({ estado }) {
  const [respostas, setRespostas] = useState({})
  const pedido = useAcao(gravarPerfil)
  const completo = PERGUNTAS_PERFIL.every((p) => respostas[p.campo])

  async function continuar() {
    if (await pedido.executar(estado.sessao, respostas)) salvarEstado({ etapa: 'como_funciona' })
  }

  return (
    <>
      <h1 className="validacao__titulo">Sobre você</h1>
      <p className="validacao__texto">Toque na resposta de cada pergunta.</p>
      {PERGUNTAS_PERFIL.map((p) => (
        <fieldset key={p.campo} className="validacao__pergunta">
          <legend>{p.pergunta}</legend>
          <div className="validacao__opcoes">
            {p.opcoes.map((o) => (
              <Botao
                key={o.value}
                variante={respostas[p.campo] === o.value ? 'primario' : 'secundario'}
                aria-pressed={respostas[p.campo] === o.value}
                data-validacao={`${p.campo}:${o.value}`}
                onClick={() => setRespostas({ ...respostas, [p.campo]: o.value })}
              >
                {o.texto}
              </Botao>
            ))}
          </div>
        </fieldset>
      ))}
      {pedido.erro && <Aviso tom="perigo">{pedido.erro.message}</Aviso>}
      <Botao larguraTotal disabled={!completo} carregando={pedido.executando} onClick={continuar}>
        Continuar
      </Botao>
    </>
  )
}
