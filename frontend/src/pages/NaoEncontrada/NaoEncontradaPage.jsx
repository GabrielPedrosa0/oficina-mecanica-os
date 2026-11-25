// Página 404: endereço que não existe. Integrante 6.
import { ArrowLeft, SearchX } from 'lucide-react'
import Botao from '../../components/ui/Botao'
import { EstadoVazio } from '../../components/ui/Estados'

export default function NaoEncontradaPage() {
  return (
    <div className="pagina">
      <EstadoVazio
        icone={SearchX}
        titulo="Página não encontrada"
        texto="O endereço pode ter mudado ou estar errado. Volte para o painel e tente de novo."
        acao={
          <Botao para="/" variante="secundario" icone={ArrowLeft}>
            Voltar ao painel
          </Botao>
        }
      />
    </div>
  )
}
