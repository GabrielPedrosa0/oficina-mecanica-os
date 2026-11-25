// Selo de status (Figma "Componentes > Selo de status"). Integrante 6.
// Status sempre com texto, nunca só cor.
//
//   <SeloStatus status="EM_SERVICO" />        -> "Em serviço" em azul
//   <Selo tom="sucesso">Garantia 90 dias</Selo>  (selo genérico, com o tom que quiser)
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
