// Moldura de todas as telas internas (todas menos Login). Integrante 6.
// PC: menu lateral escuro + barra superior + conteúdo. Celular: conteúdo + barra de abas.
// As telas aparecem no <Outlet /> (ver routes/AppRoutes.jsx).
// No modo validação, mostra também a barra de progresso e o aviso de tarefa concluída.
import { Outlet, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { consultarUsuarioLogado, sair, usuarioSalvo } from '../../services/authService'
import { emValidacao, useModoValidacao } from '../../utils/modoValidacao'
import BarraProgresso from '../validacao/BarraProgresso'
import TarefaConcluida from '../validacao/TarefaConcluida'
import BarraAbas from './BarraAbas'
import BarraSuperior from './BarraSuperior'
import MenuLateral from './MenuLateral'
import './layout.css'

export default function LayoutPrincipal({ children }) {
  const navigate = useNavigate()
  const validacao = useModoValidacao()
  const testando = emValidacao(validacao)
  // Confere o token ao abrir (um 401 leva ao login) e atualiza nome e perfil.
  // No modo validação não há login, então não confere.
  const { dados } = useApi(consultarUsuarioLogado, [], { ativo: !testando })
  const usuario = dados ?? usuarioSalvo() ?? { nome: 'Usuário', perfil: 'RECEPCAO' }

  // No modo validação, "Sair" volta ao Painel (o participante não tem para onde sair).
  function sairDoSistema() {
    if (testando) return navigate('/')
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {testando && <BarraProgresso estado={validacao} fixa />}
      {testando && validacao.etapa === 'concluida' && <TarefaConcluida estado={validacao} />}
      <div className={testando ? 'layout layout--validacao' : 'layout'}>
        <MenuLateral usuario={usuario} onSair={sairDoSistema} />
        <div className="layout__principal">
          <BarraSuperior />
          <main className="layout__conteudo">{children ?? <Outlet />}</main>
        </div>
        <BarraAbas />
      </div>
    </>
  )
}
