// Avatar redondo com as iniciais (Figma "Placa e avatar"). Integrante 6.
//   <Avatar nome="Marina Souza" />  ->  MS        <Avatar nome="Usuário" tamanho={40} />
import { iniciais } from '../../utils/formatadores'
import './ui.css'

export default function Avatar({ nome, tamanho = 32, className = '' }) {
  return (
    <span
      className={`avatar ${className}`}
      style={{ width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.36) }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  )
}
