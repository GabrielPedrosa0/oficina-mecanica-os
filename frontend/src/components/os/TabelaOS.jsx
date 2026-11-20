import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Placa from '../ui/Placa'
import SeloStatus from '../ui/SeloStatus'
import Etiqueta from '../ui/Etiqueta'
import { formatarMoedaCurta, formatarPrevisao, primeiroNome } from '../../utils/formatadores'
import { resumoServico } from '../../utils/ordemServico'
import { LISTA_STATUS } from '../../constants/statusOS'
import './os.css'

const ORDEM_STATUS = Object.fromEntries(LISTA_STATUS.map((s, i) => [s.valor, i]))

const COLUNAS = [
  { chave: 'id', rotulo: 'OS', valor: (o) => o.id },
  { chave: 'veiculo', rotulo: 'Veículo', valor: (o) => o.veiculo ?? '' },
  { chave: 'cliente_nome', rotulo: 'Cliente', valor: (o) => o.cliente_nome ?? '' },
  { chave: 'servico', rotulo: 'Serviço', valor: (o) => resumoServico(o) },
  { chave: 'mecanico', rotulo: 'Mecânico', valor: (o) => o.mecanico ?? '' },
  { chave: 'status', rotulo: 'Status', valor: (o) => ORDEM_STATUS[o.status] ?? 99 },
  // Sem previsão vai para o fim (especificação 3.3).
  {
    chave: 'data_previsao',
    rotulo: 'Previsão',
    valor: (o) => (o.data_previsao ? new Date(o.data_previsao).getTime() : Infinity),
  },
  { chave: 'valor_total', rotulo: 'Valor', valor: (o) => Number(o.valor_total ?? 0), direita: true },
]

function comparar(a, b) {
  if (typeof a === 'string') return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
  return a - b
}

export default function TabelaOS({ ordens = [], ordenavel = true, onClicar }) {
  const navigate = useNavigate()
  const [ordem, setOrdem] = useState({ chave: null, crescente: true })

  const linhas = useMemo(() => {
    if (!ordem.chave) return ordens
    const coluna = COLUNAS.find((c) => c.chave === ordem.chave)
    const copia = [...ordens].sort((a, b) => comparar(coluna.valor(a), coluna.valor(b)))
    return ordem.crescente ? copia : copia.reverse()
  }, [ordens, ordem])

  function ordenarPor(chave) {
    setOrdem((atual) => (atual.chave === chave ? { chave, crescente: !atual.crescente } : { chave, crescente: true }))
  }

  const abrir = (os) => (onClicar ? onClicar(os) : navigate(`/ordens/${os.id}`))

  return (
    <div className="tabela-os__rolagem">
      <table className="tabela-os">
        <thead>
          <tr>
            {COLUNAS.map((c) => {
              const ativa = ordem.chave === c.chave
              const Seta = ordem.crescente ? ArrowUp : ArrowDown
              return (
                <th
                  key={c.chave}
                  scope="col"
                  className={c.direita ? 'tabela-os__direita' : ''}
                  aria-sort={ativa ? (ordem.crescente ? 'ascending' : 'descending') : undefined}
                >
                  {ordenavel ? (
                    <button type="button" className="tabela-os__ordenar" onClick={() => ordenarPor(c.chave)}>
                      {c.rotulo}
                      {ativa && <Seta size={14} aria-hidden="true" />}
                    </button>
                  ) : (
                    c.rotulo
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {linhas.map((os) => (
            <tr
              key={os.id}
              tabIndex={0}
              onClick={() => abrir(os)}
              onKeyDown={(e) => e.key === 'Enter' && abrir(os)}
              aria-label={`Abrir OS ${os.id}`}
            >
              <td className="tabela-os__numero">{os.id}</td>
              <td>
                <span className="tabela-os__veiculo">{os.veiculo}</span>
                <Placa placa={os.placa} tamanho="texto" />
              </td>
              <td>{os.cliente_nome ?? '—'}</td>
              <td className="tabela-os__servico">
                {resumoServico(os)}
                {os.garantia && <Etiqueta className="tabela-os__etiqueta">Garantia</Etiqueta>}
              </td>
              <td className={os.mecanico ? '' : 'texto-apoio'}>
                {os.mecanico ? primeiroNome(os.mecanico) : 'A definir'}
              </td>
              <td>
                <SeloStatus status={os.status} />
              </td>
              <td className="tabela-os__previsao">{formatarPrevisao(os.data_previsao, { separador: ' ' })}</td>
              <td className="tabela-os__direita">{formatarMoedaCurta(os.valor_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
