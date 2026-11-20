import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Placa from '../ui/Placa'
import SeloStatus from '../ui/SeloStatus'
import { formatarKm } from '../../utils/formatadores'
import './veiculos.css'

export default function LinhaVeiculo({ veiculo, para, onClick, mostrarStatus = false }) {
  const modelo = [veiculo.marca, veiculo.modelo].filter(Boolean).join(' ')
  const dono = veiculo.cliente_nome ?? veiculo.cliente?.nome
  const conteudo = (
    <>
      <Placa placa={veiculo.placa} />
      <span className="linha-veiculo__textos">
        <span className="linha-veiculo__modelo">{[modelo, veiculo.ano].filter(Boolean).join(' · ')}</span>
        <span className="linha-veiculo__detalhe">
          {[dono, formatarKm(veiculo.quilometragem)].filter(Boolean).join(' · ')}
        </span>
      </span>
      {mostrarStatus && veiculo.status_os_aberta && <SeloStatus status={veiculo.status_os_aberta} />}
      {(para || onClick) && <ChevronRight size={20} className="linha-veiculo__seta" aria-hidden="true" />}
    </>
  )
  if (para) {
    return (
      <Link to={para} className="linha-veiculo linha-veiculo--clicavel">
        {conteudo}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" className="linha-veiculo linha-veiculo--clicavel" onClick={() => onClick(veiculo)}>
        {conteudo}
      </button>
    )
  }
  return <div className="linha-veiculo">{conteudo}</div>
}
