// Lugar reservado para uma tela que ainda não foi feita. Integrante 6.
// Cada integrante troca o <EmConstrucao> da sua página pelo conteúdo real.
//
//   <EmConstrucao titulo="Clientes" responsavel="Integrante 5" />
import { HardHat } from 'lucide-react'
import './ui.css'

export default function EmConstrucao({ titulo = 'Tela em construção', responsavel, descricao }) {
  return (
    <div className="em-construcao">
      <span className="estado__circulo estado__circulo--primario">
        <HardHat size={28} aria-hidden="true" />
      </span>
      <h1 className="t-h2">{titulo}</h1>
      <p className="estado__texto">{descricao ?? 'Esta tela ainda está sendo construída.'}</p>
      {responsavel && <p className="em-construcao__resp">Responsável: {responsavel}</p>}
    </div>
  )
}
