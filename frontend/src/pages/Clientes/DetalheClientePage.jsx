// Detalhe do cliente no celular (Figma "Celular — Detalhe do cliente"). Integrante 5.
// No PC o mesmo conteúdo aparece à direita da lista; aqui ganha Editar, WhatsApp e Nova ordem.
import { useParams } from 'react-router-dom'
import { ClipboardList, MessageCircle, Pencil } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import DetalheCliente from '../../components/clientes/DetalheCliente'
import Botao from '../../components/ui/Botao'
import { useApi } from '../../hooks/useApi'
import { consultarCliente } from '../../services/clientesService'
import { linkWhatsApp } from '../../utils/formatadores'
import '../../components/clientes/clientes.css'

export default function DetalheClientePage() {
  const { id } = useParams()
  // Só para o telefone do WhatsApp; o DetalheCliente busca o resto.
  const { dados } = useApi(() => consultarCliente(id), [id])

  return (
    <>
      <CabecalhoPagina
        titulo={dados?.nome ?? 'Cliente'}
        voltarPara="/clientes"
        acoes={
          <>
            <Botao variante="secundario" icone={Pencil} para={`/clientes/${id}/editar`}>
              Editar
            </Botao>
            <Botao icone={ClipboardList} para="/ordens/nova">
              Nova ordem
            </Botao>
          </>
        }
        acoesCelular={
          <Botao variante="fantasma" icone={Pencil} aria-label="Editar cliente" para={`/clientes/${id}/editar`} />
        }
      />
      <div className="pagina">
        <DetalheCliente id={id} />
      </div>
      <RodapeAcoes soCelular>
        {dados?.telefone && (
          <a
            className="botao botao--secundario clientes__whatsapp"
            href={linkWhatsApp(dados.telefone)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        )}
        <Botao icone={ClipboardList} para="/ordens/nova">
          Nova ordem
        </Botao>
      </RodapeAcoes>
    </>
  )
}
