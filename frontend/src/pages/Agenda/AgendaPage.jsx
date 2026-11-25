// Agenda: OS com previsão de entrega num dia (guia 3.9). Integrante 4.
// Fora do menu do MVP; abre pelo endereço /agenda ou pelo link "Agenda" do Painel.
import { useState } from 'react'
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import CartaoOS from '../../components/os/CartaoOS'
import TabelaOS from '../../components/os/TabelaOS'
import { useApi } from '../../hooks/useApi'
import { consultarAgenda } from '../../services/agendaService'
import { formatarData, plural } from '../../utils/formatadores'
import './agenda.css'

const doisDigitos = (n) => String(n).padStart(2, '0')
const paraCampo = (d) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`

function somarDias(texto, dias) {
  const [a, m, d] = texto.split('-').map(Number)
  return paraCampo(new Date(a, m - 1, d + dias))
}

export default function AgendaPage() {
  const [dia, setDia] = useState(() => paraCampo(new Date()))
  const { dados, carregando, erro, recarregar } = useApi(() => consultarAgenda(dia), [dia])

  let conteudo
  if (carregando && !dados) conteudo = <EstadoCarregando texto="Carregando agenda..." />
  else if (erro) conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  else if (dados.itens.length === 0)
    conteudo = (
      <EstadoVazio icone={CalendarCheck} titulo={`Nenhuma entrega prevista para ${formatarData(`${dia}T12:00:00`)}.`} />
    )
  else
    conteudo = (
      <>
        <p className="texto-secundario agenda__total">
          {plural(dados.total, 'entrega prevista', 'entregas previstas')}
        </p>
        <div className="lista-cartoes-os so-celular">
          {dados.itens.map((os) => (
            <CartaoOS key={os.id} ordem={os} />
          ))}
        </div>
        <div className="so-pc">
          <TabelaOS ordens={dados.itens} />
        </div>
      </>
    )

  return (
    <>
      <CabecalhoPagina titulo="Agenda" voltarPara={-1} />
      <div className="pagina">
        <div className="agenda__dia">
          <Botao
            variante="secundario"
            icone={ChevronLeft}
            aria-label="Dia anterior"
            onClick={() => setDia(somarDias(dia, -1))}
          />
          <Campo rotulo="Dia" tipo="date" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} />
          <Botao
            variante="secundario"
            icone={ChevronRight}
            aria-label="Próximo dia"
            onClick={() => setDia(somarDias(dia, 1))}
          />
          <Botao variante="fantasma" onClick={() => setDia(paraCampo(new Date()))}>
            Hoje
          </Botao>
        </div>
        {conteudo}
      </div>
    </>
  )
}
