// Marca provisória: chave inglesa num quadrado laranja + nome da oficina. Integrante 6.
// O nome vem de configuracao_oficina.nome_fantasia quando existir; até lá, "Sua Oficina".
import { Wrench } from 'lucide-react'
import './layout.css'

export default function Logo({ nome = 'Sua Oficina', soIcone = false, claro = true }) {
  return (
    <span className={`logo ${claro ? 'logo--claro' : ''}`}>
      <span className="logo__icone">
        <Wrench size={20} aria-hidden="true" />
      </span>
      {!soIcone && <span className="logo__nome">{nome}</span>}
    </span>
  )
}
