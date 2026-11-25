// Abas "Serviços | Peças" do celular (Figma "Celular — Serviços e peças"). Integrante 4.
import Abas from '../../components/ui/Abas'

const ABAS = [
  { valor: 'servicos', rotulo: 'Serviços', para: '/servicos' },
  { valor: 'pecas', rotulo: 'Peças', para: '/pecas' },
]

export default function AbasCatalogo({ ativa }) {
  return (
    <div className="so-celular">
      <Abas opcoes={ABAS} valor={ativa} rotulo="Serviços e peças" />
    </div>
  )
}
