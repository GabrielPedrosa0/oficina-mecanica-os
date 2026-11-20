import './ui.css'

export default function Etiqueta({ tom = 'destaque', children, className = '' }) {
  return <span className={`etiqueta etiqueta--${tom} ${className}`}>{children}</span>
}
