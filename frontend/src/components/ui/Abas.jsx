import { Link } from 'react-router-dom'
import './ui.css'

export default function Abas({ opcoes, valor, onChange, rotulo = 'Visões' }) {
  return (
    <div className="abas" role="tablist" aria-label={rotulo}>
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor
        const props = {
          role: 'tab',
          'aria-selected': ativa,
          className: `abas__aba ${ativa ? 'abas__aba--ativa' : ''}`,
        }
        return opcao.para ? (
          <Link key={opcao.valor} {...props} to={opcao.para} replace>
            {opcao.rotulo}
          </Link>
        ) : (
          <button key={opcao.valor} {...props} type="button" onClick={() => onChange?.(opcao.valor)}>
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
