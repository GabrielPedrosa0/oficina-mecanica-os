// Tabela genérica do PC (Figma: Veículos, Mecânicos, Serviços, Peças, Usuários). Integrante 6.
// Para ordens de serviço use a TabelaOS, que já sabe as colunas da OS.
//
//   const colunas = [
//     { chave: 'placa', rotulo: 'Placa', render: (v) => <Placa placa={v.placa} /> },
//     { chave: 'modelo', rotulo: 'Modelo' },
//     { chave: 'quilometragem', rotulo: 'Km atual', render: (v) => formatarKm(v.quilometragem), direita: true },
//   ]
//   <Tabela colunas={colunas} linhas={veiculos} onClicarLinha={(v) => navigate(`/veiculos/${v.id}`)} />
//
// Coluna: chave (campo do objeto), rotulo, render(linha) opcional, direita (alinha à direita),
// ordenavel (padrão: true) e valorOrdem(linha) para ordenar por outro valor.
import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import './ui.css'

function comparar(a, b) {
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt-BR', { sensitivity: 'base', numeric: true })
}

export default function Tabela({ colunas, linhas = [], onClicarLinha, chave = 'id', rotulo }) {
  const [ordem, setOrdem] = useState({ chave: null, crescente: true })

  const ordenadas = useMemo(() => {
    const coluna = colunas.find((c) => c.chave === ordem.chave)
    if (!coluna) return linhas
    const valor = coluna.valorOrdem ?? ((l) => l[coluna.chave])
    const copia = [...linhas].sort((a, b) => comparar(valor(a), valor(b)))
    return ordem.crescente ? copia : copia.reverse()
  }, [linhas, colunas, ordem])

  const ordenarPor = (c) =>
    setOrdem((atual) => (atual.chave === c ? { chave: c, crescente: !atual.crescente } : { chave: c, crescente: true }))

  return (
    <div className="tabela__rolagem">
      <table className="tabela" aria-label={rotulo}>
        <thead>
          <tr>
            {colunas.map((c) => {
              const ativa = ordem.chave === c.chave
              const Seta = ordem.crescente ? ArrowUp : ArrowDown
              return (
                <th
                  key={c.chave}
                  scope="col"
                  className={c.direita ? 'tabela__direita' : ''}
                  aria-sort={ativa ? (ordem.crescente ? 'ascending' : 'descending') : undefined}
                >
                  {c.ordenavel === false ? (
                    c.rotulo
                  ) : (
                    <button type="button" className="tabela__ordenar" onClick={() => ordenarPor(c.chave)}>
                      {c.rotulo}
                      {ativa && <Seta size={14} aria-hidden="true" />}
                    </button>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((linha) => (
            <tr
              key={linha[chave]}
              className={onClicarLinha ? 'tabela__linha--clicavel' : ''}
              tabIndex={onClicarLinha ? 0 : undefined}
              onClick={onClicarLinha ? () => onClicarLinha(linha) : undefined}
              onKeyDown={onClicarLinha ? (e) => e.key === 'Enter' && onClicarLinha(linha) : undefined}
            >
              {colunas.map((c) => (
                <td key={c.chave} className={c.direita ? 'tabela__direita' : ''}>
                  {c.render ? c.render(linha) : (linha[c.chave] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
