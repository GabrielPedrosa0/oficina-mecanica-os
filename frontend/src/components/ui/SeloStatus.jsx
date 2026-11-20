import { dadosStatus } from '../../constants/statusOS'
import './ui.css'

// tom: neutro | info | atencao | sucesso | perigo | entregue | primario
export function Selo({ tom = 'neutro', icone: Icone, children, className = '' }) {
  return (
    <span className={`selo selo--${tom} ${className}`}>
      {Icone && <Icone size={14} aria-hidden="true" />}
      {children}
    </span>
  )
}

export default function SeloStatus({ status, className }) {
  const { rotulo, tom } = dadosStatus(status)
  return (
    <Selo tom={tom} className={className}>
      {rotulo}
    </Selo>
  )
}
