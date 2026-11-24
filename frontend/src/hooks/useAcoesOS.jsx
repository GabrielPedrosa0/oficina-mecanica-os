// Ações do Detalhe da OS (issue #51): mudar status, cancelar, enviar orçamento e imprimir.
// Devolve os botões (um jeito para o cabeçalho do PC, outro para o rodapé do celular), os modais e o aviso de erro.
import { useState } from 'react'
import { MessageCircle, Printer, Send } from 'lucide-react'
import Aviso from '../components/ui/Aviso'
import Botao from '../components/ui/Botao'
import Campo from '../components/ui/Campo'
import Modal, { ModalConfirmacao } from '../components/ui/Modal'
import { ACAO_PRINCIPAL, podeMudar } from '../constants/statusOS'
import { listarItens } from '../services/itensOSService'
import { enviarOrcamento, mudarStatus } from '../services/ordensServicoService'
import { linkWhatsApp } from '../utils/formatadores'
import { textoOrcamento } from '../utils/ordemServico'
import { useAcao } from './useApi'

// Só estes status ainda aceitam orçamento (o backend recusa em PRONTA, ENTREGUE e CANCELADA).
const STATUS_COM_ORCAMENTO = ['ORCAMENTO', 'EM_SERVICO', 'AGUARDANDO_PECA']

