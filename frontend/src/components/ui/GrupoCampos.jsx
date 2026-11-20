import './ui.css'

export default function GrupoCampos({ titulo, descricao, colunas = 2, children }) {
  return (
    <fieldset className="grupo-campos" style={{ '--colunas': colunas }}>
      {titulo && <legend className="grupo-campos__titulo">{titulo}</legend>}
      {descricao && <p className="grupo-campos__descricao">{descricao}</p>}
      <div className="grupo-campos__grade">{children}</div>
    </fieldset>
  )
}
