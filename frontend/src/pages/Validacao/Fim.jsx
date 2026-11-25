// Fim do teste. Se outra pessoa for participar no mesmo aparelho, começa uma sessão nova.
import { useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import Botao from '../../components/ui/Botao'
import { apagarEstado } from '../../utils/modoValidacao'
import { enviarFila } from '../../utils/registrador'

export default function Fim({ estado }) {
  const navigate = useNavigate()

  async function outraPessoa() {
    await enviarFila()
    apagarEstado()
    navigate(`/validacao?a=${estado.codigo}${estado.origem === 'PERSONA' ? '&origem=persona' : ''}`)
  }

  return (
    <>
      <PartyPopper size={48} aria-hidden="true" />
      <h1 className="validacao__titulo">Obrigado!</h1>
      <p className="validacao__texto">Suas respostas foram enviadas. Pode fechar esta página.</p>
      <Botao variante="secundario" larguraTotal onClick={outraPessoa}>
        Outra pessoa vai participar neste aparelho
      </Botao>
    </>
  )
}
