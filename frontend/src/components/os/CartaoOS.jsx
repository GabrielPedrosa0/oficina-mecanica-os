import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import Placa from '../ui/Placa'
import SeloStatus from '../ui/SeloStatus'
import { formatarNumeroOS, formatarPrevisao } from '../../utils/formatadores'
import { resumoServico } from '../../utils/ordemServico'
import './os.css'

export default function CartaoOS({ ordem, para, onClick }) {
  const destino = para ?? `/ordens/${ordem.id}`
  const resumo = [ordem.cliente_nome, resumoServico(ordem)].filter(Boolean).join(' · ')

  const conteudo = (
    <>
      <div className="cartao-os__topo">
        <span className="cartao-os__numero">{formatarNumeroOS(ordem.id)}</span>
        <SeloStatus status={ordem.status} />
      </div>
      <p className="cartao-os__veiculo">{ordem.veiculo || 'Veículo sem modelo'}</p>
      {resumo && <p className="cartao-os__resumo">{resumo}</p>}
      <div className="cartao-os__rodape">
        <Placa placa={ordem.placa} />
        <span className="cartao-os__previsao">
          <Clock size={16} aria-hidden="true" />
          {formatarPrevisao(ordem.data_previsao)}
        </span>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className="cartao-os" onClick={() => onClick(ordem)}>
        {conteudo}
      </button>
    )
  }
  return (
    <Link to={destino} className="cartao-os">
      {conteudo}
    </Link>
  )
}
