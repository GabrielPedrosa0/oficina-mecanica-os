// Serviços: catálogo de mão de obra (Figma "PC — Serviços" e "Celular — Serviços e peças"). Integrante 4.
// O valor cobrado em cada OS parte do preço base e pode ser ajustado lá.
import { useState } from 'react'
import { Plus, Trash2, Wrench } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Modal, { ModalConfirmacao } from '../../components/ui/Modal'
import Tabela from '../../components/ui/Tabela'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import {
  atualizarServicoCatalogo,
  cadastrarServicoCatalogo,
  excluirServicoCatalogo,
  listarServicosCatalogo,
} from '../../services/servicosCatalogoService'
import { formatarDuracao, formatarMoeda } from '../../utils/formatadores'
import { obrigatorio, validar } from '../../utils/validadores'
import AbasCatalogo from './AbasCatalogo'
import { paraNumero, paraTextoDecimal } from '../../utils/numeros'
import './catalogo.css'

const COLUNAS = [
  { chave: 'descricao', rotulo: 'Descrição' },
  {
    chave: 'tempo_estimado_min',
    rotulo: 'Tempo estimado',
    direita: true,
    render: (s) => formatarDuracao(s.tempo_estimado_min),
  },
  { chave: 'preco_base', rotulo: 'Preço base', direita: true, render: (s) => formatarMoeda(s.preco_base) },
]

function ModalServico({ servico, onFechar, onSalvo }) {
  const editando = Boolean(servico?.id)
  const [form, setForm] = useState({
    descricao: servico?.descricao ?? '',
    tempo_estimado_min: String(servico?.tempo_estimado_min ?? ''),
    preco_base: paraTextoDecimal(servico?.preco_base),
  })
  const [erros, setErros] = useState({})
  const [excluir, setExcluir] = useState(false)
  const salvar = useAcao(editando ? (d) => atualizarServicoCatalogo(servico.id, d) : cadastrarServicoCatalogo)
  const apagar = useAcao(excluindo(excluirServicoCatalogo))
  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function enviar(e) {
    e?.preventDefault()
    const preco = paraNumero(form.preco_base)
    const tempo = form.tempo_estimado_min === '' ? null : Number(form.tempo_estimado_min)
    const encontrados = validar({
      descricao: obrigatorio(form.descricao, 'Informe a descrição.'),
      tempo_estimado_min: tempo !== null && !(tempo >= 0) ? 'Use os minutos, ex.: 40.' : null,
      preco_base: Number.isNaN(preco) || preco < 0 ? 'Informe o preço, ex.: 120,00.' : null,
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    if (await salvar.executar({ descricao: form.descricao.trim(), tempo_estimado_min: tempo, preco_base: preco }))
      onSalvo()
  }

  if (excluir)
    return (
      <ModalConfirmacao
        aberto
        titulo={`Excluir “${servico.descricao}”?`}
        texto="O serviço sai do catálogo. As OS que já usaram ele não mudam."
        rotuloConfirmar="Excluir serviço"
        perigo
        carregando={apagar.executando}
        onCancelar={() => setExcluir(false)}
        onConfirmar={async () => (await apagar.executar(servico.id)) && onSalvo()}
      >
        {apagar.erro && <Aviso tom="perigo">{apagar.erro.message}</Aviso>}
      </ModalConfirmacao>
    )

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={editando ? 'Editar serviço' : 'Novo serviço'}
      rodape={
        <>
          {editando && (
            <Botao variante="fantasma" icone={Trash2} className="catalogo__excluir" onClick={() => setExcluir(true)}>
              Excluir
            </Botao>
          )}
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao carregando={salvar.executando} onClick={enviar}>
            Salvar serviço
          </Botao>
        </>
      }
    >
      <form className="pilha" onSubmit={enviar} noValidate>
        {salvar.erro && <Aviso tom="perigo">{salvar.erro.message}</Aviso>}
        <Campo rotulo="Descrição" value={form.descricao} onChange={mudar('descricao')} erro={erros.descricao} />
        <div className="catalogo__duas">
          <Campo
            rotulo="Tempo estimado (min)"
            tipo="number"
            min="0"
            value={form.tempo_estimado_min}
            onChange={mudar('tempo_estimado_min')}
            erro={erros.tempo_estimado_min}
            opcional
          />
          <Campo
            rotulo="Preço base (R$)"
            inputMode="decimal"
            value={form.preco_base}
            onChange={mudar('preco_base')}
            erro={erros.preco_base}
            placeholder="120,00"
          />
        </div>
      </form>
    </Modal>
  )
}

export default function ServicosPage() {
  const [texto, setTexto] = useState('')
  const busca = useDebounce(texto.trim(), 300)
  const { dados, carregando, erro, recarregar } = useApi(() => listarServicosCatalogo({ busca }), [busca])
  const [aberto, setAberto] = useState(null) // null | {} (novo) | serviço (editar)

  const salvou = () => {
    setAberto(null)
    recarregar()
  }

  let conteudo
  if (carregando && !dados) conteudo = <EstadoCarregando texto="Carregando serviços..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0)
    conteudo = (
      <EstadoVazio
        icone={Wrench}
        titulo={busca ? `Nenhum serviço com “${busca}”` : 'Nenhum serviço no catálogo'}
        acao={
          !busca && (
            <Botao icone={Plus} onClick={() => setAberto({})}>
              Novo serviço
            </Botao>
          )
        }
      />
    )
  else
    conteudo = (
      <>
        <div className="so-pc">
          <Tabela colunas={COLUNAS} linhas={dados} rotulo="Serviços" onClicarLinha={setAberto} />
        </div>
        <Cartao semEspaco className="so-celular">
          {dados.map((s) => (
            <button key={s.id} type="button" className="catalogo__linha" onClick={() => setAberto(s)}>
              <span className="catalogo__linha-textos">
                <span className="catalogo__linha-titulo">{s.descricao}</span>
                <span className="catalogo__linha-sub">Tempo estimado: {formatarDuracao(s.tempo_estimado_min)}</span>
              </span>
              <span className="catalogo__preco">{formatarMoeda(s.preco_base)}</span>
            </button>
          ))}
        </Cartao>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Serviços"
        tituloCelular="Serviços e peças"
        acoes={
          <Botao icone={Plus} onClick={() => setAberto({})}>
            Novo serviço
          </Botao>
        }
      />
      <div className="pagina">
        <AbasCatalogo ativa="servicos" />
        <p className="texto-secundario catalogo__ajuda">
          Catálogo de mão de obra. O valor cobrado em cada OS parte do preço base e pode ser ajustado.
        </p>
        <div className="catalogo__busca">
          <BarraBusca valor={texto} onChange={setTexto} placeholder="Nome do serviço" />
        </div>
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao icone={Plus} larguraTotal onClick={() => setAberto({})}>
          Novo serviço
        </Botao>
      </RodapeAcoes>
      {aberto && <ModalServico servico={aberto} onFechar={() => setAberto(null)} onSalvo={salvou} />}
    </>
  )
}
