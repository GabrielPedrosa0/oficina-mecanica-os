// Cartão "Apontamentos" do Detalhe da OS (issue #52): linha do tempo e "+ Registrar apontamento".
import { useState } from 'react'
import Aviso from '../ui/Aviso'
import Botao from '../ui/Botao'
import Campo from '../ui/Campo'
import Cartao from '../ui/Cartao'
import { EstadoCarregando, EstadoErro } from '../ui/Estados'
import Modal from '../ui/Modal'
import Apontamentos from './Apontamentos'
import { TIPOS_REGISTRAVEIS } from '../../constants/apontamentos'
import { useAcao, useApi } from '../../hooks/useApi'
import { listarApontamentos, registrarApontamento } from '../../services/ordensServicoService'

const LIMITE_DESCRICAO = 500

function ModalApontamento({ osId, onFechar, onSalvo }) {
  const [tipo, setTipo] = useState(TIPOS_REGISTRAVEIS[0].valor)
  const [descricao, setDescricao] = useState('')
  const [erroDescricao, setErroDescricao] = useState('')
  const registrar = useAcao((dados) => registrarApontamento(osId, dados))

  async function enviar(evento) {
    evento.preventDefault()
    const texto = descricao.trim()
    if (texto === '') return setErroDescricao('Escreva o que foi feito.')
    if (texto.length > LIMITE_DESCRICAO) return setErroDescricao(`Use até ${LIMITE_DESCRICAO} letras.`)
    if (await registrar.executar({ tipo, descricao: texto })) onSalvo()
  }

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo="Registrar apontamento"
      rodape={
        <>
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-apontamento" carregando={registrar.executando}>
            Registrar
          </Botao>
        </>
      }
    >
      <form id="form-apontamento" className="pilha" onSubmit={enviar} noValidate>
        {registrar.erro && (
          <Aviso tom="perigo" titulo="Não foi possível registrar">
            {registrar.erro.message}
          </Aviso>
        )}
        <Campo rotulo="Tipo" tipo="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_REGISTRAVEIS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.rotulo}
            </option>
          ))}
        </Campo>
        <Campo
          rotulo="O que foi feito"
          tipo="textarea"
          maxLength={LIMITE_DESCRICAO}
          value={descricao}
          erro={erroDescricao}
          onChange={(e) => {
            setDescricao(e.target.value)
            setErroDescricao('')
          }}
        />
      </form>
    </Modal>
  )
}

// `versao` muda quando algo na OS mudou por fora (ex.: mudança de status) e a lista deve ser buscada de novo.
export default function BlocoApontamentos({ osId, somenteLeitura = false, versao = 0 }) {
  const lista = useApi(() => listarApontamentos(osId), [osId, versao])
  const [aberto, setAberto] = useState(false)

  let conteudo
  if (lista.carregando && !lista.dados) conteudo = <EstadoCarregando formato="bloco" linhas={3} texto="Carregando apontamentos..." />
  else if (lista.erro && !lista.dados) conteudo = <EstadoErro mensagem={lista.erro.message} onTentarDeNovo={lista.recarregar} />
  else
    conteudo = (
      <Apontamentos
        apontamentos={lista.dados ?? []}
        somenteLeitura={somenteLeitura}
        onRegistrar={() => setAberto(true)}
      />
    )

  return (
    <Cartao className="detalhe-os__apontamentos">
      {conteudo}
      {aberto && (
        <ModalApontamento
          osId={osId}
          onFechar={() => setAberto(false)}
          onSalvo={() => {
            setAberto(false)
            lista.recarregar()
          }}
        />
      )}
    </Cartao>
  )
}
