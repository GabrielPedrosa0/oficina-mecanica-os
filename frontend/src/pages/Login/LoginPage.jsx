// Login e "Esqueci minha senha" (Figma "PC — Login" e "Celular — Login"). Integrante 6.
// Fora do layout (sem menu). Depois de entrar, volta para a tela que pediu login (ou o Painel).
import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../components/layout/Logo'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Modal from '../../components/ui/Modal'
import { useAcao } from '../../hooks/useApi'
import { entrar, esqueciSenha, estaLogado } from '../../services/authService'
import { validar, validarEmail } from '../../utils/validadores'
import './login.css'

function EsqueciSenha({ aberto, onFechar, emailInicial }) {
  const [email, setEmail] = useState(emailInicial)
  const [erroCampo, setErroCampo] = useState(null)
  const pedido = useAcao(esqueciSenha)
  const [resposta, setResposta] = useState(null)

  async function enviar(e) {
    e?.preventDefault()
    const erro = validarEmail(email)
    setErroCampo(erro)
    if (erro) return
    const r = await pedido.executar(email.trim())
    if (r) setResposta(r.mensagem)
  }

  function fechar() {
    setResposta(null)
    pedido.limparErro()
    onFechar()
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={fechar}
      titulo="Esqueci minha senha"
      rodape={
        resposta ? (
          <Botao onClick={fechar}>Voltar ao login</Botao>
        ) : (
          <>
            <Botao variante="secundario" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao carregando={pedido.executando} onClick={enviar}>
              Enviar instruções
            </Botao>
          </>
        )
      }
    >
      {resposta ? (
        <Aviso tom="sucesso">{resposta}</Aviso>
      ) : (
        <form className="pilha" onSubmit={enviar} noValidate>
          <p className="modal__texto">
            Informe o e-mail cadastrado. Enviaremos as instruções para criar uma nova senha.
          </p>
          {pedido.erro && <Aviso tom="perigo">{pedido.erro.message}</Aviso>}
          <Campo
            rotulo="E-mail"
            tipo="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erroCampo}
          />
        </form>
      )}
    </Modal>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [esqueci, setEsqueci] = useState(false)
  const login = useAcao(entrar)
  const aviso = location.state?.mensagem

  useEffect(() => {
    document.title = 'Entrar · Oficina App'
  }, [])

  const destino = location.state?.de?.pathname ? `${location.state.de.pathname}${location.state.de.search ?? ''}` : '/'

  if (estaLogado() && !login.executando) return <Navigate to={destino} replace />

  async function enviar(e) {
    e.preventDefault()
    const encontrados = validar({ email: validarEmail(email), senha: senha ? null : 'Informe a senha.' })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    if (await login.executar(email.trim(), senha)) navigate(destino, { replace: true })
  }

  return (
    <div className="login">
      <aside className="login__marca so-pc">
        <Logo />
        <div>
          <p className="login__frase">Ordens de serviço, clientes, mecânicos e peças em um só lugar.</p>
          <p className="login__apoio">
            Acompanhe cada veículo da entrada à entrega, com tudo o que foi feito registrado.
          </p>
        </div>
      </aside>

      <main className="login__area">
        <form className="login__form" onSubmit={enviar} noValidate>
          <div className="so-celular">
            <Logo claro={false} />
          </div>
          <div>
            <h1 className="t-h2">Entrar</h1>
            <p className="texto-secundario">Use o e-mail e a senha cadastrados pelo gerente.</p>
          </div>

          {aviso && !login.erro && <Aviso tom="atencao">{aviso}</Aviso>}
          {login.erro && (
            <Aviso tom="perigo">{login.erro.status === 401 ? 'E-mail ou senha incorretos.' : login.erro.message}</Aviso>
          )}

          <Campo
            rotulo="E-mail"
            tipo="email"
            autoComplete="username"
            placeholder="voce@oficina.com.br"
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
          <Botao type="submit" larguraTotal carregando={login.executando}>
            Entrar
          </Botao>
          <Botao variante="fantasma" larguraTotal onClick={() => setEsqueci(true)}>
            Esqueci minha senha
          </Botao>
        </form>
      </main>

      <EsqueciSenha key={String(esqueci)} aberto={esqueci} onFechar={() => setEsqueci(false)} emailInicial={email} />
    </div>
  )
}
