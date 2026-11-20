import './layout.css'

export default function RodapeAcoes({ children, soCelular = false }) {
  return <div className={`rodape-acoes ${soCelular ? 'so-celular' : ''}`}>{children}</div>
}
