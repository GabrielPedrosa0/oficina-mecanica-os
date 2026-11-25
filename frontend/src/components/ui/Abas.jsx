// Abas para trocar entre duas ou três visões da mesma tela (Figma "Celular — Serviços e peças"). Integrante 6.
// Com `para`, cada aba é um link (troca de tela); sem, é só um estado (troca o conteúdo na mesma tela).
//
//   <Abas opcoes={[{ valor: 'servicos', rotulo: 'Serviços' }, { valor: 'pecas', rotulo: 'Peças' }]}
//         valor={aba} onChange={setAba} />
//   <Abas opcoes={[{ valor: 'servicos', rotulo: 'Serviços', para: '/servicos' }, ...]} valor="servicos" />
import { Link } from 'react-router-dom'
import './ui.css'

export default function Abas({ opcoes, valor, onChange, rotulo = 'Visões' }) {
  return (
    <div className="abas" role="tablist" aria-label={rotulo}>
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor
        const props = {
          role: 'tab',
          'aria-selected': ativa,
          className: `abas__aba ${ativa ? 'abas__aba--ativa' : ''}`,
        }
        return opcao.para ? (
          <Link key={opcao.valor} {...props} to={opcao.para} replace>
            {opcao.rotulo}
          </Link>
        ) : (
          <button key={opcao.valor} {...props} type="button" onClick={() => onChange?.(opcao.valor)}>
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
