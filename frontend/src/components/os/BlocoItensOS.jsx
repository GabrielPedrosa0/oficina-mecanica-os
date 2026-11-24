// Cartão "Serviços e peças" do Detalhe da OS (issue #50): lista, adiciona do catálogo, edita e remove.
import { useState } from 'react'
import Aviso from '../ui/Aviso'
import Botao from '../ui/Botao'
import Campo from '../ui/Campo'
import Cartao from '../ui/Cartao'
import { EstadoCarregando, EstadoErro } from '../ui/Estados'
import Modal, { ModalConfirmacao } from '../ui/Modal'
import ItensOS from './ItensOS'
import { useAcao, useApi } from '../../hooks/useApi'
import {
  adicionarItem,
  atualizarItem,
  listarItens,
  listarPecas,
  listarServicosCatalogo,
  removerItem,
} from '../../services/itensOSService'
import { formatarDuracao, formatarMoeda } from '../../utils/formatadores'
import { erroQuantidade, erroValor, lerValor, valorParaCampo } from '../../utils/validadores'

// O DELETE responde 204 (sem corpo) e o useAcao devolve null quando dá erro: aqui o sucesso vira `true`.
const removerEConfirmar = async (osId, itemOsId) => {
  await removerItem(osId, itemOsId)
  return true
}

const TITULOS = { servico: 'serviço', peca: 'peça' }
const FORM_VAZIO = { itemId: '', descricao: '', quantidade: '1', valor: '' }

// Um item da OS vira o que o formulário mostra (texto), e o formulário vira o corpo da requisição.
const paraFormulario = (item) => ({
  itemId: String(item.item_id),
  descricao: item.descricao,
  quantidade: String(item.quantidade),
  valor: valorParaCampo(item.valor_unitario),
})
const paraRequisicao = (form) => ({
  item_id: Number(form.itemId),
  descricao: form.descricao.trim(),
  quantidade: Number(form.quantidade),
  valor_unitario: lerValor(form.valor),
})

function errosDoFormulario(form) {
  return {
    itemId: form.itemId ? '' : 'Escolha um item do catálogo.',
    quantidade: erroQuantidade(form.quantidade),
    valor: erroValor(form.valor),
  }
}

// Modal de adicionar/editar. `editando` é o item da OS (ou null para adicionar).
function ModalItem({ osId, tipo, editando, onFechar, onSalvo }) {
  const [form, setForm] = useState(editando ? paraFormulario(editando) : FORM_VAZIO)
  const [erros, setErros] = useState({})
  const catalogo = useApi(() => (tipo === 'servico' ? listarServicosCatalogo() : listarPecas()), [tipo])
  const salvar = useAcao((dados) =>
    editando ? atualizarItem(osId, editando.id, dados) : adicionarItem(osId, dados),
  )
  const nome = TITULOS[tipo]
  const escolhido = (catalogo.dados ?? []).find((c) => String(c.id) === form.itemId)

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setErros((atual) => ({ ...atual, [campo]: '' }))
  }

  // Ao escolher do catálogo, descrição e valor vêm preenchidos (o valor pode ser ajustado).
  function escolherDoCatalogo(id) {
    const item = (catalogo.dados ?? []).find((c) => String(c.id) === id)
    setForm((atual) => ({
      ...atual,
      itemId: id,
      descricao: item ? item.descricao : '',
      valor: item ? valorParaCampo(item.preco) : '',
    }))
    setErros((atual) => ({ ...atual, itemId: '', valor: '' }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    const novosErros = errosDoFormulario(form)
    setErros(novosErros)
    if (Object.values(novosErros).some(Boolean)) return
    if (await salvar.executar(paraRequisicao(form))) onSalvo()
  }

  const detalheCatalogo =
    escolhido &&
    [
      escolhido.codigo && `código ${escolhido.codigo}`,
      escolhido.tempo_estimado_min && `tempo estimado ${formatarDuracao(escolhido.tempo_estimado_min)}`,
      `preço do catálogo ${formatarMoeda(escolhido.preco)}`,
    ]
      .filter(Boolean)
      .join(' · ')

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={`${editando ? 'Editar' : 'Adicionar'} ${nome}`}
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-item-os" carregando={salvar.executando}>
            Salvar
          </Botao>
        </>
      }
    >
      <form id="form-item-os" className="pilha" onSubmit={enviar} noValidate>
        {salvar.erro && (
          <Aviso tom="perigo" titulo="Não foi possível salvar">
            {salvar.erro.message}
          </Aviso>
        )}
        {catalogo.erro ? (
          <EstadoErro titulo="Catálogo indisponível" mensagem={catalogo.erro.message} onTentarDeNovo={catalogo.recarregar} />
        ) : (
          <>
            <Campo
              rotulo={tipo === 'servico' ? 'Serviço do catálogo' : 'Peça do catálogo'}
              tipo="select"
              value={form.itemId}
              disabled={catalogo.carregando}
              erro={erros.itemId}
              ajuda={detalheCatalogo}
              onChange={(e) => escolherDoCatalogo(e.target.value)}
            >
              <option value="">{catalogo.carregando ? 'Carregando...' : `Escolha ${tipo === 'servico' ? 'o serviço' : 'a peça'}`}</option>
              {(catalogo.dados ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descricao}
                </option>
              ))}
            </Campo>
            <Campo
              rotulo="Descrição"
              value={form.descricao}
              maxLength={120}
              onChange={(e) => mudar('descricao', e.target.value)}
            />
            <div className="linha-campos">
              <Campo
                rotulo="Quantidade"
                tipo="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={form.quantidade}
                erro={erros.quantidade}
                onChange={(e) => mudar('quantidade', e.target.value)}
              />
              <Campo
                rotulo="Valor unitário (R$)"
                inputMode="decimal"
                placeholder="120,50"
                value={form.valor}
                erro={erros.valor}
                onChange={(e) => mudar('valor', e.target.value)}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}

