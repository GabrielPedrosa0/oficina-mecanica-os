// Título da tela com botão de voltar e ações. Integrante 6.
// PC: título grande (H1) com as ações à direita.
// Celular: vira a barra branca do topo, fixa ao rolar ("← Título da tela  ⋮").
//
//   <CabecalhoPagina titulo="Painel" tituloCelular="Início" acoes={<Botao para="/ordens/nova" icone={Plus}>Nova ordem</Botao>} />
//   <CabecalhoPagina titulo="OS 1042" voltarPara="/ordens" acoesCelular={<Botao variante="fantasma" icone={EllipsisVertical} aria-label="Mais ações" />} />
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Botao from '../ui/Botao'
import './layout.css'

export default function CabecalhoPagina({ titulo, tituloCelular, subtitulo, voltarPara, acoes, acoesCelular, extra }) {
  const navigate = useNavigate()
  // Título da aba do navegador: "OS 1042 · Oficina App".
  useEffect(() => {
    if (typeof titulo === 'string') document.title = `${titulo} · Oficina App`
  }, [titulo])
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
