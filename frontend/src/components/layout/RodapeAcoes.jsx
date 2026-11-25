// Botões de ação de uma tela. Integrante 6.
// Celular: barra fixa no rodapé, acima das abas ("Nova ordem", "Enviar orçamento | Marcar pronta").
// PC: os botões ficam no fim do conteúdo, alinhados à direita.
//
//   <RodapeAcoes>
//     <Botao variante="secundario" icone={Send}>Enviar orçamento</Botao>
//     <Botao icone={Check}>Marcar pronta</Botao>
//   </RodapeAcoes>
import './layout.css'

export default function RodapeAcoes({ children, soCelular = false }) {
  return <div className={`rodape-acoes ${soCelular ? 'so-celular' : ''}`}>{children}</div>
}
