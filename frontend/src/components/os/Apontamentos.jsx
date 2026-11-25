// Apontamentos da OS: a linha do tempo do que aconteceu com o carro (Figma "Apontamento"). Integrante 3.
// Do mais novo (em cima) para o mais antigo. Cada um: tipo, data/hora e descrição.
//
//   <Apontamentos apontamentos={lista} onRegistrar={() => setModal(true)} />
//   apontamento = { id, tipo: 'DIAGNOSTICO', data: '2026-11-18T08:40:00', descricao, usuario? }
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
