import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import './ui.css'

export default function Botao({
  variante = 'primario', // primario | secundario | sutil | fantasma | perigo
  tamanho, // grande | medio | pequeno  (vazio = 48 px no celular, 40 px no PC)
  icone: Icone,
  iconeDireita: IconeDireita,
  carregando = false,
  larguraTotal = false,
  para, // caminho do react-router: renderiza <Link>
  type = 'button',
  disabled,
  className = '',
  children,
  ...resto
}) {
  const classes = [
    'botao',
    `botao--${variante}`,
    tamanho && `botao--${tamanho}`,
    larguraTotal && 'botao--largura-total',
    !children && 'botao--so-icone',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const tamanhoIcone = tamanho === 'pequeno' ? 16 : 20
  const conteudo = (
    <>
      {carregando ? (
        <LoaderCircle size={tamanhoIcone} className="girando" aria-hidden="true" />
      ) : (
        Icone && <Icone size={tamanhoIcone} aria-hidden="true" />
      )}
      {children && <span>{children}</span>}
      {IconeDireita && !carregando && <IconeDireita size={tamanhoIcone} aria-hidden="true" />}
    </>
  )

  if (para && !disabled) {
    return (
      <Link to={para} className={classes} {...resto}>
        {conteudo}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {conteudo}
    </button>
  )
}
