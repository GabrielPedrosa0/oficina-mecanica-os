// Placa do veículo em fonte mono, com borda (Figma "Placa e avatar"). Integrante 6.
//   <Placa placa="QRS4F21" />            <Placa placa="qrs-4f21" tamanho="pequena" />
import { formatarPlaca } from '../../utils/formatadores'
import './ui.css'

export default function Placa({ placa, tamanho = 'normal', className = '' }) {
  return (
    <span className={`placa placa--${tamanho} ${className}`} aria-label={`Placa ${formatarPlaca(placa)}`}>
      {formatarPlaca(placa) || '———'}
    </span>
  )
}
