// Etiqueta pequena ao lado de um texto (Figma "Modelo conceitual > Etiqueta"). Integrante 6.
// Diferente do selo de status: é menor, retangular e marca uma característica, não uma etapa.
//
//   <Etiqueta>Garantia</Etiqueta>                     (destaque: laranja-claro)
//   <Etiqueta tom="atencao">Estoque baixo</Etiqueta>  (atenção: âmbar)
import './ui.css'

export default function Etiqueta({ tom = 'destaque', children, className = '' }) {
  return <span className={`etiqueta etiqueta--${tom} ${className}`}>{children}</span>
}
