// Peças e estoque (Figma "PC — Peças" e aba Peças do "Celular — Serviços e peças"). Integrante 4.
// A quantidade em estoque diminui quando a peça é lançada numa OS e aumenta na "Entrada de estoque".
import { useState } from 'react'
import { Package, PackagePlus, Plus, Trash2 } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Etiqueta from '../../components/ui/Etiqueta'
import Filtros from '../../components/ui/Filtros'
import Modal, { ModalConfirmacao } from '../../components/ui/Modal'
import Tabela from '../../components/ui/Tabela'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import {
  atualizarPeca,
  cadastrarPeca,
  excluirPeca,
  listarPecas,
  registrarEntradaEstoque,
} from '../../services/pecasService'
import { formatarMoeda } from '../../utils/formatadores'
import { paraNumero, paraTextoDecimal } from '../../utils/numeros'
import { estoqueBaixo } from '../../utils/ordemServico'
import { obrigatorio, validar } from '../../utils/validadores'
import AbasCatalogo from '../Servicos/AbasCatalogo'
import '../Servicos/catalogo.css'

const FILTROS = [
  { valor: '', rotulo: 'Todas' },
  { valor: 'baixo', rotulo: 'Estoque baixo' },
]

const COLUNAS = [
  { chave: 'codigo', rotulo: 'Código', render: (p) => <span className="catalogo__codigo">{p.codigo}</span> },
  { chave: 'descricao', rotulo: 'Descrição' },
  {
    chave: 'estoque',
    rotulo: 'Em estoque',
    render: (p) => (
      <span className="catalogo__descricao">
        {p.estoque} un.
        {estoqueBaixo(p) && <Etiqueta tom="atencao">Estoque baixo</Etiqueta>}
      </span>
    ),
  },
  { chave: 'estoque_minimo', rotulo: 'Mínimo', direita: true },
  { chave: 'preco_venda', rotulo: 'Preço de venda', direita: true, render: (p) => formatarMoeda(p.preco_venda) },
]

const inteiro = (texto) => (String(texto).trim() === '' ? NaN : Number(texto))

