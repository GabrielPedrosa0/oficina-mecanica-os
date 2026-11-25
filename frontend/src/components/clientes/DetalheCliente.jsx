// Detalhe do cliente: dados, endereço, veículos e histórico de ordens. Integrante 5.
// Usado à direita da lista no PC (pages/Clientes/ListaClientesPage) e sozinho no celular
// (pages/Clientes/DetalheClientePage).
import { Link } from 'react-router-dom'
import { ClipboardList, Pencil, Phone, Plus } from 'lucide-react'
import Botao from '../ui/Botao'
import Cartao, { Dado, GradeDados } from '../ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../ui/Estados'
import Avatar from '../ui/Avatar'
import SeloStatus from '../ui/SeloStatus'
import LinhaVeiculo from '../veiculos/LinhaVeiculo'
import { useApi } from '../../hooks/useApi'
import { consultarCliente, consultarHistoricoDoCliente, listarVeiculosDoCliente } from '../../services/clientesService'
import { formatarMesAno, formatarMoeda, formatarNumeroOS, linkTelefone, plural } from '../../utils/formatadores'
import { resumoServico } from '../../utils/ordemServico'
import './clientes.css'

const ou = (v) => v || '—'

function Veiculos({ clienteId }) {
  const { dados, carregando, erro, recarregar } = useApi(() => listarVeiculosDoCliente(clienteId), [clienteId])
  let conteudo
  if (carregando) conteudo = <EstadoCarregando />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0) conteudo = <p className="detalhe-cliente__vazio">Nenhum veículo cadastrado.</p>
  else
    conteudo = (
      <div className="detalhe-cliente__lista">
        {dados.map((v) => (
          <LinhaVeiculo
            key={v.id}
            veiculo={{ ...v, cliente_nome: null }}
            mostrarStatus
            para={`/veiculos/${v.id}/editar`}
          />
        ))}
      </div>
    )
  return (
    <Cartao
      titulo="Veículos"
      semEspaco
      acao={
        <Botao variante="fantasma" tamanho="pequeno" icone={Plus} para={`/veiculos/novo?cliente=${clienteId}`}>
          Adicionar
        </Botao>
      }
    >
      {conteudo}
    </Cartao>
  )
}

function Historico({ clienteId }) {
  const { dados, carregando, erro, recarregar } = useApi(() => consultarHistoricoDoCliente(clienteId), [clienteId])
  let conteudo
  if (carregando) conteudo = <EstadoCarregando />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0) conteudo = <p className="detalhe-cliente__vazio">Nenhuma ordem de serviço ainda.</p>
  else
    conteudo = (
      <ul className="detalhe-cliente__historico">
        {dados.map((os) => (
          <li key={os.id}>
            <Link to={`/ordens/${os.id}`} className="detalhe-cliente__os">
              <span className="detalhe-cliente__os-textos">
                <span className="detalhe-cliente__os-titulo">
                  {formatarNumeroOS(os.id)} · {resumoServico(os)}
                </span>
                <span className="detalhe-cliente__os-sub">
                  {formatarMesAno(os.data_abertura)} · {os.placa}
                </span>
              </span>
              <SeloStatus status={os.status} />
              <span className="detalhe-cliente__os-valor">{formatarMoeda(os.valor_total)}</span>
            </Link>
          </li>
        ))}
      </ul>
    )
  return (
    <Cartao titulo="Histórico de ordens" semEspaco>
      {conteudo}
    </Cartao>
  )
}

// `compacto`: no painel direito da lista do PC (sem os botões de rodapé do celular).
export default function DetalheCliente({ id, compacto = false }) {
  const { dados: c, carregando, erro, recarregar } = useApi(() => consultarCliente(id), [id])

  if (carregando) return <EstadoCarregando texto="Carregando cliente..." />
  if (erro?.status === 404) return <EstadoVazio titulo="Cliente não encontrado" texto="Ele pode ter sido excluído." />
  if (erro) return <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />

  const ruaNumero = [c.rua, c.numero].filter(Boolean).join(', ')
  const cidadeUf = [c.cidade, c.uf].filter(Boolean).join(' / ')

  return (
    <div className="detalhe-cliente">
      <div className="detalhe-cliente__topo">
        <Avatar nome={c.nome} tamanho={48} />
        <div className="detalhe-cliente__nome">
          <h2 className="t-h3">{c.nome}</h2>
          <p className="texto-secundario">{plural(c.quantidade_veiculos ?? 0, 'veículo')}</p>
        </div>
        {compacto && (
          <div className="detalhe-cliente__acoes">
            <Botao variante="secundario" icone={Pencil} para={`/clientes/${c.id}/editar`}>
              Editar
            </Botao>
            <Botao icone={ClipboardList} para="/ordens/nova">
              Nova ordem
            </Botao>
          </div>
        )}
      </div>

      <Cartao titulo="Dados">
        <GradeDados>
          <Dado rotulo="CPF / CNPJ">{ou(c.cpf_cnpj)}</Dado>
          <Dado rotulo="Cliente desde">{formatarMesAno(c.cliente_desde)}</Dado>
          <Dado rotulo="Telefone">
            <a className="detalhe-cliente__link" href={linkTelefone(c.telefone)}>
              <Phone size={14} aria-hidden="true" /> {c.telefone}
            </a>
          </Dado>
          <Dado rotulo="E-mail">{ou(c.email)}</Dado>
        </GradeDados>
      </Cartao>

      <Cartao titulo="Endereço">
        {ruaNumero || c.bairro || cidadeUf || c.cep ? (
          <GradeDados>
            <Dado rotulo="Rua e número">{ou(ruaNumero)}</Dado>
            <Dado rotulo="Complemento">{ou(c.complemento)}</Dado>
            <Dado rotulo="Bairro">{ou(c.bairro)}</Dado>
            <Dado rotulo="CEP">{ou(c.cep)}</Dado>
            <Dado rotulo="Cidade / UF">{ou(cidadeUf)}</Dado>
          </GradeDados>
        ) : (
          <p className="detalhe-cliente__vazio detalhe-cliente__vazio--sem-borda">Endereço não informado.</p>
        )}
      </Cartao>

      <Veiculos clienteId={c.id} />
      <Historico clienteId={c.id} />
    </div>
  )
}
