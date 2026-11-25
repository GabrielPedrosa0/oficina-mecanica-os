// Veículos (Figma "PC — Veículos" e "Celular — Veículos"). Integrante 1.
// PC: tabela; celular: linhas de veículo. Clicar abre o editar.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Plus } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import LinhaVeiculo from '../../components/veiculos/LinhaVeiculo'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import Placa from '../../components/ui/Placa'
import SeloStatus from '../../components/ui/SeloStatus'
import Tabela from '../../components/ui/Tabela'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { listarVeiculos } from '../../services/veiculosService'
import { formatarKm } from '../../utils/formatadores'
import './veiculos.css'

const COLUNAS = [
  { chave: 'placa', rotulo: 'Placa', render: (v) => <Placa placa={v.placa} /> },
  { chave: 'marca', rotulo: 'Marca' },
  { chave: 'modelo', rotulo: 'Modelo' },
  { chave: 'ano', rotulo: 'Ano' },
  {
    chave: 'chassi',
    rotulo: 'Chassi',
    render: (v) => <span className="veiculos__chassi">{v.chassi || '—'}</span>,
  },
  { chave: 'cliente_nome', rotulo: 'Cliente', render: (v) => v.cliente_nome ?? '—' },
  {
    chave: 'quilometragem',
    rotulo: 'Km atual',
    direita: true,
    render: (v) => formatarKm(v.quilometragem),
  },
  {
    chave: 'status_os_aberta',
    rotulo: 'OS aberta',
    render: (v) => (v.status_os_aberta ? <SeloStatus status={v.status_os_aberta} /> : '—'),
  },
]

export default function ListaVeiculosPage() {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const busca = useDebounce(texto.trim(), 300)
  const { dados, carregando, erro, recarregar } = useApi(() => listarVeiculos({ busca }), [busca])

  const editar = (v) => navigate(`/veiculos/${v.id}/editar`)

  let conteudo
  if (carregando && !dados) conteudo = <EstadoCarregando texto="Carregando veículos..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0)
    conteudo = (
      <EstadoVazio
        icone={Car}
        titulo={busca ? `Nenhum veículo com “${busca}”` : 'Nenhum veículo cadastrado'}
        texto={busca ? 'Procure pela placa, chassi, modelo ou cliente.' : undefined}
        acao={
          !busca && (
            <Botao para="/veiculos/novo" icone={Plus}>
              Novo veículo
            </Botao>
          )
        }
      />
    )
  else
    conteudo = (
      <>
        <div className="so-pc">
          <Tabela colunas={COLUNAS} linhas={dados} rotulo="Veículos" onClicarLinha={editar} />
        </div>
        <Cartao semEspaco className="so-celular">
          {dados.map((v) => (
            <LinhaVeiculo key={v.id} veiculo={v} mostrarStatus para={`/veiculos/${v.id}/editar`} />
          ))}
        </Cartao>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Veículos"
        acoes={
          <Botao para="/veiculos/novo" icone={Plus}>
            Novo veículo
          </Botao>
        }
      />
      <div className="pagina">
        <div className="veiculos__busca">
          <BarraBusca valor={texto} onChange={setTexto} placeholder="Placa, chassi, modelo ou cliente" />
        </div>
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao para="/veiculos/novo" icone={Plus} larguraTotal>
          Novo veículo
        </Botao>
      </RodapeAcoes>
    </>
  )
}