export default function BlocoItensOS({ osId, somenteLeitura = false, onMudou }) {
  const itens = useApi(() => listarItens(osId), [osId])
  const [modal, setModal] = useState(null) // { tipo, editando } | null
  const [remover, setRemover] = useState(null) // item da OS | null
  const exclusao = useAcao(removerEConfirmar)

  // Depois de cada mudança: recarrega os itens e avisa a página (o total da OS muda).
  function aposMudar() {
    itens.recarregar()
    onMudou?.()
  }

  async function remocao() {
    if (await exclusao.executar(osId, remover.id)) {
      setRemover(null)
      aposMudar()
    }
  }

  let conteudo
  if (itens.carregando && !itens.dados) conteudo = <EstadoCarregando formato="bloco" linhas={4} texto="Carregando itens..." />
  else if (itens.erro && !itens.dados) conteudo = <EstadoErro mensagem={itens.erro.message} onTentarDeNovo={itens.recarregar} />
  else
    conteudo = (
      <ItensOS
        itens={itens.dados ?? []}
        somenteLeitura={somenteLeitura}
        onAdicionar={(tipo) => setModal({ tipo, editando: null })}
        onEditar={(item) => setModal({ tipo: item.tipo, editando: item })}
        onRemover={setRemover}
      />
    )

  return (
    <Cartao className="detalhe-os__itens">
      {conteudo}
      {modal && (
        <ModalItem
          key={modal.editando?.id ?? `novo-${modal.tipo}`}
          osId={osId}
          tipo={modal.tipo}
          editando={modal.editando}
          onFechar={() => setModal(null)}
          onSalvo={() => {
            setModal(null)
            aposMudar()
          }}
        />
      )}
      <ModalConfirmacao
        aberto={remover !== null}
        titulo="Remover item"
        texto={remover ? `Remover "${remover.descricao}" desta OS? O total será recalculado.` : ''}
        rotuloConfirmar="Remover"
        perigo
        carregando={exclusao.executando}
        onConfirmar={remocao}
        onCancelar={() => {
          setRemover(null)
          exclusao.limparErro()
        }}
      >
        {exclusao.erro && (
          <Aviso tom="perigo" titulo="Não foi possível remover">
            {exclusao.erro.message}
          </Aviso>
        )}
      </ModalConfirmacao>
    </Cartao>
  )
}
