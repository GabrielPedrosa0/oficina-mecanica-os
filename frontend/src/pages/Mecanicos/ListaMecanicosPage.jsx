// Mecânicos (Figma "PC — Mecânicos" e "Celular — Mecânicos"). Integrante 1.
// PC: tabela. Celular: lista com avatar. Clicar abre o editar.
import { useNavigate } from 'react-router-dom'
import { HardHat, Plus } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Avatar from '../../components/ui/Avatar'
import Botao from '../../components/ui/Botao'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import ItemLista from '../../components/ui/ItemLista'
import Tabela from '../../components/ui/Tabela'
import { useApi } from '../../hooks/useApi'
import { listarMecanicos } from '../../services/mecanicosService'
import { formatarExpediente, plural } from '../../utils/formatadores'
import './mecanicos.css'

const AJUDA = 'O horário de expediente aparece na escolha do mecânico ao abrir uma OS.'

const emServico = (m) =>
  m.os_em_servico > 0 ? `${plural(m.os_em_servico, 'OS', 'OS')} em serviço` : 'sem OS no momento'

const COLUNAS = [
  {
    chave: 'nome',
    rotulo: 'Nome',
    render: (m) => (
      <span className="mecanicos__pessoa">
        <Avatar nome={m.nome} tamanho={32} /> {m.nome}
      </span>
    ),
  },
  { chave: 'cpf', rotulo: 'CPF', render: (m) => m.cpf ?? '—' },
  { chave: 'telefone', rotulo: 'Telefone', render: (m) => m.telefone ?? '—' },
  {
    chave: 'expediente',
    rotulo: 'Expediente',
    render: (m) => formatarExpediente(m.expediente_inicio, m.expediente_fim),
    valorOrdem: (m) => m.expediente_inicio,
  },
  { chave: 'os_em_servico', rotulo: 'OS em serviço', direita: true },
]

export default function ListaMecanicosPage() {
  const navigate = useNavigate()
  const { dados, carregando, erro, recarregar } = useApi(() => listarMecanicos())
  const editar = (m) => navigate(`/mecanicos/${m.id}/editar`)

  let conteudo
  if (carregando) conteudo = <EstadoCarregando texto="Carregando equipe..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.length === 0)
    conteudo = (
      <EstadoVazio
        icone={HardHat}
        titulo="Nenhum mecânico cadastrado"
        texto="Cadastre a equipe da oficina."
        acao={
          <Botao para="/mecanicos/novo" icone={Plus}>
            Novo mecânico
          </Botao>
        }
      />
    )
  else
    conteudo = (
      <>
        <div className="so-pc">
          <Tabela colunas={COLUNAS} linhas={dados} rotulo="Mecânicos" onClicarLinha={editar} />
        </div>
        <Cartao semEspaco className="so-celular">
          {dados.map((m) => (
            <ItemLista
              key={m.id}
              avatar={m.nome}
              titulo={m.nome}
              subtitulo={`${formatarExpediente(m.expediente_inicio, m.expediente_fim)} · ${emServico(m)}`}
              para={`/mecanicos/${m.id}/editar`}
            />
          ))}
        </Cartao>
      </>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Mecânicos"
        acoes={
          <Botao para="/mecanicos/novo" icone={Plus}>
            Novo mecânico
          </Botao>
        }
      />
      <div className="pagina">
        <p className="texto-secundario mecanicos__ajuda">{AJUDA}</p>
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao para="/mecanicos/novo" icone={Plus} larguraTotal>
          Novo mecânico
        </Botao>
      </RodapeAcoes>
    </>
  )
}
