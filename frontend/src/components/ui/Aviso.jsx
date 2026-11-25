// Caixa de aviso dentro da tela (erro do login, alerta de OS aberta etc.). Integrante 6.
//
//   <Aviso tom="perigo">E-mail ou senha incorretos.</Aviso>
//   <Aviso tom="atencao" titulo="Este veículo já tem uma OS aberta">
//     <Link to="/ordens/1042">Abrir OS 1042</Link>
//   </Aviso>
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import './ui.css'

const ICONES = { info: Info, atencao: TriangleAlert, sucesso: CircleCheck, perigo: CircleAlert }

export default function Aviso({ tom = 'info', titulo, children, onFechar }) {
  const Icone = ICONES[tom] ?? Info
  return (
    <div className={`aviso aviso--${tom}`} role={tom === 'perigo' ? 'alert' : 'status'}>
      <Icone size={20} className="aviso__icone" aria-hidden="true" />
      <div className="aviso__textos">
        {titulo && <p className="aviso__titulo">{titulo}</p>}
        {children && <div className="aviso__texto">{children}</div>}
      </div>
      {onFechar && (
        <button type="button" className="aviso__fechar" onClick={onFechar} aria-label="Fechar aviso">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
