import { rotuloApontamento } from '../../constants/apontamentos'
import { formatarMomento } from '../../utils/formatadores'
import './os.css'

export default function Apontamentos({
  apontamentos = [],
  onRegistrar,
  titulo = 'Apontamentos',
  somenteLeitura = false,
}) {
  const ordenados = [...apontamentos].sort((a, b) => String(b.data).localeCompare(String(a.data)))
  return (
    <section className="apontamentos">
      <header className="itens-os__cabecalho">
        <h3 className="itens-os__titulo">{titulo}</h3>
        {onRegistrar && !somenteLeitura && (
          <button type="button" className="itens-os__adicionar" onClick={onRegistrar}>
            + Registrar <span className="so-pc">apontamento</span>
          </button>
        )}
      </header>
      {ordenados.length === 0 ? (
        <p className="itens-os__vazio">Nenhum apontamento ainda.</p>
      ) : (
        <ol className="apontamentos__lista">
          {ordenados.map((a) => (
            <li key={a.id ?? `${a.tipo}-${a.data}`} className="apontamento">
              <span className="apontamento__marcador" aria-hidden="true">
                <span className="apontamento__ponto" />
                <span className="apontamento__linha" />
              </span>
              <div className="apontamento__textos">
                <p className="apontamento__topo">
                  <span className="apontamento__tipo">{rotuloApontamento(a.tipo)}</span>
                  <span className="apontamento__data">{formatarMomento(a.data)}</span>
                  {a.usuario && <span className="apontamento__data">· {a.usuario}</span>}
                </p>
                <p className="apontamento__descricao">{a.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
