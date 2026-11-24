// Painel (PC) / Início (celular): indicadores da oficina + OS do dia.
// PC: 4 indicadores + tabela "Ordens recentes". Celular: indicadores + cartões "Entregas de hoje".
// Tocar num indicador abre a lista de OS filtrada por aquele status.
import { useState } from 'react'
import { CircleCheck, Clock, PackageSearch, RefreshCw, Wallet, Wrench } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import CartaoOS from '../../components/os/CartaoOS'
import TabelaOS from '../../components/os/TabelaOS'
import Botao from '../../components/ui/Botao'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Indicador from '../../components/ui/Indicador'
import { useApi } from '../../hooks/useApi'
import { listarEntregasHoje, listarOrdensRecentes, obterResumo } from '../../services/dashboardService'
import { usuarioSalvo } from '../../services/authService'
import { formatarMesAno, formatarMoedaCurta, plural, primeiroNome } from '../../utils/formatadores'
import './painel.css'

function saudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function hojePorExtenso() {
  const texto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto[0].toUpperCase() + texto.slice(1)
}

function Indicadores({ resumo, carregando }) {
  const r = resumo ?? {}
  return (
    <div className="painel__indicadores">
      <Indicador
        titulo="Em serviço"
        icone={Wrench}
        valor={r.em_servico}
        apoio={r.em_servico_previsao_hoje ? `${plural(r.em_servico_previsao_hoje, 'previsão', 'previsões')} para hoje` : 'Nenhuma para hoje'}
        para="/ordens?status=EM_SERVICO"
        carregando={carregando}
      />
      <Indicador
        titulo="Aguardando peça"
        icone={PackageSearch}
        valor={r.aguardando_peca}
        apoio={r.aguardando_peca_atrasadas ? plural(r.aguardando_peca_atrasadas, 'atrasada') : 'Nenhuma atrasada'}
        tom={r.aguardando_peca_atrasadas ? 'perigo' : undefined}
        para="/ordens?status=AGUARDANDO_PECA"
        carregando={carregando}
      />
      <Indicador
        titulo="Prontas"
        icone={CircleCheck}
        valor={r.prontas}
        apoio={r.prontas ? 'Avisar o cliente' : 'Nenhuma esperando'}
        tom={r.prontas ? 'primario' : undefined}
        para="/ordens?status=PRONTA"
        carregando={carregando}
      />
      {/* Só o Gerente recebe o faturamento; para os demais o backend manda null. */}
      {(carregando || r.faturamento_mes != null) && (
        <Indicador
          titulo="Faturado no mês"
          icone={Wallet}
          valor={formatarMoedaCurta(r.faturamento_mes)}
          apoio={r.mes_referencia ? formatarMesAno(`${r.mes_referencia}-15T12:00:00`) : undefined}
          carregando={carregando}
        />
      )}
    </div>
  )
}

function OrdensRecentes() {
  const { dados, carregando, erro, recarregar } = useApi(() => listarOrdensRecentes(10), [])

  let conteudo
  if (carregando) conteudo = <EstadoCarregando texto="Carregando ordens..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.itens.length === 0)
    conteudo = <EstadoVazio titulo="Nenhuma ordem aberta" texto="As novas ordens de serviço aparecem aqui." />
  else conteudo = <TabelaOS ordens={dados.itens} ordenavel={false} />

  return (
    <Cartao
      titulo="Ordens recentes"
      semEspaco
      className="painel__recentes so-pc"
      acao={
        <Botao variante="sutil" tamanho="pequeno" para="/ordens">
          Ver todas
        </Botao>
      }
    >
      {conteudo}
    </Cartao>
  )
}

const POR_PAGINA = 20

function EntregasHoje() {
  const [offset, setOffset] = useState(0)
  const [anteriores, setAnteriores] = useState([])
  const { dados, carregando, erro, recarregar } = useApi(
    () => listarEntregasHoje({ limite: POR_PAGINA, offset }),
    [offset],
  )
  const itens = [...anteriores, ...(dados?.itens ?? [])]

  function carregarMais() {
    setAnteriores(itens)
    setOffset((o) => o + POR_PAGINA)
  }

  return (
    <section className="painel__entregas so-celular" aria-labelledby="titulo-entregas">
      <div className="painel__secao-topo">
        <h2 id="titulo-entregas" className="painel__secao-titulo">
          <Clock size={20} aria-hidden="true" /> Entregas de hoje
        </h2>
        {dados?.total > 0 && <span className="painel__contagem">{dados.total}</span>}
      </div>

      {itens.length > 0 && (
        <div className="painel__cartoes">
          {itens.map((os) => (
            <CartaoOS key={os.id} ordem={os} />
          ))}
        </div>
      )}

      {carregando && <EstadoCarregando texto="Carregando entregas..." />}
      {erro && <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />}
      {!carregando && !erro && itens.length === 0 && (
        <EstadoVazio titulo={dados?.mensagem_vazia ?? 'Nenhuma entrega prevista para hoje.'} />
      )}
      {!carregando && dados?.tem_mais && (
        <Botao variante="secundario" larguraTotal onClick={carregarMais}>
          Carregar mais
        </Botao>
      )}
    </section>
  )
}

export default function PainelPage() {
  const usuario = usuarioSalvo()
  const [versao, setVersao] = useState(0) // muda para recarregar tudo
  const { dados: resumo, carregando, erro, recarregar } = useApi(obterResumo, [versao])
  const atualizar = () => setVersao((v) => v + 1)

  return (
    <>
      <CabecalhoPagina
        titulo={`${saudacao()}${usuario?.nome ? `, ${primeiroNome(usuario.nome)}` : ''}`}
        tituloCelular="Início"
        subtitulo={hojePorExtenso()}
        acoes={
          <Botao variante="secundario" icone={RefreshCw} onClick={atualizar}>
            Atualizar
          </Botao>
        }
        acoesCelular={<Botao variante="fantasma" icone={RefreshCw} aria-label="Atualizar" onClick={atualizar} />}
      />
      <div className="pagina">
        {erro ? (
          <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
        ) : (
          <Indicadores resumo={resumo} carregando={carregando} />
        )}
        <OrdensRecentes key={`recentes-${versao}`} />
        <EntregasHoje key={`entregas-${versao}`} />
      </div>
    </>
  )
}
