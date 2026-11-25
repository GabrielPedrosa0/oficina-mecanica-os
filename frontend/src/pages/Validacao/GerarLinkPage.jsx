// Validação -> Gerar link (dentro do app, com login). O aplicador digita o primeiro nome e
// recebe o link para mandar aos participantes (um link por aplicador, vale para muitas pessoas).
// Também baixa os dois CSV da análise.
import { useState } from 'react'
import { Copy, Download, Link2 } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { useAcao } from '../../hooks/useApi'
import { baixarEventos, baixarSessoes, gerarCodigoAplicador } from '../../services/validacaoService'
import '../../components/validacao/validacao.css'

export default function GerarLinkPage() {
  const [nome, setNome] = useState('')
  const [erroNome, setErroNome] = useState(null)
  const [link, setLink] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const gerar = useAcao(gerarCodigoAplicador)
  const baixar = useAcao((funcao) => funcao())

  async function gerarLink(e) {
    e.preventDefault()
    if (!nome.trim()) return setErroNome('Informe o seu primeiro nome.')
    setErroNome(null)
    const aplicador = await gerar.executar(nome.trim())
    if (aplicador) {
      setLink(`${window.location.origin}/validacao?a=${aplicador.codigo}`)
      setCopiado(false)
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
    } catch {
      setCopiado(false) // sem permissão: a pessoa copia o texto do link à mão
    }
  }

  return (
    <div className="pagina">
      <CabecalhoPagina titulo="Validação" subtitulo="Link do teste de usabilidade" />
      <Cartao titulo="Gerar link">
        <form onSubmit={gerarLink} className="pilha">
          <Campo rotulo="Seu primeiro nome" value={nome} onChange={(e) => setNome(e.target.value)} erro={erroNome} />
          {gerar.erro && <Aviso tom="perigo">{gerar.erro.message}</Aviso>}
          <Botao type="submit" icone={Link2} carregando={gerar.executando}>
            Gerar link
          </Botao>
        </form>
        {link && (
          <Aviso tom="sucesso" titulo="Mande este link para quantas pessoas quiser">
            <p className="validacao__link">{link}</p>
            <Botao variante="secundario" icone={Copy} onClick={copiar}>
              {copiado ? 'Copiado' : 'Copiar link'}
            </Botao>
          </Aviso>
        )}
      </Cartao>
      <Cartao titulo="Dados para a análise">
        {baixar.erro && <Aviso tom="perigo">{baixar.erro.message}</Aviso>}
        <Botao variante="secundario" icone={Download} onClick={() => baixar.executar(baixarSessoes)}>
          Sessões (CSV)
        </Botao>
        <Botao variante="secundario" icone={Download} onClick={() => baixar.executar(baixarEventos)}>
          Eventos (CSV)
        </Botao>
      </Cartao>
    </div>
  )
}
