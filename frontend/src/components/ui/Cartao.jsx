import './ui.css'

export default function Cartao({ titulo, acao, semEspaco = false, className = '', children, ...resto }) {
  return (
    <section className={`cartao ${semEspaco ? 'cartao--sem-espaco' : ''} ${className}`} {...resto}>
      {(titulo || acao) && (
        <header className="cartao__cabecalho">
          {titulo && <h2 className="cartao__titulo">{titulo}</h2>}
          {acao}
        </header>
      )}
      {children}
    </section>
  )
}

export function Dado({ rotulo, children }) {
  return (
    <div className="dado">
      <span className="dado__rotulo">{rotulo}</span>
      <span className="dado__valor">{children ?? '—'}</span>
    </div>
  )
}

export function GradeDados({ colunas = 2, children }) {
  return (
    <div className="grade-dados" style={{ '--colunas': colunas }}>
      {children}
    </div>
  )
}
