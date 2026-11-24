// Tela de detalhe do cliente (issue #60): só leitura.
import { useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import Botao from '../../components/ui/Botao'
import Cartao, { Dado, GradeDados } from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro } from '../../components/ui/Estados'
import { useApi } from '../../hooks/useApi'
import { consultarCliente } from '../../services/clientesService'

export default function DetalheClientePage() {
  const { id } = useParams() // o :id do endereço /clientes/:id
  const { dados: cliente, carregando, erro, recarregar } = useApi(() => consultarCliente(id), [id])

  if (carregando) return <EstadoCarregando formato="bloco" texto="Carregando cliente..." />
  if (erro) return <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />

  return (
    <>
      <CabecalhoPagina
        titulo={cliente.nome}
        voltarPara="/clientes"
        acoes={
          <Botao variante="secundario" icone={Pencil} para={`/clientes/${id}/editar`}>
            Editar
          </Botao>
        }
      />
      <div className="pagina">
        <Cartao titulo="Dados do cliente">
          <GradeDados>
            <Dado rotulo="Telefone">{cliente.telefone}</Dado>
            <Dado rotulo="CPF ou CNPJ">{cliente.cpf_cnpj}</Dado>
            <Dado rotulo="E-mail">{cliente.email}</Dado>
            <Dado rotulo="Cidade">{cliente.cidade}</Dado>
          </GradeDados>
        </Cartao>
      </div>
    </>
  )
}
