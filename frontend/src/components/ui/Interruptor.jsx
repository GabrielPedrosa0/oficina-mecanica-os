// Interruptor liga/desliga com rótulo e ajuda (Figma "Modelo conceitual > Interruptor"). Integrante 6.
// Use para escolhas de sim/não que valem na hora, como "Serviço em garantia" na Nova OS.
//
//   const [garantia, setGarantia] = useState(false)
//   <Interruptor rotulo="Serviço em garantia" ajuda="Retorno de serviço já feito; não é cobrado"
//                ligado={garantia} onChange={setGarantia} />
import { useId } from 'react'
import './ui.css'

export default function Interruptor({ rotulo, ajuda, ligado = false, onChange, disabled = false }) {
  const id = useId()
  return (
    <div className={`interruptor ${disabled ? 'interruptor--desabilitado' : ''}`}>
      <div className="interruptor__textos">
        <label htmlFor={id} className="interruptor__rotulo">
          {rotulo}
        </label>
        {ajuda && (
          <span id={`${id}-ajuda`} className="interruptor__ajuda">
            {ajuda}
          </span>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        aria-describedby={ajuda ? `${id}-ajuda` : undefined}
        className={`interruptor__trilho ${ligado ? 'interruptor__trilho--ligado' : ''}`}
        disabled={disabled}
        onClick={() => onChange?.(!ligado)}
      >
        <span className="interruptor__botao" />
      </button>
    </div>
  )
}
