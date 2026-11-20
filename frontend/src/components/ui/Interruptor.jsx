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
