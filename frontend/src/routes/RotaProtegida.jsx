// Só deixa abrir as telas internas quem está logado; os demais vão para /login.
// Guarda a página pedida em `state.de` para voltar a ela depois de entrar.
// Enquanto as telas não usam o LayoutPrincipal, mostra no topo uma barra com o usuário e o "Sair".
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import BotaoSair from '../components/layout/BotaoSair'
import { estaLogado, usuarioSalvo } from '../services/authService'
import './rota-protegida.css'

export default function RotaProtegida() {
  const local = useLocation()
  if (!estaLogado()) return <Navigate to="/login" replace state={{ de: local.pathname + local.search }} />

  const usuario = usuarioSalvo()
  return (
    <>
      <div className="barra-sessao">
        {usuario && <span className="barra-sessao__usuario">{usuario.nome}</span>}
        <BotaoSair tamanho="pequeno" />
      </div>
      <Outlet />
    </>
  )
}
