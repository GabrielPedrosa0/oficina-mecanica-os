// Cartão de indicador do Painel / Início (Figma "Componentes > Indicador"). Integrante 6.
// Clicável quando recebe `para` (link) ou `onClick`: abre a lista já filtrada.
//
//   <Indicador titulo="Em serviço" valor={12} apoio="3 entram hoje" icone={Wrench}
//              para="/ordens?status=EM_SERVICO" />
//   <Indicador titulo="Faturado no mês" carregando />
import { Link } from 'react-router-dom'
import './ui.css'

export default function Indicador({ titulo, valor, apoio, icone: Icone, tom, para, onClick, carregando = false }) {
  const conteudo = (
    <>
      <div className="indicador__topo">
        <span className="indicador__titulo">{titulo}</span>
        {Icone && <Icone size={20} className="indicador__icone" aria-hidden="true" />}
      </div>
      {carregando ? (
        <>
          <span className="esqueleto" style={{ width: 64, height: 32, marginTop: 8 }} />
          <span className="esqueleto" style={{ width: 96, height: 12, marginTop: 8 }} />
        </>
      ) : (
        <>
          <span className="indicador__valor">{valor ?? '—'}</span>
          {apoio && <span className={`indicador__apoio ${tom ? `indicador__apoio--${tom}` : ''}`}>{apoio}</span>}
        </>
      )}
    </>
  )

  if (para) {
    return (
      <Link to={para} className="indicador indicador--clicavel">
        {conteudo}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" className="indicador indicador--clicavel" onClick={onClick}>
        {conteudo}
      </button>
    )
  }
  return <div className="indicador">{conteudo}</div>
}
