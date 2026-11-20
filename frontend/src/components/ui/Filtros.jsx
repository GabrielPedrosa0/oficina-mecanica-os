import './ui.css'

export default function Filtros({ opcoes, valor, onChange, rotulo = 'Filtros' }) {
  return (
    <div className="filtros" role="group" aria-label={rotulo}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor
        return (
          <button
            key={opcao.valor || 'todas'}
            type="button"
            className={`filtro ${ativo ? 'filtro--ativo' : ''}`}
            aria-pressed={ativo}
            onClick={() => onChange(opcao.valor)}
          >
            {opcao.rotulo}
            {opcao.quantidade != null && <span className="filtro__qtd">{opcao.quantidade}</span>}
          </button>
        )
      })}
    </div>
  )
}
