// Detalhe da OS (Figma "PC — Detalhe da OS" e "Celular — Detalhe da OS"). Integrante 3.
// PC: à esquerda Serviços e peças + Apontamentos; à direita Ordem de serviço, Veículo, Cliente e o relato.
// Celular: dados em cima, depois Serviços, Peças, Total e Apontamentos; botões presos no rodapé.
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Ban, Check, ClipboardX, PackageSearch, Pencil, Phone, Printer, Send } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao, { Dado, GradeDados } from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Etiqueta from '../../components/ui/Etiqueta'
import { ModalConfirmacao } from '../../components/ui/Modal'
import Placa from '../../components/ui/Placa'
import SeloStatus from '../../components/ui/SeloStatus'
import Apontamentos from '../../components/os/Apontamentos'
import ItensOS from '../../components/os/ItensOS'
import { ACAO_PRINCIPAL, podeMudar, statusEncerrado } from '../../constants/statusOS'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import { listarItens, removerItem } from '../../services/itensOSService'
import { consultarOrdem, listarApontamentos, mudarStatus } from '../../services/ordensServicoService'
import { encurtarChassi, formatarKm, formatarMomento, linkTelefone } from '../../utils/formatadores'
import { ModalApontamento, ModalEditarOS, ModalItem, ModalOrcamento } from './ModaisOS'
import './ordens.css'

const ou = (valor) => valor || '—'

