// Protege as telas internas. Integrante 6.
//   - Modo validação ligado (participante do teste, ver pages/Validacao): entra sem login.
//   - Sem login: vai para /login guardando a tela que pediu (volta para ela depois de entrar).
//   - Sessão expirou (o backend respondeu 401): vai para /login com "Sua sessão expirou. Entre de novo."
//   - <RotaPerfil perfis={['ADMIN']}>: quem tem outro perfil vê "Você não tem acesso a esta tela".
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import Botao from '../components/ui/Botao'
import { EstadoVazio } from '../components/ui/Estados'
import { EVENTO_SESSAO_EXPIRADA } from '../services/api'
import { estaLogado, perfilDe, usuarioSalvo } from '../services/authService'
import { emTrilha } from '../utils/modoValidacao'

export default function RotaPrivada({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const expirou = () =>
      navigate('/login', {
        replace: true,
        state: { de: location, mensagem: 'Sua sessão expirou. Entre de novo.' },
      })
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, expirou)
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, expirou)
  }, [navigate, location])

  if (!estaLogado() && !emTrilha()) return <Navigate to="/login" replace state={{ de: location }} />
  return children ?? <Outlet />
}

export function RotaPerfil({ perfis, children }) {
  const perfil = perfilDe(usuarioSalvo())
  if (perfis.includes(perfil)) return children
  return (
    <div className="pagina">
      <EstadoVazio
        icone={LockKeyhole}
        titulo="Você não tem acesso a esta tela"
        texto="Peça ao gerente da oficina se precisar usar esta função."
        acao={
          <Botao para="/" variante="secundario">
            Voltar ao painel
          </Botao>
        }
      />
    </div>
  )
}