export function useAcoesOS(os, { aoMudar } = {}) {
  const status = os?.status
  const [cancelando, setCancelando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erroMotivo, setErroMotivo] = useState('')
  const [orcamento, setOrcamento] = useState(null) // { texto } enquanto o modal está aberto
  const [copiado, setCopiado] = useState(false)
  const [avisoLocal, setAvisoLocal] = useState('')
  const [erroCopia, setErroCopia] = useState('')

  const mudar = useAcao(mudarStatus)
  const enviar = useAcao(enviarOrcamento)
  const buscarItens = useAcao(listarItens)

  const principal = ACAO_PRINCIPAL[status]
  const podeEnviar = STATUS_COM_ORCAMENTO.includes(status)
  const podeAguardarPeca = podeMudar(status, 'AGUARDANDO_PECA')
  const podeCancelar = podeMudar(status, 'CANCELADA')

  // Transição recusada pelo backend (409) aparece no <Aviso>; sucesso recarrega a OS.
  async function irPara(novoStatus, motivoCancelamento) {
    setAvisoLocal('')
    const atualizada = await mudar.executar(os.id, novoStatus, motivoCancelamento)
    if (atualizada) aoMudar?.()
    return Boolean(atualizada)
  }

  async function confirmarCancelamento() {
    const texto = motivo.trim()
    if (texto === '') return setErroMotivo('Informe o motivo do cancelamento.')
    if (await irPara('CANCELADA', texto)) fecharCancelamento()
  }

  function fecharCancelamento() {
    setCancelando(false)
    setMotivo('')
    setErroMotivo('')
  }

  // Abre o modal com o texto montado a partir dos itens atuais da OS.
  async function abrirOrcamento() {
    setAvisoLocal('')
    const itens = await buscarItens.executar(os.id)
    if (!itens) return
    if (itens.length === 0) {
      setAvisoLocal('Adicione ao menos um serviço ou peça antes de enviar o orçamento.')
      return
    }
    setCopiado(false)
    setErroCopia('')
    setOrcamento({ texto: textoOrcamento(os, itens) })
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(orcamento.texto)
      setCopiado(true)
      setErroCopia('')
    } catch {
      setErroCopia('Não foi possível copiar. Selecione o texto e copie manualmente.')
    }
  }

  async function confirmarEnvio() {
    if (await enviar.executar(os.id)) {
      setOrcamento(null)
      aoMudar?.()
    }
  }

  const botaoPrincipal = principal && (
    <Botao key="principal" carregando={mudar.executando} onClick={() => irPara(principal.proximo)}>
      {principal.rotulo}
    </Botao>
  )
  const botaoOrcamento = podeEnviar && (
    <Botao key="orcamento" variante="secundario" icone={Send} carregando={buscarItens.executando} onClick={abrirOrcamento}>
      Enviar orçamento
    </Botao>
  )

  // O erro de cancelar aparece dentro do próprio modal; os demais, no aviso da página.
  const erroMudar = cancelando ? null : mudar.erro
  const erro = avisoLocal ? { message: avisoLocal } : (erroMudar ?? buscarItens.erro)
  const limparErro = () => {
    setAvisoLocal('')
    mudar.limparErro()
    buscarItens.limparErro()
  }

  return {
    temAcoes: Boolean(principal || podeEnviar),
    // Cabeçalho do PC: Imprimir, Enviar orçamento e o botão principal do status.
    botoesPC: (
      <>
        <Botao variante="secundario" icone={Printer} onClick={() => window.print()}>
          Imprimir
        </Botao>
        {botaoOrcamento}
        {botaoPrincipal}
      </>
    ),
    // Rodapé do celular: Enviar orçamento e o botão principal.
    botoesCelular: (
      <>
        {botaoOrcamento}
        {botaoPrincipal}
      </>
    ),
    // "Marcar aguardando peça" e "Cancelar OS" só quando o backend deixaria.
    botoesSecundarios:
      podeAguardarPeca || podeCancelar ? (
        <>
          {podeAguardarPeca && (
            <Botao variante="sutil" tamanho="pequeno" carregando={mudar.executando} onClick={() => irPara('AGUARDANDO_PECA')}>
              Marcar aguardando peça
            </Botao>
          )}
          {podeCancelar && (
            <Botao variante="sutil" tamanho="pequeno" onClick={() => setCancelando(true)}>
              Cancelar OS
            </Botao>
          )}
        </>
      ) : null,
    aviso: erro && (
      <Aviso tom={avisoLocal ? 'atencao' : 'perigo'} titulo={avisoLocal ? 'Antes de continuar' : 'Não foi possível concluir'} onFechar={limparErro}>
        {erro.message}
      </Aviso>
    ),
    modais: (
      <>
        <ModalConfirmacao
          aberto={cancelando}
          titulo="Cancelar OS"
          texto={`A OS ${os?.id} ficará cancelada e só para leitura. Isso não pode ser desfeito.`}
          rotuloConfirmar="Cancelar OS"
          rotuloCancelar="Voltar"
          perigo
          carregando={mudar.executando}
          onConfirmar={confirmarCancelamento}
          onCancelar={fecharCancelamento}
        >
          <Campo
            rotulo="Motivo do cancelamento"
            tipo="textarea"
            maxLength={300}
            value={motivo}
            erro={erroMotivo}
            onChange={(e) => {
              setMotivo(e.target.value)
              setErroMotivo('')
            }}
          />
          {mudar.erro && (
            <Aviso tom="perigo" titulo="Não foi possível cancelar">
              {mudar.erro.message}
            </Aviso>
          )}
        </ModalConfirmacao>
        <Modal
          aberto={orcamento !== null}
          onFechar={() => setOrcamento(null)}
          titulo="Enviar orçamento"
          largura={560}
          rodape={
            <>
              <Botao variante="secundario" onClick={copiar}>
                {copiado ? 'Copiado!' : 'Copiar'}
              </Botao>
              {os?.cliente_telefone && (
                <a
                  className="botao botao--secundario"
                  href={linkWhatsApp(os.cliente_telefone, orcamento?.texto)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={20} aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              )}
              <Botao carregando={enviar.executando} onClick={confirmarEnvio}>
                Registrar envio
              </Botao>
            </>
          }
        >
          <p className="modal__texto">
            Confira o texto, mande pelo WhatsApp ou copie e, depois, clique em &quot;Registrar envio&quot;.
          </p>
          <pre className="orcamento-texto">{orcamento?.texto}</pre>
          {erroCopia && <Aviso tom="atencao">{erroCopia}</Aviso>}
          {enviar.erro && (
            <Aviso tom="perigo" titulo="Não foi possível registrar o envio" onFechar={enviar.limparErro}>
              {enviar.erro.message}
            </Aviso>
          )}
        </Modal>
      </>
    ),
  }
}