function ModalPeca({ peca, onFechar, onSalvo }) {
  const editando = Boolean(peca?.id)
  const [form, setForm] = useState({
    codigo: peca?.codigo ?? '',
    descricao: peca?.descricao ?? '',
    estoque: String(peca?.estoque ?? '0'),
    estoque_minimo: String(peca?.estoque_minimo ?? '0'),
    preco_venda: paraTextoDecimal(peca?.preco_venda),
  })
  const [erros, setErros] = useState({})
  const [excluir, setExcluir] = useState(false)
  const salvar = useAcao(editando ? (d) => atualizarPeca(peca.id, d) : cadastrarPeca)
  const apagar = useAcao(excluindo(excluirPeca))
  const mudar = (campo, transformar) => (e) =>
    setForm((f) => ({ ...f, [campo]: transformar ? transformar(e.target.value) : e.target.value }))

  async function enviar(e) {
    e?.preventDefault()
    const preco = paraNumero(form.preco_venda)
    const estoque = inteiro(form.estoque)
    const minimo = inteiro(form.estoque_minimo)
    const encontrados = validar({
      codigo: obrigatorio(form.codigo, 'Informe o código.'),
      descricao: obrigatorio(form.descricao, 'Informe a descrição.'),
      estoque: !editando && !(Number.isInteger(estoque) && estoque >= 0) ? 'Use um número inteiro, ex.: 10.' : null,
      estoque_minimo: !(Number.isInteger(minimo) && minimo >= 0) ? 'Use um número inteiro, ex.: 4.' : null,
      preco_venda: Number.isNaN(preco) || preco < 0 ? 'Informe o preço, ex.: 40,00.' : null,
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const salvo = await salvar.executar({
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      estoque: editando ? peca.estoque : estoque,
      estoque_minimo: minimo,
      preco_venda: preco,
    })
    if (salvo) onSalvo()
  }

  if (excluir)
    return (
      <ModalConfirmacao
        aberto
        titulo={`Excluir “${peca.descricao}”?`}
        texto="Peças já lançadas em ordens de serviço não podem ser excluídas."
        rotuloConfirmar="Excluir peça"
        perigo
        carregando={apagar.executando}
        onCancelar={() => setExcluir(false)}
        onConfirmar={async () => (await apagar.executar(peca.id)) && onSalvo()}
      >
        {apagar.erro && <Aviso tom="perigo">{apagar.erro.message}</Aviso>}
      </ModalConfirmacao>
    )

  const codigoRepetido = salvar.erro?.status === 409 ? salvar.erro.message : null

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={editando ? 'Editar peça' : 'Nova peça'}
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
            Salvar peça
          </Botao>
        </>
      }
    >
      <form className="pilha" onSubmit={enviar} noValidate>
        {salvar.erro && !codigoRepetido && <Aviso tom="perigo">{salvar.erro.message}</Aviso>}
        <Campo
          rotulo="Código"
          value={form.codigo}
          onChange={mudar('codigo', (v) => v.toUpperCase())}
          erro={erros.codigo ?? codigoRepetido}
          placeholder="FLT-OL-0098"
        />
        <Campo rotulo="Descrição" value={form.descricao} onChange={mudar('descricao')} erro={erros.descricao} />
        <div className="catalogo__duas">
          {editando ? (
            <Campo rotulo="Em estoque" value={`${peca.estoque} un.`} disabled ajuda="Muda pela entrada de estoque." />
          ) : (
            <Campo
              rotulo="Estoque inicial"
              tipo="number"
              min="0"
              value={form.estoque}
              onChange={mudar('estoque')}
              erro={erros.estoque}
            />
          )}
          <Campo
            rotulo="Estoque mínimo"
            tipo="number"
            min="0"
            value={form.estoque_minimo}
            onChange={mudar('estoque_minimo')}
            erro={erros.estoque_minimo}
            ajuda="Abaixo disso aparece “Estoque baixo”."
          />
        </div>
        <Campo
          rotulo="Preço de venda (R$)"
          inputMode="decimal"
          value={form.preco_venda}
          onChange={mudar('preco_venda')}
          erro={erros.preco_venda}
          placeholder="40,00"
        />
      </form>
    </Modal>
  )
}

function ModalEntrada({ pecas, pecaInicial, onFechar, onSalvo }) {
  const [pecaId, setPecaId] = useState(String(pecaInicial?.id ?? ''))
  const [quantidade, setQuantidade] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erros, setErros] = useState({})
  const registrar = useAcao(registrarEntradaEstoque)

  async function enviar(e) {
    e?.preventDefault()
    const qtd = inteiro(quantidade)
    const encontrados = validar({
      peca: obrigatorio(pecaId, 'Escolha a peça.'),
      quantidade: !(Number.isInteger(qtd) && qtd > 0) ? 'A quantidade precisa ser maior que zero.' : null,
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    if (await registrar.executar(Number(pecaId), { quantidade: qtd, observacao: observacao.trim() || null })) onSalvo()
  }

  const escolhida = pecas.find((p) => String(p.id) === pecaId)

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo="Entrada de estoque"
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao carregando={registrar.executando} onClick={enviar}>
            Registrar entrada
          </Botao>
        </>
      }
    >
      <form className="pilha" onSubmit={enviar} noValidate>
        {registrar.erro && <Aviso tom="perigo">{registrar.erro.message}</Aviso>}
        <Campo rotulo="Peça" tipo="select" value={pecaId} onChange={(e) => setPecaId(e.target.value)} erro={erros.peca}>
          <option value="">Escolha a peça</option>
          {pecas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.descricao} · {p.codigo}
            </option>
          ))}
        </Campo>
        {escolhida && (
          <p className="texto-secundario catalogo__ajuda">
            Hoje: {escolhida.estoque} em estoque (mínimo {escolhida.estoque_minimo}).
          </p>
        )}
        <Campo
          rotulo="Quantidade que chegou"
          tipo="number"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          erro={erros.quantidade}
        />
        <Campo
          rotulo="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Nota fiscal, fornecedor..."
          opcional
        />
      </form>
    </Modal>
  )
}

