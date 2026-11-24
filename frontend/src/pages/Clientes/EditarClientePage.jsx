// Tela "Editar cliente" (issue #58): o MESMO FormularioCliente, já preenchido.
import { useNavigate, useParams } from 'react-router-dom'
import FormularioCliente from '../../components/clientes/FormularioCliente'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import { EstadoCarregando, EstadoErro } from '../../components/ui/Estados'
import { useAcao, useApi } from '../../hooks/useApi'
import { atualizarCliente, consultarCliente } from '../../services/clientesService'

export default function EditarClientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dados: cliente, carregando, erro, recarregar } = useApi(() => consultarCliente(id), [id])
  const salvar = useAcao(atualizarCliente)

  async function enviar(dados) {
    const atualizado = await salvar.executar(id, dados)
    if (atualizado) navigate(`/clientes/${id}`)
  }

  if (carregando) return <EstadoCarregando formato="bloco" texto="Carregando cliente..." />
  if (erro) return <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />

  return (
    <>
      <CabecalhoPagina titulo="Editar cliente" voltarPara={`/clientes/${id}`} />
      <div className="pagina">
        <FormularioCliente
          cliente={cliente}
          textoBotao="Salvar"
          salvando={salvar.executando}
          erro={salvar.erro}
          onSalvar={enviar}
        />
      </div>
    </>
  )
}
