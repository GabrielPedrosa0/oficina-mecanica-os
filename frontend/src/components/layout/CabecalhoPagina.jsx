import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Botao from '../ui/Botao'
import './layout.css'

export default function CabecalhoPagina({ titulo, tituloCelular, subtitulo, voltarPara, acoes, acoesCelular, extra }) {
  const navigate = useNavigate()
  const voltar = () => (voltarPara === -1 ? navigate(-1) : navigate(voltarPara))

  return (
    <header className="cabecalho-pagina">
      <div className="cabecalho-pagina__linha">
        {voltarPara !== undefined && (
          <Botao
            variante="fantasma"
            icone={ArrowLeft}
            aria-label="Voltar"
            onClick={voltar}
            className="cabecalho-pagina__voltar"
          />
        )}
        <div className="cabecalho-pagina__textos">
          <h1 className="cabecalho-pagina__titulo">
            {tituloCelular ? (
              <>
                <span className="so-pc">{titulo}</span>
                <span className="so-celular">{tituloCelular}</span>
              </>
            ) : (
              titulo
            )}
          </h1>
          {subtitulo && <p className="cabecalho-pagina__subtitulo">{subtitulo}</p>}
        </div>
        {acoes && <div className="cabecalho-pagina__acoes so-pc">{acoes}</div>}
        {acoesCelular && <div className="cabecalho-pagina__acoes so-celular">{acoesCelular}</div>}
      </div>
      {extra}
    </header>
  )
}
