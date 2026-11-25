// Campo de busca com lupa e botão de limpar (barra superior do PC e listas do celular). Integrante 6.
// A busca começa a partir de 2 caracteres (especificação 2.4); combine com useDebounce.
//
//   const [texto, setTexto] = useState('')
//   <BarraBusca valor={texto} onChange={setTexto} placeholder="Placa, cliente ou OS" />
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
