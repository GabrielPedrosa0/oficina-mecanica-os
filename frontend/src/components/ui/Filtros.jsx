// Filtros em pílulas, um ativo por vez (Figma "Filtro, item e dados"). Integrante 6.
// No celular rolam na horizontal.
//
//   <Filtros opcoes={FILTROS_OS} valor={status} onChange={setStatus} rotulo="Filtrar por status" />
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
