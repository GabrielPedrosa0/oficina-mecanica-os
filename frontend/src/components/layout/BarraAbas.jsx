// Barra de abas fixa no rodapé do celular (Figma "Aba inferior"). Integrante 6.
// Só aparece no celular (até 899 px). "Mais" fica ativa também nas telas que abrem por ela.
import { NavLink, useLocation } from 'react-router-dom'
import { ABAS_CELULAR } from './itensMenu'
import './layout.css'

export default function BarraAbas({ abas = ABAS_CELULAR }) {
  const { pathname } = useLocation()
  return (
    <nav className="barra-abas" aria-label="Navegação">
      {abas.map(({ para, rotulo, icone: Icone, inclui = [] }) => {
        const ativaPorInclusao = inclui.some((p) => pathname === p || pathname.startsWith(`${p}/`))
        return (
          <NavLink
            key={para}
            to={para}
            end={para === '/'}
            className={({ isActive }) => `aba ${isActive || ativaPorInclusao ? 'aba--ativa' : ''}`}
          >
            <Icone size={24} aria-hidden="true" />
            <span className="aba__rotulo">{rotulo}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
