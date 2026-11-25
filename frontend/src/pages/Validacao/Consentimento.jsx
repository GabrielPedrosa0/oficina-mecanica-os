// P0: consentimento. Ao aceitar, a sessão é criada no backend e o registrador começa.
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import { placaDaSessao } from '../../constants/validacao'
import { useAcao } from '../../hooks/useApi'
import { criarSessao } from '../../services/validacaoService'
import { salvarEstado, tipoDoAparelho } from '../../utils/modoValidacao'
import { instalarRegistrador } from '../../utils/registrador'

export default function Consentimento({ codigo, origem }) {
  const pedido = useAcao(criarSessao)

  async function aceitar() {
    const sessao = await pedido.executar({
      codigo_aplicador: codigo,
      origem,
      tipo_aparelho: tipoDoAparelho(),
      largura_tela: window.innerWidth,
      altura_tela: window.innerHeight,
      navegador: navigator.userAgent,
    })
    if (!sessao) return
    salvarEstado({
      modo: 'trilha',
      codigo,
      origem,
      sessao: sessao.id,
      placa: placaDaSessao(sessao.id),
      etapa: 'perfil',
      tarefa: 0,
    })
    instalarRegistrador()
  }

  if (!codigo) {
    return (
      <Aviso tom="perigo" titulo="Link incompleto">
        Abra o link exatamente como você recebeu.
      </Aviso>
    )
  }

  return (
    <>
      <h1 className="validacao__titulo">Teste de um sistema de oficina</h1>
      <p className="validacao__texto">
        Estudantes estão testando um sistema para oficinas mecânicas e queremos saber se ele é fácil de usar. Não
        pedimos seu nome: anotamos, sem identificar você, onde você toca e quanto tempo leva.
      </p>
      {pedido.erro && <Aviso tom="perigo">{pedido.erro.message}</Aviso>}
      <Botao larguraTotal data-validacao="aceito" carregando={pedido.executando} onClick={aceitar}>
        Aceito participar
      </Botao>
    </>
  )
}
