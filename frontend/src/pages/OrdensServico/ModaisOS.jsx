// Modais do Detalhe da OS: item (serviço ou peça), apontamento, orçamento e editar dados. Integrante 3.
import { useState } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Interruptor from '../../components/ui/Interruptor'
import Modal from '../../components/ui/Modal'
import { TIPOS_REGISTRAVEIS } from '../../constants/apontamentos'
import { useAcao, useApi } from '../../hooks/useApi'
import { adicionarItem, atualizarItem } from '../../services/itensOSService'
import { listarMecanicos } from '../../services/mecanicosService'
import { atualizarOrdem, enviarOrcamento, registrarApontamento } from '../../services/ordensServicoService'
import { listarPecas } from '../../services/pecasService'
import { listarServicosCatalogo } from '../../services/servicosCatalogoService'
import {
  deCampoDataHora,
  formatarDuracao,
  formatarExpediente,
  formatarMoeda,
  linkWhatsApp,
  paraCampoDataHora,
} from '../../utils/formatadores'
import { paraNumero, paraTextoDecimal as paraTexto } from '../../utils/numeros'
import { textoOrcamento } from '../../utils/ordemServico'
import { obrigatorio, validar, validarPrevisao } from '../../utils/validadores'

// ------------------------------------------------------------------ Item da OS

// item = null (novo) ou o item que está sendo editado. tipo = 'servico' | 'peca'.
export function ModalItem({ aberto, osId, tipo, item, onFechar, onSalvo }) {
  const editando = Boolean(item)
  const [form, setForm] = useState(() => ({
    catalogo_id: String((tipo === 'servico' ? item?.servico_id : item?.peca_id) ?? ''),
    descricao: item?.descricao ?? '',
    codigo: item?.codigo ?? '',
    quantidade: String(item?.quantidade ?? 1),
    valor_unitario: paraTexto(item?.valor_unitario),
    tempo_estimado_min: String(item?.tempo_estimado_min ?? ''),
  }))
  const [erros, setErros] = useState({})
  const salvar = useAcao(
    editando ? (dados) => atualizarItem(osId, item.id, dados) : (dados) => adicionarItem(osId, dados),
  )
  const catalogo = useApi(() => (tipo === 'servico' ? listarServicosCatalogo() : listarPecas()), [tipo])

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function escolher(e) {
    const id = e.target.value
    const escolhido = (catalogo.dados ?? []).find((c) => String(c.id) === id)
    if (!escolhido) return setForm((f) => ({ ...f, catalogo_id: '' }))
    setForm((f) =>
      tipo === 'servico'
        ? {
            ...f,
            catalogo_id: id,
            descricao: escolhido.descricao,
            valor_unitario: paraTexto(escolhido.preco_base),
            tempo_estimado_min: String(escolhido.tempo_estimado_min ?? ''),
          }
        : {
            ...f,
            catalogo_id: id,
            descricao: escolhido.descricao,
            codigo: escolhido.codigo,
            valor_unitario: paraTexto(escolhido.preco_venda),
          },
    )
  }

  async function enviar() {
    const quantidade = paraNumero(form.quantidade)
    const valor = paraNumero(form.valor_unitario)
    const encontrados = validar({
      descricao: obrigatorio(form.descricao, 'Informe a descrição.'),
      quantidade: !(quantidade > 0) ? 'A quantidade precisa ser maior que zero.' : null,
      valor_unitario: Number.isNaN(valor) || valor < 0 ? 'Informe um valor válido, ex.: 120,50.' : null,
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const catalogoId = form.catalogo_id ? Number(form.catalogo_id) : null
    const salvo = await salvar.executar({
      tipo,
      descricao: form.descricao.trim(),
      codigo: tipo === 'peca' ? form.codigo.trim() || null : null,
      quantidade,
      valor_unitario: valor,
      tempo_estimado_min: tipo === 'servico' && form.tempo_estimado_min ? Number(form.tempo_estimado_min) : null,
      servico_id: tipo === 'servico' ? catalogoId : null,
      peca_id: tipo === 'peca' ? catalogoId : null,
    })
    if (salvo) onSalvo()
  }

  const nome = tipo === 'servico' ? 'serviço' : 'peça'
  const subtotal = paraNumero(form.quantidade) * paraNumero(form.valor_unitario)

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={editando ? `Editar ${nome}` : `Adicionar ${nome}`}
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao carregando={salvar.executando} onClick={enviar}>
            {editando ? 'Salvar alterações' : `Adicionar ${nome}`}
          </Botao>
        </>
      }
    >
      {salvar.erro && <Aviso tom="perigo">{salvar.erro.message}</Aviso>}
      <Campo
        rotulo={tipo === 'servico' ? 'Serviço do catálogo' : 'Peça do estoque'}
        tipo="select"
        value={form.catalogo_id}
        onChange={escolher}
        disabled={catalogo.carregando}
        ajuda={
          catalogo.erro
            ? catalogo.erro.message
            : tipo === 'servico'
              ? 'O valor parte do preço base e pode ser ajustado.'
              : 'Escolha uma peça do estoque ou deixe em branco para uma peça avulsa.'
        }
      >
        <option value="">{tipo === 'servico' ? 'Outro (digitar abaixo)' : 'Peça avulsa, fora do estoque'}</option>
        {(catalogo.dados ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {tipo === 'servico'
              ? `${c.descricao} · ${formatarDuracao(c.tempo_estimado_min)} · ${formatarMoeda(c.preco_base)}`
              : `${c.descricao} · ${c.codigo} · ${c.estoque} em estoque`}
          </option>
        ))}
      </Campo>
      <Campo rotulo="Descrição" value={form.descricao} onChange={mudar('descricao')} erro={erros.descricao} />
      {tipo === 'peca' && (
        <Campo rotulo="Código" opcional value={form.codigo} onChange={mudar('codigo')} placeholder="FLT-OL-0098" />
      )}
      <div className="detalhe-os__duas">
        <Campo
          rotulo="Quantidade"
          inputMode="decimal"
          value={form.quantidade}
          onChange={mudar('quantidade')}
          erro={erros.quantidade}
        />
        <Campo
          rotulo="Valor unitário (R$)"
          inputMode="decimal"
          value={form.valor_unitario}
          onChange={mudar('valor_unitario')}
          erro={erros.valor_unitario}
          placeholder="120,50"
        />
      </div>
      {tipo === 'servico' && (
        <Campo
          rotulo="Tempo estimado (minutos)"
          tipo="number"
          min="0"
          opcional
          value={form.tempo_estimado_min}
          onChange={mudar('tempo_estimado_min')}
        />
      )}
      {subtotal > 0 && <p className="texto-secundario">Subtotal: {formatarMoeda(subtotal)}</p>}
    </Modal>
  )
}