export default function PecasPage() {
  const [texto, setTexto] = useState('')
  const [filtro, setFiltro] = useState('')
  const busca = useDebounce(texto.trim(), 300)
  const { dados, carregando, erro, recarregar } = useApi(
    () => listarPecas({ busca, estoqueBaixo: filtro === 'baixo' }),
    [busca, filtro],
  )
  const todas = useApi(() => listarPecas()) // para o "Entrada de estoque" escolher entre todas
  const [modal, setModal] = useState(null) // { tipo: 'peca', peca } | { tipo: 'entrada', peca }

  const salvou = () => {
    setModal(null)
    recarregar()
    todas.recarregar()
  }

  let conteudo
  if (carregando && !dados) conteudo = <EstadoCarregando texto="Carregando peças..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0)
    conteudo = (
      <EstadoVazio
        icone={Package}
        titulo={
          busca ? `Nenhuma peça com “${busca}”` : filtro ? 'Nenhuma peça com estoque baixo' : 'Nenhuma peça cadastrada'
        }
        acao={
          !busca &&
          !filtro && (
            <Botao icone={Plus} onClick={() => setModal({ tipo: 'peca', peca: {} })}>
              Nova peça
            </Botao>
          )
        }
      />
    )
  else
    conteudo = (
      <>
        <div className="so-pc">
          <Tabela
            colunas={COLUNAS}
            linhas={dados}
            rotulo="Peças"
            onClicarLinha={(p) => setModal({ tipo: 'peca', peca: p })}
          />
        </div>
        <Cartao semEspaco className="so-celular">
          {dados.map((p) => (
            <button
              key={p.id}
              type="button"
              className="catalogo__linha"
              onClick={() => setModal({ tipo: 'peca', peca: p })}
            >
              <span className="catalogo__linha-textos">
                <span className="catalogo__linha-titulo">{p.descricao}</span>
                <span className={`catalogo__linha-sub ${estoqueBaixo(p) ? 'catalogo__linha-sub--alerta' : ''}`}>
                  {p.codigo} · {p.estoque} em estoque{estoqueBaixo(p) ? ' · estoque baixo' : ''}
                </span>
              </span>
              <span className="catalogo__preco">{formatarMoeda(p.preco_venda)}</span>
            </button>
          ))}
        </Cartao>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Peças"
        tituloCelular="Serviços e peças"
        acoes={
          <>
            <Botao variante="secundario" icone={PackagePlus} onClick={() => setModal({ tipo: 'entrada' })}>
              Entrada de estoque
            </Botao>
            <Botao icone={Plus} onClick={() => setModal({ tipo: 'peca', peca: {} })}>
              Nova peça
            </Botao>
          </>
        }
      />
      <div className="pagina">
        <AbasCatalogo ativa="pecas" />
        <p className="texto-secundario catalogo__ajuda">
          A quantidade em estoque diminui quando a peça é lançada em uma OS.
        </p>
        <div className="catalogo__barra">
          <div className="catalogo__busca">
            <BarraBusca valor={texto} onChange={setTexto} placeholder="Nome ou código da peça" />
          </div>
          <Filtros opcoes={FILTROS} valor={filtro} onChange={setFiltro} rotulo="Filtrar peças" />
        </div>
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao variante="secundario" icone={PackagePlus} onClick={() => setModal({ tipo: 'entrada' })}>
          Entrada
        </Botao>
        <Botao icone={Plus} onClick={() => setModal({ tipo: 'peca', peca: {} })}>
          Nova peça
        </Botao>
      </RodapeAcoes>
      {modal?.tipo === 'peca' && <ModalPeca peca={modal.peca} onFechar={() => setModal(null)} onSalvo={salvou} />}
      {modal?.tipo === 'entrada' && (
        <ModalEntrada
          pecas={todas.dados ?? []}
          pecaInicial={modal.peca}
          onFechar={() => setModal(null)}
          onSalvo={salvou}
        />
      )}
    </>
  )
}
