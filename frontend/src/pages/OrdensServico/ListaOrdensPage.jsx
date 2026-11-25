// Ordens de serviço (Figma "PC — Ordens de serviço" e "Celular — Ordens de serviço"). Integrante 2.
// O filtro fica na URL (/ordens?status=PRONTA), assim o Painel abre a lista já filtrada.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Plus } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Filtros from '../../components/ui/Filtros'
import CartaoOS from '../../components/os/CartaoOS'
import TabelaOS from '../../components/os/TabelaOS'
import { FILTRO_GARANTIA, FILTROS_OS_CELULAR, FILTROS_OS_PC, statusEncerrado } from '../../constants/statusOS'
import { useAcao, useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { pesquisar } from '../../services/buscaService'
import { exportarOrdensCSV, listarOrdens } from '../../services/ordensServicoService'
import './ordens.css'

const TRINTA_DIAS = 30 * 86_400_000

// Previsão mais próxima primeiro; sem previsão depois, da mais nova para a mais antiga.
// Entregues e canceladas vão para o fim da lista.
function ordenar(lista) {
  const encerrada = (o) => (statusEncerrado(o.status) ? 1 : 0)
  return [...lista].sort((a, b) => {
    if (encerrada(a) !== encerrada(b)) return encerrada(a) - encerrada(b)
    if (a.data_previsao && b.data_previsao) return a.data_previsao.localeCompare(b.data_previsao)
    if (a.data_previsao) return -1
    if (b.data_previsao) return 1
    return b.id - a.id
  })
}

// "Todas" esconde as entregues há mais de 30 dias e as canceladas.
function filtrarTodas(lista) {
  const limite = Date.now() - TRINTA_DIAS
  return lista.filter(
    (o) =>
      o.status !== 'CANCELADA' && !(o.status === 'ENTREGUE' && new Date(o.data_conclusao ?? o.data_abertura) < limite),
  )
}

export default function ListaOrdensPage() {
  const [parametros, setParametros] = useSearchParams()
  const filtro = parametros.get('status') ?? ''
  const garantia = filtro === FILTRO_GARANTIA.valor
  const status = garantia ? '' : filtro
  const [texto, setTexto] = useState(parametros.get('busca') ?? '')
  const busca = useDebounce(texto.trim(), 300)
  const termo = busca.length >= 2 ? busca : '' // busca a partir de 2 caracteres

  const { dados, carregando, erro, recarregar } = useApi(async () => {
    // Com busca: a pesquisa geral acha por placa, cliente ou nº da OS; os filtros são aplicados aqui.
    let lista = termo ? (await pesquisar(termo)).ordens : await listarOrdens({ status, garantia })
    if (termo && status) lista = lista.filter((o) => o.status === status)
    if (termo && garantia) lista = lista.filter((o) => o.eh_garantia)
    if (!status && !garantia && !termo) lista = filtrarTodas(lista)
    return ordenar(lista)
  }, [status, garantia, termo])

  const exportar = useAcao(exportarOrdensCSV)

  function mudarFiltro(novo) {
    const p = new URLSearchParams(parametros)
    if (novo) p.set('status', novo)
    else p.delete('status')
    setParametros(p, { replace: true })
  }

  function limparFiltros() {
    setTexto('')
    setParametros({}, { replace: true })
  }

  let lista
  if (carregando) lista = <EstadoCarregando texto="Carregando ordens..." />
  else if (erro) lista = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0)
    lista = (
      <EstadoVazio
        titulo="Nenhuma OS encontrada"
        texto={filtro || termo ? 'Tente outro filtro ou outra busca.' : 'As ordens abertas aparecem aqui.'}
        acao={
          filtro || termo ? (
            <Botao variante="secundario" onClick={limparFiltros}>
              Limpar filtros
            </Botao>
          ) : (
            <Botao para="/ordens/nova" icone={Plus}>
              Nova ordem
            </Botao>
          )
        }
      />
    )
  else
    lista = (
      <>
        <div className="lista-cartoes-os so-celular">
          {dados.map((os) => (
            <CartaoOS key={os.id} ordem={os} />
          ))}
        </div>
        <div className="so-pc">
          <TabelaOS ordens={dados} />
        </div>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Ordens de serviço"
        tituloCelular="Ordens"
        acoes={
          <>
            <Botao
              variante="secundario"
              icone={Download}
              carregando={exportar.executando}
              onClick={() => exportar.executar({ status, garantia, placa: termo })}
            >
              Exportar
            </Botao>
            <Botao para="/ordens/nova" icone={Plus}>
              Nova ordem
            </Botao>
          </>
        }
      />
      <div className="pagina">
        <div className="ordens__barra">
          <div className="ordens__busca">
            <BarraBusca valor={texto} onChange={setTexto} placeholder="Placa, cliente ou nº da OS" />
          </div>
          <div className="so-pc">
            <Filtros opcoes={FILTROS_OS_PC} valor={filtro} onChange={mudarFiltro} rotulo="Filtrar por status" />
          </div>
          <div className="so-celular">
            <Filtros opcoes={FILTROS_OS_CELULAR} valor={filtro} onChange={mudarFiltro} rotulo="Filtrar por status" />
          </div>
        </div>
        {exportar.erro && (
          <Aviso tom="perigo" titulo="Não foi possível exportar" onFechar={exportar.limparErro}>
            {exportar.erro.message}
          </Aviso>
        )}
        {lista}
      </div>
      <RodapeAcoes soCelular>
        <Botao para="/ordens/nova" icone={Plus} larguraTotal>
          Nova ordem
        </Botao>
      </RodapeAcoes>
    </>
  )
}