// ------------------------------------------------------------------ Apontamento

export function ModalApontamento({ aberto, osId, onFechar, onSalvo }) {
  const [tipo, setTipo] = useState('EXECUCAO')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState(null)
  const registrar = useAcao(registrarApontamento)

  async function enviar() {
    const msg = obrigatorio(descricao, 'Descreva o que foi feito.')
    setErro(msg)
    if (msg) return
    if (await registrar.executar(osId, { tipo, descricao: descricao.trim() })) onSalvo()
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Registrar apontamento"
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao carregando={registrar.executando} onClick={enviar}>
            Registrar
          </Botao>
        </>
      }
    >
      {registrar.erro && <Aviso tom="perigo">{registrar.erro.message}</Aviso>}
      <Campo rotulo="Tipo" tipo="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
        {TIPOS_REGISTRAVEIS.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.rotulo}
          </option>
        ))}
      </Campo>
      <Campo
        rotulo="O que foi feito"
        tipo="textarea"
        maxLength={500}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        erro={erro}
        placeholder="Óleo e filtros trocados; testando vazamentos."
      />
    </Modal>
  )
}

// ------------------------------------------------------------------ Orçamento

export function ModalOrcamento({ aberto, os, itens, onFechar, onEnviado }) {
  const texto = textoOrcamento(os, itens)
  const [copiado, setCopiado] = useState(false)
  const marcar = useAcao(enviarOrcamento)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  async function concluir(abrirWhatsApp) {
    if (abrirWhatsApp) window.open(linkWhatsApp(os.cliente_telefone, texto), '_blank', 'noopener')
    if (await marcar.executar(os.id)) onEnviado()
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Enviar orçamento"
      largura={540}
      rodape={
        <>
          <Botao variante="secundario" icone={Copy} onClick={copiar}>
            {copiado ? 'Copiado' : 'Copiar'}
          </Botao>
          <Botao variante="secundario" carregando={marcar.executando} onClick={() => concluir(false)}>
            Marcar como enviado
          </Botao>
          <Botao
            icone={MessageCircle}
            carregando={marcar.executando}
            disabled={!os.cliente_telefone}
            onClick={() => concluir(true)}
          >
            WhatsApp
          </Botao>
        </>
      }
    >
      {marcar.erro && <Aviso tom="perigo">{marcar.erro.message}</Aviso>}
      <p className="modal__texto">
        Confira antes de enviar. O WhatsApp abre com a mensagem pronta para {os.cliente_nome}.
      </p>
      <pre className="detalhe-os__orcamento">{texto}</pre>
    </Modal>
  )
}

