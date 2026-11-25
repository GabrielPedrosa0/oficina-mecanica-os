// Clientes (Figma "PC — Clientes": lista à esquerda e o cliente aberto à direita; "Celular — Clientes"). Integrante 5.
// No PC o cliente escolhido fica na URL (/clientes?id=3), assim dá para voltar a ele.
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import DetalheCliente from '../../components/clientes/DetalheCliente'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import ItemLista from '../../components/ui/ItemLista'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { listarClientes } from '../../services/clientesService'
import { plural } from '../../utils/formatadores'
import '../../components/clientes/clientes.css'

const subtitulo = (c) => `${plural(c.quantidade_veiculos ?? 0, 'veículo')} · ${c.telefone}`

export default function ListaClientesPage() {
  const [parametros, setParametros] = useSearchParams()
  const [texto, setTexto] = useState('')
  const busca = useDebounce(texto.trim(), 300)
  const { dados, carregando, erro, recarregar } = useApi(() => listarClientes({ nome: busca }), [busca])

  const lista = dados ?? []
  const idUrl = Number(parametros.get('id'))
  const selecionado = lista.find((c) => c.id === idUrl) ?? lista[0]
  const escolher = (c) => setParametros({ id: String(c.id) }, { replace: true })

  let conteudo
  if (carregando && !dados) conteudo = <EstadoCarregando texto="Carregando clientes..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (lista.length === 0)
    conteudo = (
      <EstadoVazio
        icone={Users}
        titulo={busca ? `Nenhum cliente com “${busca}”` : 'Nenhum cliente cadastrado'}
        texto={busca ? 'Procure pelo nome, CPF, telefone ou placa.' : 'Cadastre o primeiro cliente da oficina.'}
        acao={
          !busca && (
            <Botao para="/clientes/novo" icone={Plus}>
              Novo cliente
            </Botao>
          )
        }
      />
    )
  else
    conteudo = (
      <div className="clientes__colunas">
        <Cartao semEspaco className="clientes__lista">
          {lista.map((c) => (
            <div key={c.id}>
              <div className="so-pc">
                <ItemLista
                  avatar={c.nome}
                  titulo={c.nome}
                  subtitulo={subtitulo(c)}
                  ativo={c.id === selecionado?.id}
                  onClick={() => escolher(c)}
                />
              </div>
              <div className="so-celular">
                <ItemLista avatar={c.nome} titulo={c.nome} subtitulo={subtitulo(c)} para={`/clientes/${c.id}`} />
              </div>
            </div>
          ))}
        </Cartao>
        {selecionado && (
          <div className="so-pc">
            <DetalheCliente key={selecionado.id} id={selecionado.id} compacto />
          </div>
        )}
      </div>
    )

  return (
    <>
      <CabecalhoPagina
        titulo="Clientes"
        acoes={
          <Botao para="/clientes/novo" icone={Plus}>
            Novo cliente
          </Botao>
        }
      />
      <div className="pagina">
        <div className="clientes__busca">
          <BarraBusca valor={texto} onChange={setTexto} placeholder="Nome, CPF, telefone ou placa" />
        </div>
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao para="/clientes/novo" icone={Plus} larguraTotal>
          Novo cliente
        </Botao>
      </RodapeAcoes>
    </>
  )
}
