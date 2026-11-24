// Tela "Novo cliente" (issue #58): FormularioCliente vazio.
import { useNavigate } from 'react-router-dom'
import FormularioCliente from '../../components/clientes/FormularioCliente'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import { useAcao } from '../../hooks/useApi'
import { cadastrarCliente } from '../../services/clientesService'

export default function NovoClientePage() {
  const navigate = useNavigate()
  const { executar, executando, erro } = useAcao(cadastrarCliente)

  async function salvar(dados) {
    const novo = await executar(dados) // null se deu erro (a mensagem fica em `erro`)
    if (novo) navigate(`/clientes/${novo.id}`)
  }

  return (
    <>
      <CabecalhoPagina titulo="Novo cliente" voltarPara="/clientes" />
      <div className="pagina">
        <FormularioCliente textoBotao="Cadastrar" salvando={executando} erro={erro} onSalvar={salvar} />
      </div>
    </>
  )
}
