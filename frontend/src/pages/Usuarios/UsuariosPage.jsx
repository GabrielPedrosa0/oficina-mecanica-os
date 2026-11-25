// Usuários e perfis (Figma "PC — Usuários"; no celular a entrada fica em Mais). Integrante 6.
// Só o Gerente vê esta tela (RotaPerfil em AppRoutes.jsx; o backend também confere).
import { useState } from 'react'
import { KeyRound, Plus, Trash2 } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Avatar from '../../components/ui/Avatar'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import ItemLista from '../../components/ui/ItemLista'
import Modal, { ModalConfirmacao } from '../../components/ui/Modal'
import { Selo } from '../../components/ui/SeloStatus'
import Tabela from '../../components/ui/Tabela'
import { LISTA_PERFIS, PERFIS } from '../../constants/perfis'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import { perfilDe, usuarioSalvo } from '../../services/authService'
import { atualizarUsuario, cadastrarUsuario, excluirUsuario, listarUsuarios } from '../../services/usuariosService'
import { obrigatorio, validar, validarEmail, validarSenha } from '../../utils/validadores'
import './usuarios.css'

const SeloPerfil = ({ perfil }) => {
  const dados = PERFIS[perfilDe({ perfil })]
  return <Selo tom={dados?.tom ?? 'neutro'}>{dados?.rotulo ?? perfil}</Selo>
}

const COLUNAS = [
  {
    chave: 'nome',
    rotulo: 'Nome',
    render: (u) => (
      <span className="usuarios__pessoa">
        <Avatar nome={u.nome} tamanho={32} /> {u.nome}
      </span>
    ),
  },
  { chave: 'email', rotulo: 'E-mail' },
  { chave: 'perfil', rotulo: 'Perfil', render: (u) => <SeloPerfil perfil={u.perfil} /> },
]

function ModalUsuario({ usuario, euId, onFechar, onSalvo }) {
  const editando = Boolean(usuario?.id)
  const souEu = editando && usuario.id === euId
  const [form, setForm] = useState({
    nome: usuario?.nome ?? '',
    email: usuario?.email ?? '',
    perfil: usuario?.perfil ? perfilDe(usuario) : 'RECEPCAO',
    senha: '',
  })
  const [erros, setErros] = useState({})
  const [excluir, setExcluir] = useState(false)
  const salvar = useAcao(editando ? (d) => atualizarUsuario(usuario.id, d) : cadastrarUsuario)
  const apagar = useAcao(excluindo(excluirUsuario))
  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function enviar(e) {
    e?.preventDefault()
    const encontrados = validar({
      nome: obrigatorio(form.nome, 'Informe o nome.'),
      email: validarEmail(form.email),
      senha: editando ? (form.senha ? validarSenha(form.senha) : null) : validarSenha(form.senha),
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const salvo = await salvar.executar({
      nome: form.nome.trim(),
      email: form.email.trim(),
      perfil: form.perfil,
      senha: form.senha || null,
    })
    if (salvo) onSalvo()
  }

  if (excluir)
    return (
      <ModalConfirmacao
        aberto
        titulo={`Excluir ${usuario.nome}?`}
        texto="A pessoa não consegue mais entrar no sistema."
        rotuloConfirmar="Excluir usuário"
        perigo
        carregando={apagar.executando}
        onCancelar={() => setExcluir(false)}
        onConfirmar={async () => (await apagar.executar(usuario.id)) && onSalvo()}
      >
        {apagar.erro && <Aviso tom="perigo">{apagar.erro.message}</Aviso>}
      </ModalConfirmacao>
    )

  const emailRepetido = salvar.erro?.status === 409 && /e-mail/i.test(salvar.erro.message) ? salvar.erro.message : null

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={editando ? 'Editar usuário' : 'Novo usuário'}
      rodape={
        <>
          {editando && !souEu && (
            <Botao variante="fantasma" icone={Trash2} className="usuarios__excluir" onClick={() => setExcluir(true)}>
              Excluir
            </Botao>
          )}
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao carregando={salvar.executando} onClick={enviar}>
            Salvar usuário
          </Botao>
        </>
      }
    >
      <form className="pilha" onSubmit={enviar} noValidate>
        {salvar.erro && !emailRepetido && <Aviso tom="perigo">{salvar.erro.message}</Aviso>}
        <Campo rotulo="Nome" value={form.nome} onChange={mudar('nome')} erro={erros.nome} />
        <Campo
          rotulo="E-mail"
          tipo="email"
          value={form.email}
          onChange={mudar('email')}
          erro={erros.email ?? emailRepetido}
          autoComplete="off"
        />
        <Campo
          rotulo="Perfil"
          tipo="select"
          value={form.perfil}
          onChange={mudar('perfil')}
          disabled={souEu}
          ajuda={souEu ? 'Você não pode tirar o seu próprio perfil de Gerente.' : undefined}
        >
          {LISTA_PERFIS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </Campo>
        <Campo
          rotulo={editando ? 'Nova senha' : 'Senha'}
          tipo="senha"
          value={form.senha}
          onChange={mudar('senha')}
          erro={erros.senha}
          autoComplete="new-password"
          opcional={editando}
          ajuda={editando ? 'Deixe em branco para manter a senha atual.' : 'Pelo menos 8 caracteres.'}
        />
      </form>
    </Modal>
  )
}

export default function UsuariosPage() {
  const { dados, carregando, erro, recarregar } = useApi(listarUsuarios)
  const [aberto, setAberto] = useState(null)
  const eu = usuarioSalvo()

  const salvou = () => {
    setAberto(null)
    recarregar()
  }

  let conteudo
  if (carregando && !dados) conteudo = <EstadoCarregando texto="Carregando usuários..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0) conteudo = <EstadoVazio icone={KeyRound} titulo="Nenhum usuário cadastrado" />
  else
    conteudo = (
      <>
        <div className="so-pc">
          <Tabela colunas={COLUNAS} linhas={dados} rotulo="Usuários" onClicarLinha={setAberto} />
        </div>
        <Cartao semEspaco className="so-celular">
          {dados.map((u) => (
            <ItemLista
              key={u.id}
              avatar={u.nome}
              titulo={u.nome}
              subtitulo={u.email}
              direita={<SeloPerfil perfil={u.perfil} />}
              onClick={() => setAberto(u)}
            />
          ))}
        </Cartao>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários"
        acoes={
          <Botao icone={Plus} onClick={() => setAberto({})}>
            Novo usuário
          </Botao>
        }
      />
      <div className="pagina">
        <p className="texto-secundario usuarios__ajuda">
          Quem pode entrar no sistema. Só o perfil Gerente vê esta tela.
        </p>
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao icone={Plus} larguraTotal onClick={() => setAberto({})}>
          Novo usuário
        </Botao>
      </RodapeAcoes>
      {aberto && <ModalUsuario usuario={aberto} euId={eu?.id} onFechar={() => setAberto(null)} onSalvo={salvou} />}
    </>
  )
}
