import { Search, X } from 'lucide-react'
import './ui.css'

export default function BarraBusca({
  valor,
  onChange,
  onEnviar,
  placeholder = 'Buscar placa, cliente ou OS',
  rotulo = 'Buscar',
  className = '',
}) {
  return (
    <form
      role="search"
      className={`barra-busca ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        onEnviar?.(valor)
      }}
    >
      <Search size={20} className="barra-busca__lupa" aria-hidden="true" />
      <input
        type="search"
        className="barra-busca__campo"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={rotulo}
      />
      {valor && (
        <button type="button" className="barra-busca__limpar" onClick={() => onChange('')} aria-label="Limpar busca">
          <X size={16} />
        </button>
      )}
    </form>
  )
}
