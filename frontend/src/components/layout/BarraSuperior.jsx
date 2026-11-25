// Barra branca do topo, no PC: busca geral (placa, cliente ou OS) e o sino. Integrante 6.
// No celular o topo é o CabecalhoPagina de cada tela (título + voltar), então esta barra some.
import { Bell } from 'lucide-react'
import Botao from '../ui/Botao'
import BuscaGeral from './BuscaGeral'
import './layout.css'

export default function BarraSuperior({ direita }) {
  return (
    <header className="barra-superior">
      <BuscaGeral />
      <div className="barra-superior__direita">
        {direita}
        {/* Sino: reservado para notificações; sem função nesta versão (especificação 3.2). */}
        <Botao variante="fantasma" icone={Bell} aria-label="Notificações" />
      </div>
    </header>
  )
}
