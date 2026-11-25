// Grupo de campos com título (Figma "Novo cliente": "Dados pessoais" e "Endereço"). Integrante 6.
// No PC os campos ficam em colunas; no celular, um embaixo do outro.
//
//   <GrupoCampos titulo="Endereço" colunas={3}>
//     <Campo rotulo="CEP" ... />
//     <Campo rotulo="Rua" className="ocupa-2" ... />    (ocupa-2 = duas colunas; ocupa-tudo = a linha toda)
//   </GrupoCampos>
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
