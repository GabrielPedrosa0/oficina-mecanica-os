// Botão "Sair": apaga a sessão guardada no navegador e volta para o login.
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { sair } from '../../services/authService'
import Botao from '../ui/Botao'

export default function BotaoSair({ comTexto = true, ...resto }) {
  const navigate = useNavigate()

  function aoSair() {
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <Botao variante="fantasma" icone={LogOut} onClick={aoSair} aria-label="Sair" {...resto}>
      {comTexto ? 'Sair' : null}
    </Botao>
  )
}