// ------------------------------------------------------------------ Editar dados da OS

export function ModalEditarOS({ aberto, os, onFechar, onSalvo }) {
  const [form, setForm] = useState({
    quilometragem: String(os.quilometragem ?? ''),
    data_previsao: paraCampoDataHora(os.data_previsao),
    mecanico_id: String(os.mecanico_id ?? ''),
    problema_relatado: os.problema_relatado ?? '',
    observacoes: os.observacoes ?? '',
    garantia: Boolean(os.eh_garantia),
  })
  const [erros, setErros] = useState({})
  const mecanicos = useApi(() => listarMecanicos())
  const salvar = useAcao(atualizarOrdem)
  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function enviar() {
    const encontrados = validar({
      problema_relatado: obrigatorio(form.problema_relatado, 'Descreva o problema relatado.'),
      data_previsao: validarPrevisao(form.data_previsao, os.data_abertura),
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const mecanicoId = form.mecanico_id ? Number(form.mecanico_id) : null
    const salvo = await salvar.executar(os.id, {
      veiculo_id: os.veiculo_id,
      quilometragem: form.quilometragem === '' ? null : Number(form.quilometragem),
      problema_relatado: form.problema_relatado.trim(),
      servico: os.servico,
      mecanico_id: mecanicoId,
      // OS antiga com só o nome do mecânico (sem cadastro): mantém o nome enquanto ninguém escolher outro.
      mecanico: mecanicoId || os.mecanico_id ? null : os.mecanico,
      data_abertura: os.data_abertura,
      data_previsao: deCampoDataHora(form.data_previsao),
      data_conclusao: os.data_conclusao,
      status: os.status,
      eh_garantia: form.garantia,
      observacoes: form.observacoes.trim() || null,
      valor_total: os.valor_total,
    })
    if (salvo) onSalvo()
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={`Editar OS ${os.id}`}
      largura={560}
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao carregando={salvar.executando} onClick={enviar}>
            Salvar alterações
          </Botao>
        </>
      }
    >
      {salvar.erro && <Aviso tom="perigo">{salvar.erro.message}</Aviso>}
      <div className="detalhe-os__duas">
        <Campo
          rotulo="Km na entrada"
          tipo="number"
          min="0"
          value={form.quilometragem}
          onChange={mudar('quilometragem')}
          opcional
        />
        <Campo
          rotulo="Previsão de entrega"
          tipo="datetime-local"
          value={form.data_previsao}
          onChange={mudar('data_previsao')}
          erro={erros.data_previsao}
          opcional
        />
      </div>
      <Campo rotulo="Mecânico" tipo="select" value={form.mecanico_id} onChange={mudar('mecanico_id')} opcional>
        <option value="">{!os.mecanico_id && os.mecanico ? os.mecanico : 'A definir'}</option>
        {(mecanicos.dados ?? []).map((m) => (
          <option key={m.id} value={m.id}>
            {m.nome} · {formatarExpediente(m.expediente_inicio, m.expediente_fim)}
          </option>
        ))}
      </Campo>
      <Campo
        rotulo="Problema relatado"
        tipo="textarea"
        maxLength={1000}
        value={form.problema_relatado}
        onChange={mudar('problema_relatado')}
        erro={erros.problema_relatado}
      />
      <Campo
        rotulo="Observações"
        tipo="textarea"
        maxLength={1000}
        value={form.observacoes}
        onChange={mudar('observacoes')}
        opcional
      />
      <Interruptor
        rotulo="Serviço em garantia"
        ajuda="Retorno de um serviço já feito; não é cobrado"
        ligado={form.garantia}
        onChange={(v) => setForm((f) => ({ ...f, garantia: v }))}
      />
    </Modal>
  )
}
