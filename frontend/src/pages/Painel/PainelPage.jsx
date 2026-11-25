// Painel (PC) e Início (celular). Integrante 4.
// ESTA TELA É O MODELO DE REFERÊNCIA do grupo: mostra o caminho completo
// service -> useApi -> estados (carregando / erro / vazio) -> componentes.
// Especificação 3.2 e regras dos indicadores na 7.1.
import { Link } from 'react-router-dom'
import { CircleCheck, Plus, Banknote, PackageSearch, Wrench, CalendarCheck, CalendarDays, HardHat } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import Botao from '../../components/ui/Botao'
import Indicador from '../../components/ui/Indicador'
import Cartao from '../../components/ui/Cartao'
import ItemLista from '../../components/ui/ItemLista'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import CartaoOS from '../../components/os/CartaoOS'
import TabelaOS from '../../components/os/TabelaOS'
import { useApi } from '../../hooks/useApi'
import { listarEntregasHoje, listarOrdensRecentes, obterResumo } from '../../services/dashboardService'
import { listarMecanicos } from '../../services/mecanicosService'
import { formatarExpediente, formatarMoedaCurta, plural } from '../../utils/formatadores'
import './painel.css'

function Indicadores() {
  const { dados: r, carregando, erro, recarregar } = useApi(obterResumo)

  if (erro)
    return (
      <EstadoErro
        titulo="Não foi possível carregar os indicadores"
        mensagem={erro.message}
        onTentarDeNovo={recarregar}
      />
    )

  return (
    <div className="grade-indicadores">
      <Indicador
        titulo="Em serviço"
        icone={Wrench}
        carregando={carregando}
        valor={r?.em_servico}
        apoio={r && `${r.em_servico_previsao_hoje} com entrega hoje`}
        para="/ordens?status=EM_SERVICO"
      />
      <Indicador
        titulo="Aguardando peça"
        icone={PackageSearch}
        carregando={carregando}
        valor={r?.aguardando_peca}
        apoio={
          r && (r.aguardando_peca_atrasadas > 0 ? plural(r.aguardando_peca_atrasadas, 'atrasada') : 'Nenhuma atrasada')
        }
        tom={r?.aguardando_peca_atrasadas > 0 ? 'perigo' : undefined}
        para="/ordens?status=AGUARDANDO_PECA"
      />
      <Indicador
        titulo="Prontas"
        icone={CircleCheck}
        carregando={carregando}
        valor={r?.prontas}
        apoio="Avisar o cliente"
        para="/ordens?status=PRONTA"
      />
      {/* faturamento_mes vem null para quem não é Gerente: aí o cartão some. */}
      {(carregando || r?.faturamento_mes != null) && (
        <Indicador
          titulo="Faturado no mês"
          icone={Banknote}
          carregando={carregando}
          valor={formatarMoedaCurta(r?.faturamento_mes)}
          apoio="Até hoje"
        />
      )}
    </div>
  )
}

// Título da seção com o link "Ver todas" / "Ver equipe" à direita (Figma).
function CabecalhoSecao({ titulo, link, rotuloLink }) {
  return (
    <div className="cabecalho-secao">
      <h2 className="titulo-secao">{titulo}</h2>
      {link && (
        <Link to={link} className="link-secao">
          {rotuloLink}
        </Link>
      )}
    </div>
  )
}

// PC: tabela com as 10 OS abertas mais recentes.
function OrdensRecentes() {
  const { dados, carregando, erro, recarregar } = useApi(() => listarOrdensRecentes({ limite: 10 }))

  let conteudo
  if (carregando) conteudo = <EstadoCarregando texto="Carregando ordens..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.itens.length === 0)
    conteudo = (
      <EstadoVazio
        titulo="Nenhuma OS aberta"
        texto="As ordens abertas aparecem aqui, da mais nova para a mais antiga."
        acao={
          <Botao para="/ordens/nova" icone={Plus}>
            Nova ordem
          </Botao>
        }
      />
    )
  else conteudo = <TabelaOS ordens={dados.itens} ordenavel={false} />

  return (
    <section className="secao so-pc">
      <CabecalhoSecao titulo="Ordens recentes" link="/ordens" rotuloLink="Ver todas" />
      {conteudo}
    </section>
  )
}

// Celular: cartões das OS com previsão para hoje, 20 por vez.
function EntregasHoje() {
  const { dados, setDados, carregando, erro, recarregar } = useApi(() => listarEntregasHoje({ limite: 20 }))

  async function carregarMais() {
    const proxima = await listarEntregasHoje({ limite: 20, offset: dados.itens.length })
    setDados({ ...proxima, itens: [...dados.itens, ...proxima.itens] })
  }

  let conteudo
  if (carregando) conteudo = <EstadoCarregando />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.itens.length === 0)
    conteudo = (
      <EstadoVazio icone={CalendarCheck} titulo={dados.mensagem_vazia ?? 'Nenhuma entrega prevista para hoje.'} />
    )
  else
    conteudo = (
      <div className="lista-cartoes-os">
        {dados.itens.map((os) => (
          <CartaoOS key={os.id} ordem={os} />
        ))}
        {dados.tem_mais && (
          <Botao variante="secundario" onClick={carregarMais}>
            Carregar mais
          </Botao>
        )}
      </div>
    )

  return (
    <section className="secao so-celular">
      <CabecalhoSecao titulo="Entregas de hoje" link="/ordens" rotuloLink="Ver todas" />
      {conteudo}
    </section>
  )
}

// PC e celular: quem está no horário agora (Figma "Mecânicos em expediente").
// Rota proposta GET /api/mecanicos?em_expediente=true (ver services/mecanicosService.js).
function MecanicosEmExpediente() {
  const { dados, carregando, erro, recarregar } = useApi(() => listarMecanicos({ emExpediente: true }))

  let conteudo
  if (carregando) conteudo = <EstadoCarregando texto="Carregando equipe..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0) conteudo = <EstadoVazio icone={HardHat} titulo="Ninguém em expediente agora." />
  else
    conteudo = (
      <Cartao semEspaco>
        {dados.map((m) => (
          <ItemLista
            key={m.id}
            avatar={m.nome}
            titulo={m.nome}
            subtitulo={`${formatarExpediente(m.expediente_inicio, m.expediente_fim)} · ${
              m.os_em_servico > 0 ? `${plural(m.os_em_servico, 'OS', 'OS')} em serviço` : 'sem OS no momento'
            }`}
          />
        ))}
      </Cartao>
    )

  return (
    <section className="secao">
      <CabecalhoSecao titulo="Mecânicos em expediente" link="/mecanicos" rotuloLink="Ver equipe" />
      {conteudo}
    </section>
  )
}

export default function PainelPage() {
  return (
    <>
      <CabecalhoPagina
        titulo="Painel"
        tituloCelular="Início"
        acoes={
          <>
            <Botao variante="secundario" para="/agenda" icone={CalendarDays}>
              Agenda
            </Botao>
            <Botao para="/ordens/nova" icone={Plus}>
              Nova ordem
            </Botao>
          </>
        }
      />
      <div className="pagina painel">
        <Indicadores />
        <div className="painel__colunas">
          <OrdensRecentes />
          <EntregasHoje />
          <MecanicosEmExpediente />
        </div>
      </div>
    </>
  )
}
