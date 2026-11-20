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
