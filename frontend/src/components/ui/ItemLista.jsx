// Linha de lista com avatar ou ícone, título, subtítulo e seta (Figma: item de cliente). Integrante 6.
//
//   <ItemLista avatar="Marina Souza" titulo="Marina Souza"
//              subtitulo="1 veículo · (85) 90000-0001" para="/clientes/1" />
//   <ItemLista icone={Car} titulo="Volkswagen Gol 1.6" subtitulo="QRS4F21" direita={<SeloStatus status="PRONTA" />} />
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Avatar from './Avatar'
import './ui.css'

export default function ItemLista({ avatar, icone: Icone, titulo, subtitulo, direita, para, onClick, ativo = false }) {
  const clicavel = Boolean(para || onClick)
  const conteudo = (
    <>
      {avatar && <Avatar nome={avatar} tamanho={40} />}
      {Icone && (
        <span className="item-lista__icone">
          <Icone size={20} aria-hidden="true" />
        </span>
      )}
      <span className="item-lista__textos">
        <span className="item-lista__titulo">{titulo}</span>
        {subtitulo && <span className="item-lista__subtitulo">{subtitulo}</span>}
      </span>
      {direita}
      {clicavel && <ChevronRight size={20} className="item-lista__seta" aria-hidden="true" />}
    </>
  )
  const classes = `item-lista ${clicavel ? 'item-lista--clicavel' : ''} ${ativo ? 'item-lista--ativo' : ''}`

  if (para) {
    return (
      <Link to={para} className={classes}>
        {conteudo}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {conteudo}
      </button>
    )
  }
  return <div className={classes}>{conteudo}</div>
}
