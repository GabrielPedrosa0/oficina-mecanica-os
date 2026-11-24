// Tela "Detalhe da OS" (issues #49 a #52, especificação 3.4).
// PC: serviços/peças e apontamentos à esquerda; ordem, veículo, cliente e relato à direita.
// Celular: uma coluna, na ordem do Figma (dados, serviços, peças, total, observações, apontamentos).
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import BlocoApontamentos from '../../components/os/BlocoApontamentos'
import BlocoItensOS from '../../components/os/BlocoItensOS'
import Botao from '../../components/ui/Botao'
import Cartao, { Dado, GradeDados } from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Placa from '../../components/ui/Placa'
import SeloStatus from '../../components/ui/SeloStatus'
import { statusEncerrado } from '../../constants/statusOS'
import { useAcoesOS } from '../../hooks/useAcoesOS'
import { useApi } from '../../hooks/useApi'
import { listarMecanicos } from '../../services/mecanicosService'
import { consultarOrdem } from '../../services/ordensServicoService'
import {
  encurtarChassi,
  formatarCpfCnpj,
  formatarDataHora,
  formatarExpediente,
  formatarKm,
  formatarNumeroOS,
  formatarTelefone,
  linkTelefone,
} from '../../utils/formatadores'
import './detalhe-os.css'

// A OS traz só `mecanico_id`; nome e expediente vêm da lista de mecânicos.
// Se essa lista falhar, a tela continua e o mecânico aparece como "A definir".
async function carregarOrdem(id) {
  const [ordem, mecanicos] = await Promise.all([consultarOrdem(id), listarMecanicos().catch(() => [])])
  const mecanico = mecanicos.find((m) => m.id === ordem.mecanico_id)
  return { ...ordem, mecanico: ordem.mecanico ?? mecanico?.nome ?? null, expediente: mecanico }
}

const textoMecanico = (os) =>
  os.mecanico
    ? os.expediente
      ? `${os.mecanico} · ${formatarExpediente(os.expediente.hora_inicio_expediente, os.expediente.hora_fim_expediente)}`
      : os.mecanico
    : 'A definir'

function CartaoOrdem({ os }) {
  return (
    <Cartao titulo="Ordem de serviço" className="detalhe-os__ordem">
      <GradeDados colunas={2}>
        <Dado rotulo="Abertura">{formatarDataHora(os.data_abertura)}</Dado>
        <Dado rotulo="Previsão">{formatarDataHora(os.data_previsao)}</Dado>
        <Dado rotulo="Conclusão">{formatarDataHora(os.data_conclusao)}</Dado>
        <Dado rotulo="Orçamento enviado">{os.orcamento_enviado_em ? formatarDataHora(os.orcamento_enviado_em) : null}</Dado>
        <Dado rotulo="Mecânico">{textoMecanico(os)}</Dado>
        <Dado rotulo="Garantia">{os.eh_garantia ? 'Sim' : 'Não'}</Dado>
      </GradeDados>
    </Cartao>
  )
}

function CartaoVeiculo({ os }) {
  // Chassi ainda não vem na OS: mostra "—" até o backend mandar.
  return (
    <Cartao titulo="Veículo" className="detalhe-os__veiculo">
      <GradeDados colunas={2}>
        <Dado rotulo="Modelo · ano">{os.veiculo || null}</Dado>
        <Dado rotulo="Chassi">
          <span className="so-pc">{os.chassi || '—'}</span>
          <span className="so-celular">{encurtarChassi(os.chassi)}</span>
        </Dado>
        <Dado rotulo="Km na entrada">{formatarKm(os.quilometragem)}</Dado>
      </GradeDados>
    </Cartao>
  )
}

function CartaoCliente({ os }) {
  return (
    <Cartao titulo="Cliente" className="detalhe-os__cliente">
      <GradeDados colunas={2}>
        <Dado rotulo="Nome">
          {os.cliente_id && os.cliente_nome ? <Link to={`/clientes/${os.cliente_id}`}>{os.cliente_nome}</Link> : os.cliente_nome}
        </Dado>
        <Dado rotulo="Telefone">
          {os.cliente_telefone ? (
            <a href={linkTelefone(os.cliente_telefone)}>{formatarTelefone(os.cliente_telefone)}</a>
          ) : null}
        </Dado>
        <Dado rotulo="CPF">{os.cliente_cpf ? formatarCpfCnpj(os.cliente_cpf) : null}</Dado>
      </GradeDados>
    </Cartao>
  )
}

