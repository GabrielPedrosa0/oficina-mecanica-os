import { useId, useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import './ui.css'

export default function Campo({
  rotulo,
  tipo = 'text', // text | email | number | tel | date | datetime-local | senha | textarea | select ...
  erro,
  ajuda,
  opcional = false,
  icone: Icone,
  id,
  className = '',
  children,
  ...resto
}) {
  const idGerado = useId()
  const idCampo = id ?? idGerado
  const idAjuda = `${idCampo}-ajuda`
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const descricao = erro || ajuda ? idAjuda : undefined
  const propsComuns = {
    id: idCampo,
    className: 'campo__controle',
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': descricao,
    ...resto,
  }

  let controle
  if (tipo === 'textarea') {
    controle = <textarea rows={4} {...propsComuns} />
  } else if (tipo === 'select') {
    controle = (
      <>
        <select {...propsComuns}>{children}</select>
        <ChevronDown size={20} className="campo__seta" aria-hidden="true" />
      </>
    )
  } else if (tipo === 'senha') {
    controle = (
      <>
        <input type={mostrarSenha ? 'text' : 'password'} {...propsComuns} />
        <button
          type="button"
          className="campo__olho"
          onClick={() => setMostrarSenha((v) => !v)}
          aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
        >
          {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </>
    )
  } else {
    controle = <input type={tipo} {...propsComuns} />
  }

  const tamanhoAtual = typeof resto.value === 'string' ? resto.value.length : 0

  return (
    <div
      className={[
        'campo',
        erro && 'campo--erro',
        resto.disabled && 'campo--desabilitado',
        Icone && 'campo--com-icone',
        (tipo === 'senha' || tipo === 'select') && 'campo--com-acao',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {rotulo && (
        <label htmlFor={idCampo} className="campo__rotulo">
          {rotulo}
          {opcional && <span className="campo__opcional"> (opcional)</span>}
        </label>
      )}
      <div className="campo__caixa">
        {Icone && <Icone size={20} className="campo__icone" aria-hidden="true" />}
        {controle}
      </div>
      {(erro || ajuda || (tipo === 'textarea' && resto.maxLength)) && (
        <div className="campo__rodape">
          {(erro || ajuda) && (
            <p id={idAjuda} className={erro ? 'campo__erro' : 'campo__ajuda'} role={erro ? 'alert' : undefined}>
              {erro || ajuda}
            </p>
          )}
          {tipo === 'textarea' && resto.maxLength && (
            <span className="campo__contador">
              {tamanhoAtual}/{resto.maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
