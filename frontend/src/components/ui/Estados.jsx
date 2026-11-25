// Os três estados que TODA lista precisa ter (especificação 2.4): carregando, vazio e erro. Integrante 6.
//
//   if (carregando) return <EstadoCarregando />
//   if (erro) return <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
//   if (dados.length === 0) return (
//     <EstadoVazio titulo="Nenhuma OS encontrada" acao={<Botao para="/ordens/nova" icone={Plus}>Nova ordem</Botao>} />
//   )
import { CircleAlert, ClipboardList, LoaderCircle, RefreshCw } from 'lucide-react'
import Botao from './Botao'
import './ui.css'

export function EstadoCarregando({ texto = 'Carregando...' }) {
  return (
    <div className="estado" role="status" aria-live="polite">
      <LoaderCircle size={24} className="girando estado__icone" aria-hidden="true" />
      <p className="estado__texto">{texto}</p>
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