function CartaoRelato({ os }) {
  return (
    <Cartao titulo="Problema relatado" className="detalhe-os__relato">
      <p className="detalhe-os__texto">{os.problema_relatado || '—'}</p>
      <GradeDados colunas={1}>
        <Dado rotulo="Observações">{os.observacoes ? <span className="detalhe-os__texto">{os.observacoes}</span> : null}</Dado>
      </GradeDados>
    </Cartao>
  )
}

export default function DetalheOrdemPage() {
  const { id } = useParams()
  const ordem = useApi(() => carregarOrdem(id), [id])
  const [versao, setVersao] = useState(0) // muda quando a OS muda: o bloco de apontamentos busca de novo

  const os = ordem.dados
  const acoes = useAcoesOS(os, { aoMudar: aoMudarOS })

  function aoMudarOS() {
    ordem.recarregar()
    setVersao((v) => v + 1)
  }

  if (ordem.carregando && !os) {
    return (
      <>
        <CabecalhoPagina titulo="Ordem de serviço" voltarPara="/ordens" />
        <div className="pagina">
          <EstadoCarregando formato="bloco" linhas={6} texto="Carregando a ordem de serviço..." />
        </div>
      </>
    )
  }

  if (ordem.erro && !os) {
    const naoExiste = ordem.erro.status === 404
    return (
      <>
        <CabecalhoPagina titulo="Ordem de serviço" voltarPara="/ordens" />
        <div className="pagina">
          {naoExiste ? (
            <EstadoVazio
              icone={FileQuestion}
              titulo="OS não encontrada"
              texto={`Não existe uma ordem de serviço com o número ${id}.`}
              acao={<Botao para="/ordens">Ver todas as ordens</Botao>}
            />
          ) : (
            <EstadoErro mensagem={ordem.erro.message} onTentarDeNovo={ordem.recarregar} />
          )}
        </div>
      </>
    )
  }

  const somenteLeitura = statusEncerrado(os.status)

  return (
    <>
      <CabecalhoPagina
        titulo={formatarNumeroOS(os.id)}
        voltarPara="/ordens"
        acoes={acoes.botoesPC}
        extra={
          <div className="detalhe-os__identificacao">
            <SeloStatus status={os.status} />
            <Placa placa={os.placa} tamanho="grande" />
            {os.eh_garantia && <span className="detalhe-os__garantia">Garantia</span>}
          </div>
        }
      />
      <div className="pagina">
        {acoes.aviso}
        {acoes.botoesSecundarios && <div className="detalhe-os__secundarias">{acoes.botoesSecundarios}</div>}
        <div className="detalhe-os">
          <div className="detalhe-os__coluna detalhe-os__coluna--esquerda">
            <div className="detalhe-os__bloco detalhe-os__bloco--itens">
              <BlocoItensOS osId={os.id} somenteLeitura={somenteLeitura} onMudou={ordem.recarregar} />
            </div>
            <div className="detalhe-os__bloco detalhe-os__bloco--apontamentos">
              <BlocoApontamentos osId={os.id} somenteLeitura={somenteLeitura} versao={versao} />
            </div>
          </div>
          <div className="detalhe-os__coluna detalhe-os__coluna--direita">
            <div className="detalhe-os__bloco detalhe-os__bloco--ordem">
              <CartaoOrdem os={os} />
            </div>
            <div className="detalhe-os__bloco detalhe-os__bloco--veiculo">
              <CartaoVeiculo os={os} />
            </div>
            <div className="detalhe-os__bloco detalhe-os__bloco--cliente">
              <CartaoCliente os={os} />
            </div>
            <div className="detalhe-os__bloco detalhe-os__bloco--relato">
              <CartaoRelato os={os} />
            </div>
          </div>
        </div>
      </div>
      {acoes.temAcoes && <RodapeAcoes soCelular>{acoes.botoesCelular}</RodapeAcoes>}
      {acoes.modais}
    </>
  )
}
