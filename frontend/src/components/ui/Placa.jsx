import { formatarPlaca } from '../../utils/formatadores'
import './ui.css'

export default function Placa({ placa, tamanho = 'normal', className = '' }) {
  return (
    <span className={`placa placa--${tamanho} ${className}`} aria-label={`Placa ${formatarPlaca(placa)}`}>
      {formatarPlaca(placa) || '———'}
    </span>
  )
}
