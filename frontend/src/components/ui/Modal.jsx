import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import Botao from './Botao'
import './ui.css'

export default function Modal({ aberto, onFechar, titulo, children, rodape, largura = 480 }) {
  const ref = useRef(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberto && !dialogo.open) dialogo.showModal()
    if (!aberto && dialogo.open) dialogo.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      className="modal"
      style={{ '--largura-modal': `${largura}px` }}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        onFechar?.()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onFechar?.() // clique fora da caixa
      }}
    >
      {aberto && (
        <div className="modal__caixa">
          <header className="modal__cabecalho">
            <h2 id={idTitulo} className="modal__titulo">
              {titulo}
            </h2>
            <Botao variante="fantasma" tamanho="pequeno" icone={X} aria-label="Fechar" onClick={onFechar} />
          </header>
          <div className="modal__corpo">{children}</div>
          {rodape && <footer className="modal__rodape">{rodape}</footer>}
        </div>
      )}
    </dialog>
  )
}

export function ModalConfirmacao({
  aberto,
  titulo,
  texto,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Voltar',
  perigo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
  children,
}) {
  return (
    <Modal
      aberto={aberto}
      onFechar={onCancelar}
      titulo={titulo}
      largura={420}
      rodape={
        <>
          <Botao variante="secundario" onClick={onCancelar}>
            {rotuloCancelar}
          </Botao>
          <Botao variante={perigo ? 'perigo' : 'primario'} carregando={carregando} onClick={onConfirmar}>
            {rotuloConfirmar}
          </Botao>
        </>
      }
    >
      {texto && <p className="modal__texto">{texto}</p>}
      {children}
    </Modal>
  )
}
