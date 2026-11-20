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
