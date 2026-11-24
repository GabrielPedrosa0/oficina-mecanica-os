// Tela de login (especificação 3.8): e-mail + senha -> POST /api/auth/login.
// Deu certo: volta para a página que a pessoa tentou abrir (ou para o início).
// Também tem o "Esqueci minha senha", que chama POST /api/auth/esqueci-senha.
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn, Mail } from 'lucide-react'
import Logo from '../../components/layout/Logo'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import { useAcao } from '../../hooks/useApi'
import { entrar, esqueciSenha, estaLogado } from '../../services/authService'
import './login.css'

const EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function validar(email, senha, pedirSenha = true) {
  const erros = {}
  if (!email.trim()) erros.email = 'Informe o e-mail.'
  else if (!EMAIL_VALIDO.test(email.trim())) erros.email = 'E-mail inválido.'
  if (pedirSenha && !senha) erros.senha = 'Informe a senha.'
  return erros
}

export default function LoginPage() {
  const navigate = useNavigate()
  const local = useLocation()
  const destino = local.state?.de ?? '/'

  const [modo, setModo] = useState('entrar') // entrar | recuperar
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('')

  const login = useAcao(entrar)
  const recuperacao = useAcao(esqueciSenha)

  // Já está logado: não precisa ver o login de novo.
  if (estaLogado()) return <Navigate to={destino} replace />

  async function aoEntrar(e) {
    e.preventDefault()
    const encontrados = validar(email, senha)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const usuario = await login.executar(email, senha)
    if (usuario) navigate(destino, { replace: true })
  }

  async function aoRecuperar(e) {
    e.preventDefault()
    const encontrados = validar(email, '', false)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const resposta = await recuperacao.executar(email)
    if (resposta) setMensagemRecuperacao(resposta.mensagem)
  }

  function trocarModo(novo) {
    setModo(novo)
    setErros({})
    setMensagemRecuperacao('')
    login.limparErro()
    recuperacao.limparErro()
  }

  return (
    <div className="login">
      <aside className="login__marca" aria-hidden="true">
        <Logo />
        <div className="login__frase">
          <p className="login__frase-titulo">Ordens de serviço sem papelada.</p>
          <p className="login__frase-texto">Clientes, veículos, peças e mecânicos num só lugar.</p>
        </div>
      </aside>

      <main className="login__conteudo">
        <div className="login__cartao">
          <div className="login__logo-celular">
            <Logo claro={false} />
          </div>

          {modo === 'entrar' ? (
            <form onSubmit={aoEntrar} noValidate className="login__form">
              <header>
                <h1 className="login__titulo">Entrar</h1>
                <p className="login__subtitulo">Use o e-mail e a senha da sua conta na oficina.</p>
              </header>

              {login.erro && <Aviso tom="perigo">{login.erro.message}</Aviso>}

              <Campo
                rotulo="E-mail"
                tipo="email"
                icone={Mail}
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                erro={erros.email}
              />
              <Campo
                rotulo="Senha"
                tipo="senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                erro={erros.senha}
              />

              <button type="button" className="login__link" onClick={() => trocarModo('recuperar')}>
                Esqueci minha senha
              </button>

              <Botao type="submit" icone={LogIn} larguraTotal tamanho="grande" carregando={login.executando}>
                Entrar
              </Botao>
            </form>
          ) : (
            <form onSubmit={aoRecuperar} noValidate className="login__form">
              <header>
                <h1 className="login__titulo">Recuperar senha</h1>
                <p className="login__subtitulo">Informe seu e-mail e enviaremos as instruções.</p>
              </header>

              {recuperacao.erro && <Aviso tom="perigo">{recuperacao.erro.message}</Aviso>}
              {mensagemRecuperacao && <Aviso tom="sucesso">{mensagemRecuperacao}</Aviso>}

              <Campo
                rotulo="E-mail"
                tipo="email"
                icone={Mail}
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                erro={erros.email}
              />

              <Botao type="submit" larguraTotal tamanho="grande" carregando={recuperacao.executando}>
                Enviar instruções
              </Botao>
              <Botao variante="sutil" icone={ArrowLeft} larguraTotal onClick={() => trocarModo('entrar')}>
                Voltar para o login
              </Botao>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
