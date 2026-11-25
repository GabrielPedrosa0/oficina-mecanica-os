// Entrada do modo validação: /validacao?a=CODIGO (o link que o aplicador mandou).
// Fora do layout e sem login. Mostra a etapa em que o participante está (guardada no aparelho):
// consentimento -> perfil -> como funciona -> cenário da tarefa (x4) -> feedback -> fim.
// Durante cada tarefa a pessoa usa as telas reais do app (ver LayoutPrincipal).
//   ?origem=persona  marca a sessão como rodada automática (personas), para filtrar na análise.
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import BarraProgresso from '../../components/validacao/BarraProgresso'
import TarefaConcluida from '../../components/validacao/TarefaConcluida'
import { useModoValidacao } from '../../utils/modoValidacao'
import { registrar } from '../../utils/registrador'
import Cenario from './Cenario'
import ComoFunciona from './ComoFunciona'
import Consentimento from './Consentimento'
import Feedback from './Feedback'
import Fim from './Fim'
import Perfil from './Perfil'
import '../../components/validacao/validacao.css'

const ETAPAS = { perfil: Perfil, como_funciona: ComoFunciona, cenario: Cenario, tarefa: Cenario, feedback: Feedback }

export default function ValidacaoPage() {
  const [busca] = useSearchParams()
  const codigoDoLink = busca.get('a')?.trim().toUpperCase() || null
  const origem = busca.get('origem')?.toUpperCase() === 'PERSONA' ? 'PERSONA' : 'PESSOA'
  const estado = useModoValidacao()

  // O mesmo aparelho continua de onde parou; um link de outro aplicador (ou uma captura que
  // estava ligada) começa do zero.
  const continua = estado?.sessao && estado.modo !== 'captura' && (!codigoDoLink || estado.codigo === codigoDoLink)
  const etapa = continua ? estado.etapa : 'consentimento'

  // Cada etapa desta tela conta como uma tela nos eventos.
  useEffect(() => {
    registrar({ tipo: 'TELA', componente: etapa })
  }, [etapa, estado?.tarefa])

  let conteudo
  if (!continua) {
    conteudo = <Consentimento codigo={codigoDoLink} origem={origem} />
  } else if (etapa === 'fim') {
    conteudo = <Fim estado={estado} />
  } else {
    const Etapa = ETAPAS[etapa] ?? Cenario
    conteudo = <Etapa estado={estado} />
  }

  return (
    <div className="validacao">
      {continua && <BarraProgresso estado={estado} />}
      <main className="validacao__conteudo">{conteudo}</main>
      {continua && etapa === 'concluida' && <TarefaConcluida estado={estado} />}
    </div>
  )
}
