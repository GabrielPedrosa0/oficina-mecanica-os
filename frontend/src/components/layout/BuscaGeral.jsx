// Busca do topo (PC): placa, cliente ou nº da OS. Integrante 2.
// A partir de 2 letras, espera 300 ms e chama GET /api/busca. Resultados agrupados
// (Ordens, Veículos, Clientes); ↑/↓ escolhe, Enter abre, Esc fecha. "1042" abre direto a OS 1042.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, ClipboardList, User } from 'lucide-react'
import BarraBusca from '../ui/BarraBusca'
import Placa from '../ui/Placa'
import SeloStatus from '../ui/SeloStatus'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { pesquisar } from '../../services/buscaService'
import { formatarNumeroOS } from '../../utils/formatadores'
import { resumoServico } from '../../utils/ordemServico'
import './layout.css'

const SO_NUMERO = /^(os)?\s*#?\s*(\d+)$/i

function montarResultados(dados) {
  if (!dados) return []
  return [
    ...dados.ordens.slice(0, 6).map((o) => ({
      grupo: 'Ordens',
      chave: `o${o.id}`,
      para: `/ordens/${o.id}`,
      icone: ClipboardList,
      titulo: `${formatarNumeroOS(o.id)} · ${o.veiculo}`,
      sub: [o.cliente_nome, resumoServico(o)].filter(Boolean).join(' · '),
      direita: <SeloStatus status={o.status} />,
    })),
    ...dados.veiculos.slice(0, 5).map((v) => ({
      grupo: 'Veículos',
      chave: `v${v.id}`,
      para: `/veiculos/${v.id}/editar`,
      icone: Car,
      titulo: `${v.marca} ${v.modelo}`,
      sub: v.cliente_nome ?? 'Sem cliente',
      direita: <Placa placa={v.placa} tamanho="pequena" />,
    })),
    ...dados.clientes.slice(0, 5).map((c) => ({
      grupo: 'Clientes',
      chave: `c${c.id}`,
      para: `/clientes/${c.id}`,
      icone: User,
      titulo: c.nome,
      sub: c.telefone,
    })),
  ]
}

export default function BuscaGeral() {
  const navigate = useNavigate()
  const caixa = useRef(null)
  const [texto, setTexto] = useState('')
  const [aberta, setAberta] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const termo = useDebounce(texto.trim(), 300)
  const buscar = termo.length >= 2

  const { dados, carregando, erro } = useApi(() => pesquisar(termo), [termo], { ativo: buscar })
  const resultados = buscar ? montarResultados(dados) : []

  // Fecha ao clicar fora.
  useEffect(() => {
    const fora = (e) => caixa.current && !caixa.current.contains(e.target) && setAberta(false)
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  function abrir(para) {
    setAberta(false)
    setTexto('')
    navigate(para)
  }

  function enviar() {
    const numero = texto.trim().match(SO_NUMERO)
    if (numero) return abrir(`/ordens/${numero[2]}`)
    if (resultados[ativo]) abrir(resultados[ativo].para)
  }

  function teclas(e) {
    if (e.key === 'Escape') setAberta(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAtivo((i) => Math.min(i + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtivo((i) => Math.max(i - 1, 0))
    }
  }

  let painel = null
  if (aberta && texto.trim().length >= 2) {
    if (carregando || termo !== texto.trim()) painel = <p className="busca-geral__estado">Buscando...</p>
    else if (erro) painel = <p className="busca-geral__estado">{erro.message}</p>
    else if (resultados.length === 0) painel = <p className="busca-geral__estado">Nada encontrado para “{termo}”.</p>
    else
      painel = resultados.map((r, i) => (
        <div key={r.chave}>
          {(i === 0 || resultados[i - 1].grupo !== r.grupo) && <p className="busca-geral__grupo">{r.grupo}</p>}
          <button
            type="button"
            role="option"
            aria-selected={i === ativo}
            className={`busca-geral__item ${i === ativo ? 'busca-geral__item--ativo' : ''}`}
            onMouseEnter={() => setAtivo(i)}
            onClick={() => abrir(r.para)}
          >
            <r.icone size={20} aria-hidden="true" className="texto-apoio" />
            <span className="busca-geral__textos">
              <span className="busca-geral__titulo">{r.titulo}</span>
              {r.sub && <span className="busca-geral__sub">{r.sub}</span>}
            </span>
            {r.direita}
          </button>
        </div>
      ))
  }

  return (
    <div className="busca-geral" ref={caixa} onKeyDown={teclas} onFocus={() => setAberta(true)}>
      <BarraBusca
        valor={texto}
        onChange={(v) => {
          setTexto(v)
          setAtivo(0)
          setAberta(true)
        }}
        onEnviar={enviar}
        placeholder="Buscar placa, cliente ou OS"
        rotulo="Buscar placa, cliente ou OS"
      />
      {painel && (
        <div className="busca-geral__painel" role="listbox" aria-label="Resultados da busca">
          {painel}
        </div>
      )}
    </div>
  )
}
