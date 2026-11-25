// Serviços e peças da OS, cada grupo com o seu “+ Adicionar”, e os totais (Figma "Detalhe da OS"). Integrante 3.
// Item: { id, tipo: 'servico' | 'peca', descricao, codigo, quantidade, valor_unitario, tempo_estimado_min }
// Total = soma de quantidade × valor (especificação 3.4); passe `total` se o backend já mandar.
//
//   <ItensOS itens={itens} onAdicionar={(tipo) => abrirModal(tipo)} onEditar={editar} onRemover={remover} />
//   <ItensOS itens={itens} somenteLeitura />            (OS entregue ou cancelada)
import { Pencil, Trash2 } from 'lucide-react'
import Botao from '../ui/Botao'
import { formatarDuracao, formatarMoeda } from '../../utils/formatadores'
import { separarItens } from '../../utils/ordemServico'
import './os.css'

function detalhesDoItem(item) {
  const qtd = Number(item.quantidade ?? 1)
  const unitario = `${qtd} × ${formatarMoeda(item.valor_unitario)}`
  if (item.tipo === 'servico') {
    return [
      'Mão de obra',
      unitario,
      item.tempo_estimado_min && `tempo estimado ${formatarDuracao(item.tempo_estimado_min)}`,
    ]
      .filter(Boolean)
      .join(' · ')
  }
  return [item.codigo, unitario].filter(Boolean).join(' · ')
}

function Grupo({ titulo, itens, rotuloAdicionar, onAdicionar, onEditar, onRemover, somenteLeitura, vazio }) {
  const mostrarAcoes = !somenteLeitura && (onEditar || onRemover)
  return (
    <section className="itens-os__grupo">
      <header className="itens-os__cabecalho">
        <h3 className="itens-os__titulo">{titulo}</h3>
        {onAdicionar && !somenteLeitura && (
          <button type="button" className="itens-os__adicionar" onClick={onAdicionar}>
            + Adicionar <span className="so-pc">{rotuloAdicionar}</span>
          </button>
        )}
      </header>
      {itens.length === 0 ? (
        <p className="itens-os__vazio">{vazio}</p>
      ) : (
        <ul className="itens-os__lista">
          {itens.map((item) => (
            <li key={item.id ?? item.descricao} className="itens-os__item">
              <div className="itens-os__textos">
                <span className="itens-os__descricao">{item.descricao}</span>
                <span className="itens-os__detalhes">{detalhesDoItem(item)}</span>
              </div>
              <span className="itens-os__valor">
                {formatarMoeda(Number(item.quantidade ?? 1) * Number(item.valor_unitario ?? 0))}
              </span>
              {mostrarAcoes && (
                <span className="itens-os__acoes">
                  {onEditar && (
                    <Botao
                      variante="fantasma"
                      tamanho="pequeno"
                      icone={Pencil}
                      aria-label={`Editar ${item.descricao}`}
                      onClick={() => onEditar(item)}
                    />
                  )}
                  {onRemover && (
                    <Botao
                      variante="fantasma"
                      tamanho="pequeno"
                      icone={Trash2}
                      aria-label={`Remover ${item.descricao}`}
                      onClick={() => onRemover(item)}
                    />
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function ItensOS({ itens = [], total, onAdicionar, onEditar, onRemover, somenteLeitura = false }) {
  const { servicos, pecas, totalServicos, totalPecas } = separarItens(itens)
  const valorTotal = total ?? totalServicos + totalPecas
  const comuns = { onEditar, onRemover, somenteLeitura }

  return (
    <div className="itens-os">
      <Grupo
        titulo="Serviços"
        itens={servicos}
        rotuloAdicionar="serviço"
        vazio="Nenhum serviço lançado ainda."
        onAdicionar={onAdicionar && (() => onAdicionar('servico'))}
        {...comuns}
      />
      <Grupo
        titulo="Peças"
        itens={pecas}
        rotuloAdicionar="peça"
        vazio="Nenhuma peça lançada ainda."
        onAdicionar={onAdicionar && (() => onAdicionar('peca'))}
        {...comuns}
      />
      <div className="itens-os__totais">
        <p className="itens-os__subtotal">
          <span>Serviços</span>
          <span>{formatarMoeda(totalServicos)}</span>
        </p>
        <p className="itens-os__subtotal">
          <span>Peças</span>
          <span>{formatarMoeda(totalPecas)}</span>
        </p>
        <p className="itens-os__total">
          <span>Total</span>
          <span className="itens-os__total-valor">{formatarMoeda(valorTotal)}</span>
        </p>
      </div>
    </div>
  )
}
