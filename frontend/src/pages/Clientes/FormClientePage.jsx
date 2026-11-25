// Novo cliente e editar cliente (Figma "PC — Novo cliente" e "Celular — Novo cliente"). Integrante 5.
// Em /clientes/novo e /clientes/:id/editar. "Dados pessoais" e "Endereço"; excluir só no editar.
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro } from '../../components/ui/Estados'
import GrupoCampos from '../../components/ui/GrupoCampos'
import { ModalConfirmacao } from '../../components/ui/Modal'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import { atualizarCliente, cadastrarCliente, consultarCliente, excluirCliente } from '../../services/clientesService'
import { formatarCep, formatarCpfCnpj, formatarTelefone } from '../../utils/formatadores'
import {
  obrigatorio,
  validar,
  validarCep,
  validarCpfCnpj,
  validarEmail,
  validarTelefone,
} from '../../utils/validadores'
import '../../components/clientes/clientes.css'

const CAMPOS = [
  'nome',
  'cpf_cnpj',
  'telefone',
  'email',
  'cep',
  'rua',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'uf',
]

// Máscara enquanto digita: só formata quando já tem todos os números.
const mascaraCpfCnpj = (v) => formatarCpfCnpj(v.replace(/[^\d./-]/g, ''))
const mascaraTelefone = (v) => formatarTelefone(v.replace(/[^\d() -]/g, ''))
const mascaraCep = (v) => formatarCep(v.replace(/[^\d-]/g, '').slice(0, 9))

// O 409 do backend vai para o campo certo.
function campoDoConflito(mensagem = '') {
  if (/e-mail/i.test(mensagem)) return 'email'
  if (/cpf|cnpj/i.test(mensagem)) return 'cpf_cnpj'
  return null
}