export default function DetalheOrdemPage() {
  const { id } = useParams()
  const ordem = useApi(() => consultarOrdem(id), [id])
  const itens = useApi(() => listarItens(id), [id])
  const apontamentos = useApi(() => listarApontamentos(id), [id])
  const acaoStatus = useAcao(mudarStatus)
  const remover = useAcao(excluindo(removerItem))

  // Qual modal está aberto: { tipo: 'item', tipoItem, item } | { tipo: 'apontamento' } | ...
  const [modal, setModal] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [erroMotivo, setErroMotivo] = useState(null)
  const fechar = () => setModal(null)

  // Só mostra "carregando" na primeira vez: ao recarregar depois de salvar, a tela fica onde está.
  if (ordem.carregando && !ordem.dados) return <EstadoCarregando texto="Carregando a OS..." />
  if (ordem.erro?.status === 404)
    return (
      <div className="pagina">
        <EstadoVazio
          icone={ClipboardX}
          titulo={`OS ${id} não encontrada`}
          texto="Confira o número. Ela pode ter sido excluída."
          acao={
            <Botao para="/ordens" variante="secundario" icone={ArrowLeft}>
              Ver todas as ordens
            </Botao>
          }
        />
      </div>
    )
  if (ordem.erro && !ordem.dados)
    return (
      <div className="pagina">
        <EstadoErro mensagem={ordem.erro.message} onTentarDeNovo={ordem.recarregar} />
      </div>
    )

  const os = ordem.dados
  const lista = itens.dados ?? []
  const acao = ACAO_PRINCIPAL[os.status]
  const somenteLeitura = statusEncerrado(os.status)

  // Depois de mudar itens ou status: o total, o status e a linha do tempo mudam juntos.
  function recarregarTudo() {
    ordem.recarregar()
    itens.recarregar()
    apontamentos.recarregar()
  }

  async function avancar(novo, motivoCancelamento) {
    if (await acaoStatus.executar(os.id, novo, motivoCancelamento)) {
      fechar()
      recarregarTudo()
    }
  }

  function cancelarOS() {
    const msg = motivo.trim() ? null : 'Informe o motivo do cancelamento.'
    setErroMotivo(msg)
    if (!msg) avancar('CANCELADA', motivo.trim())
  }

  async function confirmarRemocao() {
    if (await remover.executar(os.id, modal.item.id)) {
      fechar()
      recarregarTudo()
    }
  }

  const salvouItem = () => {
    fechar()
    recarregarTudo()
  }

  const botaoOrcamento = (larguraTotal) =>
    !somenteLeitura && (
      <Botao
        variante="secundario"
        icone={Send}
        larguraTotal={larguraTotal}
        onClick={() => setModal({ tipo: 'orcamento' })}
      >
        Enviar orçamento
      </Botao>
    )
  const botaoPrincipal = (larguraTotal) =>
    acao && (
      <Botao
        icone={Check}
        larguraTotal={larguraTotal}
        carregando={acaoStatus.executando && modal?.tipo !== 'cancelar'}
        onClick={() => avancar(acao.proximo)}
      >
        {acao.rotulo}
      </Botao>
    )

  return (
    <>
      <CabecalhoPagina
        titulo={`OS ${os.id}`}
        voltarPara={-1}
        acoes={
          <>
            <Botao variante="secundario" icone={Printer} onClick={() => window.print()}>
              Imprimir
            </Botao>
            {botaoOrcamento(false)}
            {botaoPrincipal(false)}
          </>
        }
      />

      <div className="pagina detalhe-os">
        <p className="detalhe-os__impressao t-h3">
          Ordem de serviço {os.id} · {os.cliente_nome} · {os.veiculo} ({os.placa})
        </p>

        <div className="detalhe-os__topo">
          <div className="detalhe-os__topo-esquerda">
            <SeloStatus status={os.status} />
            {os.eh_garantia && <Etiqueta>Garantia</Etiqueta>}
          </div>
          <Placa placa={os.placa} tamanho="grande" />
        </div>

        {os.status === 'CANCELADA' && os.motivo_cancelamento && (
          <Aviso tom="perigo" titulo="OS cancelada">
            Motivo: {os.motivo_cancelamento}
          </Aviso>
        )}
        {acaoStatus.erro && (
          <Aviso tom="perigo" titulo="Não foi possível mudar o status" onFechar={acaoStatus.limparErro}>
            {acaoStatus.erro.message}
          </Aviso>
        )}

        <div className="detalhe-os__grade">
          <div className="pilha">
            <Cartao>
              {itens.carregando && !itens.dados ? (
                <EstadoCarregando />
              ) : itens.erro ? (
                <EstadoErro
                  titulo="Não foi possível carregar os itens"
                  mensagem={itens.erro.message}
                  onTentarDeNovo={itens.recarregar}
                />
              ) : (
                <ItensOS
                  itens={lista}
                  total={lista.length ? undefined : os.valor_total}
                  somenteLeitura={somenteLeitura}
                  onAdicionar={(tipoItem) => setModal({ tipo: 'item', tipoItem, item: null })}
                  onEditar={(item) => setModal({ tipo: 'item', tipoItem: item.tipo, item })}
                  onRemover={(item) => setModal({ tipo: 'remover', item })}
                />
              )}
            </Cartao>

            <Cartao>
              {apontamentos.carregando && !apontamentos.dados ? (
                <EstadoCarregando />
              ) : apontamentos.erro ? (
                <EstadoErro
                  titulo="Não foi possível carregar os apontamentos"
                  mensagem={apontamentos.erro.message}
                  onTentarDeNovo={apontamentos.recarregar}
                />
              ) : (
                <Apontamentos
                  apontamentos={apontamentos.dados}
                  somenteLeitura={somenteLeitura}
                  onRegistrar={() => setModal({ tipo: 'apontamento' })}
                />
              )}
            </Cartao>
          </div>

          <div className="pilha detalhe-os__dados">
            <Cartao
              titulo="Ordem de serviço"
              acao={
                !somenteLeitura && (
                  <Botao
                    variante="fantasma"
                    tamanho="pequeno"
                    icone={Pencil}
                    aria-label="Editar dados da OS"
                    className="detalhe-os__outras"
                    onClick={() => setModal({ tipo: 'editar' })}
                  />
                )
              }
            >
              <GradeDados>
                <Dado rotulo="Abertura">{formatarMomento(os.data_abertura)}</Dado>
                <Dado rotulo="Previsão">{os.data_previsao ? formatarMomento(os.data_previsao) : 'Sem data'}</Dado>
                <Dado rotulo="Conclusão">{os.data_conclusao ? formatarMomento(os.data_conclusao) : '—'}</Dado>
                <Dado rotulo="Orçamento enviado">
                  {os.data_orcamento_enviado ? formatarMomento(os.data_orcamento_enviado) : '—'}
                </Dado>
              </GradeDados>
              <Dado rotulo="Mecânico">
                {os.mecanico ? [os.mecanico, os.mecanico_expediente].filter(Boolean).join(' · ') : 'A definir'}
              </Dado>
              <Dado rotulo="Garantia">{os.eh_garantia ? 'Sim' : 'Não'}</Dado>
            </Cartao>

            <Cartao titulo="Veículo">
              <Dado rotulo="Modelo">{[os.veiculo, os.ano].filter(Boolean).join(' · ')}</Dado>
              <Dado rotulo="Chassi">
                <span className="detalhe-os__chassi so-pc">{ou(os.chassi)}</span>
                <span className="detalhe-os__chassi so-celular">{encurtarChassi(os.chassi)}</span>
              </Dado>
              <Dado rotulo="Km na entrada">{formatarKm(os.quilometragem)}</Dado>
            </Cartao>

            <Cartao titulo="Cliente">
              <Dado rotulo="Nome">{ou(os.cliente_nome)}</Dado>
              <Dado rotulo="Telefone">
                {os.cliente_telefone ? (
                  <a className="detalhe-os__telefone" href={linkTelefone(os.cliente_telefone)}>
                    <Phone size={14} aria-hidden="true" /> {os.cliente_telefone}
                  </a>
                ) : (
                  '—'
                )}
              </Dado>
              <Dado rotulo="CPF">{ou(os.cliente_cpf_cnpj)}</Dado>
            </Cartao>

            <Cartao>
              <Dado rotulo="Problema relatado">{os.problema_relatado}</Dado>
              <Dado rotulo="Observações">{os.observacoes ?? 'Nenhuma'}</Dado>
            </Cartao>

            {!somenteLeitura && (podeMudar(os.status, 'AGUARDANDO_PECA') || podeMudar(os.status, 'CANCELADA')) && (
              <Cartao titulo="Outras ações" className="detalhe-os__outras">
                <div className="detalhe-os__acoes">
                  {podeMudar(os.status, 'AGUARDANDO_PECA') && (
                    <Botao variante="secundario" icone={PackageSearch} onClick={() => avancar('AGUARDANDO_PECA')}>
                      Marcar aguardando peça
                    </Botao>
                  )}
                  {podeMudar(os.status, 'CANCELADA') && (
                    <Botao
                      variante="secundario"
                      icone={Ban}
                      onClick={() => {
                        setMotivo('')
                        setErroMotivo(null)
                        setModal({ tipo: 'cancelar' })
                      }}
                    >
                      Cancelar OS
                    </Botao>
                  )}
                </div>
              </Cartao>
            )}
          </div>
        </div>
      </div>

      {(acao || !somenteLeitura) && (
        <RodapeAcoes soCelular>
          {botaoOrcamento(true)}
          {botaoPrincipal(true)}
        </RodapeAcoes>
      )}

      {modal?.tipo === 'item' && (
        <ModalItem aberto osId={os.id} tipo={modal.tipoItem} item={modal.item} onFechar={fechar} onSalvo={salvouItem} />
      )}
      {modal?.tipo === 'apontamento' && <ModalApontamento aberto osId={os.id} onFechar={fechar} onSalvo={salvouItem} />}
      {modal?.tipo === 'orcamento' && (
        <ModalOrcamento aberto os={os} itens={lista} onFechar={fechar} onEnviado={salvouItem} />
      )}
      {modal?.tipo === 'editar' && <ModalEditarOS aberto os={os} onFechar={fechar} onSalvo={salvouItem} />}

      <ModalConfirmacao
        aberto={modal?.tipo === 'remover'}
        titulo={`Remover ${modal?.item?.tipo === 'servico' ? 'serviço' : 'peça'}?`}
        texto={`“${modal?.item?.descricao ?? ''}” sai da OS e o total é recalculado.`}
        rotuloConfirmar="Remover"
        perigo
        carregando={remover.executando}
        onCancelar={() => {
          remover.limparErro()
          fechar()
        }}
        onConfirmar={confirmarRemocao}
      >
        {remover.erro && <Aviso tom="perigo">{remover.erro.message}</Aviso>}
      </ModalConfirmacao>

      <ModalConfirmacao
        aberto={modal?.tipo === 'cancelar'}
        titulo={`Cancelar a OS ${os.id}?`}
        texto="A OS fica só para leitura. Informe o motivo: ele vai para o histórico."
        rotuloConfirmar="Cancelar OS"
        rotuloCancelar="Voltar"
        perigo
        carregando={acaoStatus.executando}
        onCancelar={fechar}
        onConfirmar={cancelarOS}
      >
        {acaoStatus.erro && <Aviso tom="perigo">{acaoStatus.erro.message}</Aviso>}
        <Campo
          rotulo="Motivo"
          tipo="textarea"
          maxLength={300}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          erro={erroMotivo}
        />
      </ModalConfirmacao>
    </>
  )
}
