import { CircleAlert, ClipboardList, RefreshCw } from 'lucide-react'
import Botao from './Botao'
import './ui.css'


export function EstadoCarregando({
  texto = 'Carregando...',
  formato = 'lista',
  formatoCelular,
  linhas = 3,
  colunas = 4,
}) {
  return (
    <div className="carregando" role="status" aria-live="polite" aria-busy="true">
      <span className="so-leitor">{texto}</span>
      {formatoCelular ? (
        <>
          <div className="so-pc" aria-hidden="true">
            <Esqueleto formato={formato} linhas={linhas} colunas={colunas} />
          </div>
          <div className="so-celular" aria-hidden="true">
            <Esqueleto formato={formatoCelular} linhas={linhas} colunas={colunas} />
          </div>
        </>
      ) : (
        <div aria-hidden="true">
          <Esqueleto formato={formato} linhas={linhas} colunas={colunas} />
        </div>
      )}
    </div>
  )
}

function Esqueleto({ formato, linhas, colunas }) {
  const repetir = (n) => Array.from({ length: n }, (_, i) => i)
  const largura = (i, base = 60, passo = 13) => `${base + ((i * passo) % 30)}%`

  if (formato === 'cartoes') {
    return (
      <div className="carregando-cartoes">
        {repetir(linhas).map((i) => (
          <div key={i} className="carregando-cartao">
            <div className="carregando__linha-entre">
              <span className="esqueleto" style={{ width: 72, height: 14 }} />
              <span className="esqueleto esqueleto--pilula" style={{ width: 88, height: 22 }} />
            </div>
            <span className="esqueleto" style={{ width: largura(i, 55), height: 18 }} />
            <span className="esqueleto" style={{ width: largura(i + 1, 40), height: 14 }} />
            <div className="carregando__linha-entre">
              <span className="esqueleto" style={{ width: 84, height: 24 }} />
              <span className="esqueleto" style={{ width: 96, height: 14 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (formato === 'tabela') {
    const grade = { gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }
    return (
      <div className="carregando-tabela">
        <div className="carregando-tabela__cabecalho" style={grade}>
          {repetir(colunas).map((c) => (
            <span key={c} className="esqueleto" style={{ width: c === 0 ? 72 : 56, height: 12 }} />
          ))}
        </div>
        {repetir(linhas).map((i) => (
          <div key={i} className="carregando-tabela__linha" style={grade}>
            {repetir(colunas).map((c) => (
              <span
                key={c}
                className={`esqueleto ${c === colunas - 1 ? 'esqueleto--pilula' : ''}`}
                style={{ width: c === colunas - 1 ? 80 : largura(i + c, 45, 17), height: c === colunas - 1 ? 22 : 14 }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }
  if (formato === 'bloco') {
    return (
      <div className="carregando-bloco">
        <span className="esqueleto" style={{ width: '35%', height: 18 }} />
        {repetir(linhas).map((i) => (
          <div key={i} className="carregando__linha-entre">
            <span className="esqueleto" style={{ width: largura(i, 40), height: 14 }} />
            <span className="esqueleto" style={{ width: 64, height: 14 }} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="carregando-lista">
      {repetir(linhas).map((i) => (
        <div key={i} className="carregando-lista__item">
          <span className="esqueleto esqueleto--circulo" style={{ width: 40, height: 40 }} />
          <span className="carregando-lista__textos">
            <span className="esqueleto" style={{ width: largura(i, 45), height: 16 }} />
            <span className="esqueleto" style={{ width: largura(i + 2, 30), height: 12 }} />
          </span>
        </div>
      ))}
    </div>
  )
}

export function EstadoVazio({ icone: Icone = ClipboardList, titulo, texto, acao }) {
  return (
    <div className="estado">
      <span className="estado__circulo">
        <Icone size={24} aria-hidden="true" />
      </span>
      <p className="estado__titulo">{titulo}</p>
      {texto && <p className="estado__texto">{texto}</p>}
      {acao}
    </div>
  )
}

export function EstadoErro({ titulo = 'Não foi possível carregar', mensagem, onTentarDeNovo }) {
  return (
    <div className="estado estado--erro" role="alert">
      <span className="estado__circulo">
        <CircleAlert size={24} aria-hidden="true" />
      </span>
      <p className="estado__titulo">{titulo}</p>
      {mensagem && <p className="estado__texto">{mensagem}</p>}
      {onTentarDeNovo && (
        <Botao variante="secundario" icone={RefreshCw} onClick={onTentarDeNovo}>
          Tentar de novo
        </Botao>
      )}
    </div>
  )
}
