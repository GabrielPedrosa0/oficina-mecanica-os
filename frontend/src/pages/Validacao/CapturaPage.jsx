// Captura: /validacao/captura?a=CODIGO (o mesmo código do aplicador).
// Liga só o registrador numa sessão nova e manda para o app, que funciona normal, com login.
// Sem barra de progresso, sem tarefas, sem perguntas: os eventos ficam com tarefa 0.
// Cada navegador é uma sessão; quem entrou aparece no evento do login (id do usuário).
//   ?origem=persona  marca a sessão como rodada automática (personas), para filtrar na análise.
import { useEffect, useRef } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import Aviso from '../../components/ui/Aviso'
import { EstadoCarregando } from '../../components/ui/Estados'
import { useAcao } from '../../hooks/useApi'
import { criarSessao } from '../../services/validacaoService'
import { apagarEstado, capturando, salvarEstado, tipoDoAparelho, useModoValidacao } from '../../utils/modoValidacao'
import { instalarRegistrador } from '../../utils/registrador'
import '../../components/validacao/validacao.css'

export default function CapturaPage() {
  const [busca] = useSearchParams()
  const codigo = busca.get('a')?.trim().toUpperCase() || null
  const origem = busca.get('origem')?.toUpperCase() === 'PERSONA' ? 'PERSONA' : 'PESSOA'
  const pedido = useAcao(criarSessao)
  const pedida = useRef(false)

  // Este navegador já captura com este código: só continua.
  const estado = useModoValidacao()
  const jaCaptura = capturando(estado) && estado.modo === 'captura' && estado.codigo === codigo

  useEffect(() => {
    if (!codigo || jaCaptura || pedida.current) return
    pedida.current = true // o StrictMode roda o efeito duas vezes em desenvolvimento
    pedido
      .executar({
        codigo_aplicador: codigo,
        origem,
        tipo_aparelho: tipoDoAparelho(),
        largura_tela: window.innerWidth,
        altura_tela: window.innerHeight,
        navegador: navigator.userAgent,
      })
      .then((sessao) => {
        if (!sessao) return
        apagarEstado() // uma trilha ou captura anterior neste navegador fica para trás
        salvarEstado({ modo: 'captura', codigo, origem, sessao: sessao.id, etapa: 'captura', tarefa: 0 })
        instalarRegistrador()
      })
  }, [codigo, origem, jaCaptura, pedido])

  if (jaCaptura) return <Navigate to="/" replace />

  let conteudo = <EstadoCarregando texto="Abrindo o sistema..." />
  if (!codigo) conteudo = <Aviso tom="perigo">Link incompleto: abra o link exatamente como você recebeu.</Aviso>
  else if (pedido.erro) conteudo = <Aviso tom="perigo">{pedido.erro.message}</Aviso>

  return (
    <div className="validacao">
      <main className="validacao__conteudo">{conteudo}</main>
    </div>
  )
}
