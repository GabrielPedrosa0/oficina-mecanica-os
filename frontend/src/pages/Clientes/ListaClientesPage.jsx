// Tela "Clientes" (issue #59): lista com busca pelo nome.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import ItemLista from '../../components/ui/ItemLista'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { listarClientes } from '../../services/clientesService'

export default function ListaClientesPage() {
  const [texto, setTexto] = useState('')
  const busca = useDebounce(texto.trim(), 300) // espera parar de digitar

  // useApi faz o useEffect + fetch por nós: busca ao abrir a tela e quando `busca` muda.
  const { dados: clientes, carregando, erro, recarregar } = useApi(() => listarClientes(busca), [busca])

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
        <BarraBusca valor={texto} onChange={setTexto} placeholder="Nome do cliente" />

        {carregando && <EstadoCarregando texto="Carregando clientes..." />}

        {erro && <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />}

        {!carregando && !erro && clientes.length === 0 && (
          <EstadoVazio titulo="Nenhum cliente encontrado" acao={<Botao para="/clientes/novo">Novo cliente</Botao>} />
        )}

        {!carregando && !erro && (
          <div>
            {clientes.map((cliente) => (
              <ItemLista
                key={cliente.id}
                avatar={cliente.nome}
                titulo={cliente.nome}
                subtitulo={cliente.telefone}
                para={`/clientes/${cliente.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
