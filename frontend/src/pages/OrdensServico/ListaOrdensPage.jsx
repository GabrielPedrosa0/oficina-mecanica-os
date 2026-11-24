// Tela "Ordens de serviço" (issue #43, especificação 3.3).
// PC: tabela + filtros (com Garantia). Celular: cartões + busca + filtros menores.
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { FILTROS_OS_CELULAR, FILTROS_OS_PC, statusEncerrado } from '../../constants/statusOS'
import { useAcao, useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { pesquisar } from '../../services/buscaService'
import { listarMecanicos } from '../../services/mecanicosService'
import { exportarOrdensCSV, listarOrdens } from '../../services/ordensServicoService'

const TRINTA_DIAS = 30 * 86_400_000

// Previsão mais próxima primeiro; sem previsão por último. Entregues e canceladas vão para o fim.
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

// "Todas" esconde as canceladas e as entregues há mais de 30 dias.
function filtrarTodas(lista) {
  const limite = Date.now() - TRINTA_DIAS
  return lista.filter(
    (o) =>
      o.status !== 'CANCELADO' && !(o.status === 'ENTREGUE' && new Date(o.data_conclusao ?? o.data_abertura) < limite),
  )
}

export default function ListaOrdensPage() {
  const navigate = useNavigate()
  const [parametros, setParametros] = useSearchParams()
  const filtro = parametros.get('status') ?? '' // vem da URL: /ordens?status=PRONTA
  const ehGarantia = filtro === 'GARANTIA'
  const status = ehGarantia ? '' : filtro // Garantia não é status: o backend não conhece
  const [texto, setTexto] = useState(parametros.get('busca') ?? '')
  const busca = useDebounce(texto.trim(), 300)
  const termo = busca.length >= 2 ? busca : '' // busca a partir de 2 caracteres

  const { dados, carregando, erro, recarregar } = useApi(async () => {
    const recebidas = termo ? (await pesquisar(termo)).ordens : await listarOrdens({ status })
    // A OS traz só `mecanico_id`; o nome vem da lista de mecânicos. Se essa lista falhar,
    // a tela continua e o mecânico aparece como "A definir".
    const mecanicos = await listarMecanicos().catch(() => [])
    const nomes = Object.fromEntries(mecanicos.map((m) => [m.id, m.nome]))
    // O backend manda `eh_garantia`; os componentes (TabelaOS) leem `garantia`.
    const lista = recebidas.map((o) => ({
      ...o,
      mecanico: o.mecanico ?? nomes[o.mecanico_id] ?? null,
      garantia: o.eh_garantia ?? o.garantia,
    }))
    let filtrada
    if (ehGarantia) filtrada = lista.filter((o) => o.garantia)
    else if (status) filtrada = lista.filter((o) => o.status === status)
    else filtrada = filtrarTodas(lista)
    return ordenar(filtrada)
  }, [filtro, termo])

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
  if (carregando)
    lista = (
      <EstadoCarregando formato="tabela" formatoCelular="cartoes" linhas={5} colunas={5} texto="Carregando ordens..." />
    )
  else if (erro) lista = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0)
    lista = (
      <EstadoVazio
        titulo="Nenhuma OS encontrada"
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
            <CartaoOS key={os.id} ordem={os} para={`/ordens/${os.id}`} />
          ))}
        </div>
        <div className="so-pc">
          <TabelaOS ordens={dados} onClicar={(os) => navigate(`/ordens/${os.id}`)} />
        </div>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Ordens de serviço"
        acoes={
          <>
            <Botao
              variante="secundario"
              icone={Download}
              carregando={exportar.executando}
              onClick={() => exportar.executar({ status, placa: termo })}
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
        <div className="pilha">
          <div className="so-celular">
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
