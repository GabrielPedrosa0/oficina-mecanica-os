import { Outlet, useNavigate } from 'react-router-dom'
import { usuarioSalvo } from '../../services/authService'
import BarraAbas from './BarraAbas'
import BarraSuperior from './BarraSuperior'
import MenuLateral from './MenuLateral'
import './layout.css'

export default function LayoutPrincipal({ children }) {
  const navigate = useNavigate()
  const usuario = usuarioSalvo()
  const usuarioMenu = usuario ? { nome: usuario.nome, perfil: usuario.perfil } : { nome: 'Usuário', perfil: 'RECEPCAO' }

  return (
    <div className="layout">
      <MenuLateral usuario={usuarioMenu} />
      <div className="layout__principal">
        <BarraSuperior onBuscar={(texto) => navigate(`/ordens?busca=${encodeURIComponent(texto)}`)} />
        <main className="layout__conteudo">{children ?? <Outlet />}</main>
      </div>
      <BarraAbas />
    </div>
  )
}