function Formulario({ cliente }) {
  const navigate = useNavigate()
  const editando = Boolean(cliente)
  const [dados, setDados] = useState(() => Object.fromEntries(CAMPOS.map((c) => [c, cliente?.[c] ?? ''])))
  const [erros, setErros] = useState({})
  const [excluir, setExcluir] = useState(false)
  const salvar = useAcao(editando ? (d) => atualizarCliente(cliente.id, d) : cadastrarCliente)
  const apagar = useAcao(excluindo(excluirCliente))

  const mudar = (campo, mascara) => (e) =>
    setDados((d) => ({ ...d, [campo]: mascara ? mascara(e.target.value) : e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    const encontrados = validar({
      nome: obrigatorio(dados.nome, 'Informe o nome.'),
      cpf_cnpj: validarCpfCnpj(dados.cpf_cnpj, { obrigatorio: false }),
      telefone: validarTelefone(dados.telefone),
      email: validarEmail(dados.email, { obrigatorio: false }),
      cep: validarCep(dados.cep),
      uf: dados.uf && !/^[a-zA-Z]{2}$/.test(dados.uf) ? 'Use a sigla, ex.: CE.' : null,
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const corpo = Object.fromEntries(CAMPOS.map((c) => [c, String(dados[c] ?? '').trim() || null]))
    corpo.uf = corpo.uf?.toUpperCase() ?? null
    corpo.nome = corpo.nome ?? ''
    corpo.telefone = corpo.telefone ?? ''
    if (editando) corpo.cliente_desde = cliente.cliente_desde
    const salvo = await salvar.executar(corpo)
    if (salvo) navigate(`/clientes/${salvo.id}`, { replace: true })
  }

  async function confirmarExclusao() {
    if (await apagar.executar(cliente.id)) navigate('/clientes', { replace: true })
  }

  const campoErro = salvar.erro?.status === 409 ? campoDoConflito(salvar.erro.message) : null
  const errosVisiveis = campoErro ? { ...erros, [campoErro]: salvar.erro.message } : erros

  return (
    <>
      <CabecalhoPagina
        titulo={editando ? 'Editar cliente' : 'Novo cliente'}
        voltarPara={-1}
        acoes={
          editando && (
            <Botao variante="secundario" icone={Trash2} onClick={() => setExcluir(true)}>
              Excluir cliente
            </Botao>
          )
        }
      />
      <form className="pagina form-cliente" onSubmit={enviar} noValidate>
        {salvar.erro && !campoErro && (
          <Aviso tom="perigo" titulo="Não foi possível salvar" onFechar={salvar.limparErro}>
            {salvar.erro.message}
          </Aviso>
        )}
        <Cartao>
          <GrupoCampos titulo="Dados pessoais" colunas={2}>
            <Campo
              rotulo="Nome"
              value={dados.nome}
              onChange={mudar('nome')}
              erro={errosVisiveis.nome}
              className="ocupa-tudo"
              autoComplete="name"
            />
            <Campo
              rotulo="CPF ou CNPJ"
              inputMode="numeric"
              value={dados.cpf_cnpj}
              onChange={mudar('cpf_cnpj', mascaraCpfCnpj)}
              erro={errosVisiveis.cpf_cnpj}
              opcional
            />
            <Campo
              rotulo="Telefone"
              tipo="tel"
              value={dados.telefone}
              onChange={mudar('telefone', mascaraTelefone)}
              erro={errosVisiveis.telefone}
              placeholder="(85) 90000-0000"
            />
            <Campo
              rotulo="E-mail"
              tipo="email"
              value={dados.email}
              onChange={mudar('email')}
              erro={errosVisiveis.email}
              opcional
              className="ocupa-tudo"
            />
          </GrupoCampos>
        </Cartao>
        <Cartao>
          <GrupoCampos titulo="Endereço" colunas={3}>
            <Campo
              rotulo="CEP"
              inputMode="numeric"
              value={dados.cep}
              onChange={mudar('cep', mascaraCep)}
              erro={errosVisiveis.cep}
              opcional
            />
            <Campo rotulo="Rua" value={dados.rua} onChange={mudar('rua')} className="ocupa-2" opcional />
            <Campo rotulo="Número" value={dados.numero} onChange={mudar('numero')} opcional />
            <Campo
              rotulo="Complemento"
              value={dados.complemento}
              onChange={mudar('complemento')}
              className="ocupa-2"
              opcional
            />
            <Campo rotulo="Bairro" value={dados.bairro} onChange={mudar('bairro')} opcional />
            <Campo rotulo="Cidade" value={dados.cidade} onChange={mudar('cidade')} opcional />
            <Campo
              rotulo="UF"
              value={dados.uf}
              onChange={mudar('uf', (v) => v.toUpperCase())}
              maxLength={2}
              erro={errosVisiveis.uf}
              opcional
            />
          </GrupoCampos>
        </Cartao>
        {editando && (
          <div className="so-celular">
            <Botao variante="fantasma" icone={Trash2} larguraTotal onClick={() => setExcluir(true)}>
              Excluir cliente
            </Botao>
          </div>
        )}
        <RodapeAcoes>
          <Botao variante="secundario" onClick={() => navigate(-1)}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={salvar.executando}>
            Salvar cliente
          </Botao>
        </RodapeAcoes>
      </form>

      <ModalConfirmacao
        aberto={excluir}
        titulo={`Excluir ${cliente?.nome ?? 'cliente'}?`}
        texto="O cadastro some da lista. Esta ação não pode ser desfeita."
        rotuloConfirmar="Excluir cliente"
        perigo
        carregando={apagar.executando}
        onCancelar={() => {
          apagar.limparErro()
          setExcluir(false)
        }}
        onConfirmar={confirmarExclusao}
      >
        {apagar.erro && <Aviso tom="perigo">{apagar.erro.message}</Aviso>}
      </ModalConfirmacao>
    </>
  )
}

export default function FormClientePage() {
  const { id } = useParams()
  const { dados, carregando, erro, recarregar } = useApi(() => consultarCliente(id), [id], { ativo: Boolean(id) })

  if (!id) return <Formulario />
  if (carregando) return <EstadoCarregando texto="Carregando cliente..." />
  if (erro)
    return (
      <div className="pagina">
        <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
      </div>
    )
  return <Formulario key={dados.id} cliente={dados} />
}
