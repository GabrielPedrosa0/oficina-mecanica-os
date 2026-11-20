import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import './ui.css'

const ICONES = { info: Info, atencao: TriangleAlert, sucesso: CircleCheck, perigo: CircleAlert }

export default function Aviso({ tom = 'info', titulo, children, onFechar }) {
  const Icone = ICONES[tom] ?? Info
  return (
    <div className={`aviso aviso--${tom}`} role={tom === 'perigo' ? 'alert' : 'status'}>
      <Icone size={20} className="aviso__icone" aria-hidden="true" />
      <div className="aviso__textos">
        {titulo && <p className="aviso__titulo">{titulo}</p>}
        {children && <div className="aviso__texto">{children}</div>}
      </div>
      {onFechar && (
        <button type="button" className="aviso__fechar" onClick={onFechar} aria-label="Fechar aviso">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
