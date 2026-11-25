// Moldura de todas as telas internas (todas menos Login). Integrante 6.
// PC: menu lateral escuro + barra superior + conteúdo. Celular: conteúdo + barra de abas.
// As telas aparecem no <Outlet /> (ver routes/AppRoutes.jsx).
import { Outlet, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { consultarUsuarioLogado, sair, usuarioSalvo } from '../../services/authService'
import BarraAbas from './BarraAbas'
import BarraSuperior from './BarraSuperior'
import MenuLateral from './MenuLateral'
import './layout.css'

export default function LayoutPrincipal({ children }) {
  const navigate = useNavigate()
  // Confere o token ao abrir (um 401 leva ao login) e atualiza nome e perfil.
  const { dados } = useApi(consultarUsuarioLogado)
  const usuario = dados ?? usuarioSalvo() ?? { nome: 'Usuário', perfil: 'RECEPCAO' }

  function sairDoSistema() {
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <MenuLateral usuario={usuario} onSair={sairDoSistema} />
      <div className="layout__principal">
        <BarraSuperior />
        <main className="layout__conteudo">{children ?? <Outlet />}</main>
      </div>
      <BarraAbas />
    </div>
  )
}
