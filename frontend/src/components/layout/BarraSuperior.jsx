// Barra do topo com a busca geral (issue #47, especificação 3.7).
// Digita 2+ letras -> espera 300 ms -> GET /api/busca -> resultados agrupados abaixo do campo.
// Enter abre o primeiro resultado (ou a OS, se for só número). Esc fecha.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CarFront, ClipboardList, User } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { pesquisar } from '../../services/buscaService'
import { formatarNumeroOS } from '../../utils/formatadores'
import BarraBusca from '../ui/BarraBusca'
import Botao from '../ui/Botao'
import ItemLista from '../ui/ItemLista'
import './layout.css'
import './busca-topo.css'

const MAXIMO_POR_GRUPO = 5

// Transforma a resposta do backend numa lista de grupos, cada um com itens { chave, titulo, subtitulo, para }.
function montarGrupos(resultado) {
  if (!resultado) return []
  const grupos = [
    {
      nome: 'Ordens',
      icone: ClipboardList,
      itens: (resultado.ordens ?? []).map((o) => ({
        chave: `os-${o.id}`,
        titulo: `${formatarNumeroOS(o.id)} · ${o.placa ?? ''}`,
        subtitulo: o.cliente_nome,
        para: `/ordens/${o.id}`,
      })),
    },
    {
      nome: 'Veículos',
      icone: CarFront,
      itens: (resultado.veiculos ?? []).map((v) => ({
        chave: `veiculo-${v.id}`,
        titulo: v.placa,
        subtitulo: `${v.marca} ${v.modelo}`,
        para: `/veiculos/${v.id}`,
      })),
    },
    {
      nome: 'Clientes',
      icone: User,
      itens: (resultado.clientes ?? []).map((c) => ({
        chave: `cliente-${c.id}`,
        titulo: c.nome,
        subtitulo: c.telefone,
        para: `/clientes/${c.id}`,
      })),
    },
  ]
  return grupos
    .map((g) => ({ ...g, itens: g.itens.slice(0, MAXIMO_POR_GRUPO) }))
    .filter((g) => g.itens.length > 0)
}

export default function BarraSuperior({ onBuscar, direita }) {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const [aberto, setAberto] = useState(false)
  const termo = useDebounce(texto.trim(), 300)
  const buscar = termo.length >= 2

  const { dados, carregando, erro } = useApi(() => pesquisar(termo), [termo], { ativo: buscar })
  const grupos = montarGrupos(dados)
  const primeiro = grupos[0]?.itens[0]

  function mudarTexto(novo) {
    setTexto(novo)
    setAberto(true)
  }

  function abrir(destino) {
    setAberto(false)
    setTexto('')
    navigate(destino)
  }

  function aoEnviar(valor) {
    const digitado = valor.trim()
    if (digitado.length < 2) return
    if (/^\d+$/.test(digitado)) return abrir(`/ordens/${digitado}`) // número exato abre a OS
    if (primeiro && digitado === termo) return abrir(primeiro.para)
    setAberto(false)
    onBuscar?.(digitado) // sem resultado pronto: cai na lista de OS filtrada
  }

  // Fecha ao apertar Esc ou ao sair do campo e dos resultados (clique fora ou Tab).
  function aoSairDoFoco(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setAberto(false)
  }

  let painel = null
  if (aberto && buscar) {
    if (carregando || termo !== texto.trim()) painel = <p className="busca-topo__aviso">Buscando...</p>
    else if (erro) painel = <p className="busca-topo__aviso busca-topo__aviso--erro">{erro.message}</p>
    else if (grupos.length === 0) painel = <p className="busca-topo__aviso">Nada encontrado para “{termo}”.</p>
    else
      painel = grupos.map((g) => (
        <section key={g.nome} className="busca-topo__grupo" aria-label={g.nome}>
          <h2 className="busca-topo__titulo">{g.nome}</h2>
          {g.itens.map((item) => (
            <ItemLista
              key={item.chave}
              icone={g.icone}
              titulo={item.titulo}
              subtitulo={item.subtitulo}
              onClick={() => abrir(item.para)}
            />
          ))}
        </section>
      ))
  }

  return (
    <header className="barra-superior">
      <div
        className="busca-topo"
        onBlur={aoSairDoFoco}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => e.key === 'Escape' && setAberto(false)}
      >
        <BarraBusca
          valor={texto}
          onChange={mudarTexto}
          onEnviar={aoEnviar}
          placeholder="Buscar placa, cliente ou OS"
        />
        {painel && <div className="busca-topo__painel">{painel}</div>}
      </div>
      <div className="barra-superior__direita">
        {direita}
        {/* Sino: reservado para notificações; sem função nesta versão (especificação 3.2). */}
        <Botao variante="fantasma" icone={Bell} aria-label="Notificações" />
      </div>
    </header>
  )
}
