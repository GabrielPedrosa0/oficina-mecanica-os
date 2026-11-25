// Tela "Nova ordem de serviço" (issue #46, especificação 3.5).
// Começa pela placa: se o veículo existe, o cliente e o km vêm dele. Serviços e peças
// são adicionados depois, no detalhe da OS.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import GrupoCampos from '../../components/ui/GrupoCampos'
import Interruptor from '../../components/ui/Interruptor'
import Modal from '../../components/ui/Modal'
import { useAcao, useApi } from '../../hooks/useApi'
import { listarMecanicos } from '../../services/mecanicosService'
import { cadastrarOrdem } from '../../services/ordensServicoService'
import { listarVeiculos } from '../../services/veiculosService'
import { deCampoDataHora } from '../../utils/formatadores'

const ID_FORMULARIO = 'form-nova-os'
const FORMULARIO_VAZIO = { km: '', previsao: '', mecanicoId: '', problema: '', observacoes: '', garantia: false }

// "qrs-4f21" -> "QRS4F21": compara placas sem depender de hífen ou caixa.
const normalizarPlaca = (texto) => texto.toUpperCase().replace(/[^A-Z0-9]/g, '')

export default function NovaOrdemPage() {
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [veiculo, setVeiculo] = useState(null) // o veículo achado pela placa
  const [placaBuscada, setPlacaBuscada] = useState('') // última placa pesquisada
  const [form, setForm] = useState(FORMULARIO_VAZIO)
  const [erros, setErros] = useState({})
  const [confirmarSaida, setConfirmarSaida] = useState(false)

  const mecanicos = useApi(listarMecanicos) // se falhar, só sobra "A definir"
  const busca = useAcao(listarVeiculos)
  const criar = useAcao(cadastrarOrdem)

  const naoAchou = placaBuscada !== '' && !veiculo
  const sujo = placa !== '' || Object.entries(form).some(([chave, valor]) => valor !== FORMULARIO_VAZIO[chave])

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  function mudarPlaca(texto) {
    setPlaca(texto)
    setVeiculo(null) // mudou a placa: o veículo anterior não vale mais
    setPlacaBuscada('')
    setErros((atual) => ({ ...atual, placa: undefined }))
  }

  // Ao sair do campo da placa, procura o veículo no backend.
  async function procurarVeiculo() {
    const procurada = normalizarPlaca(placa)
    if (procurada.length < 7 || procurada === placaBuscada) return
    const lista = await busca.executar({ placa: procurada })
    if (lista === null) return // erro de rede: aparece no Aviso
    const achado = lista.find((v) => normalizarPlaca(v.placa) === procurada) ?? null
    setPlacaBuscada(procurada)
    setVeiculo(achado)
    if (achado) setForm((atual) => ({ ...atual, km: String(achado.quilometragem ?? '') }))
  }

  function validar() {
    const novos = {}
    if (!veiculo) novos.placa = 'Informe a placa de um veículo cadastrado.'
    if (form.km !== '' && Number(form.km) < 0) novos.km = 'A quilometragem não pode ser negativa.'
    if (!form.problema.trim()) novos.problema = 'Descreva o problema relatado.'
    setErros(novos)
    return Object.keys(novos).length === 0
  }

  async function salvar(e) {
    e.preventDefault()
    if (!validar()) return
    const os = await criar.executar({
      veiculo_id: veiculo.id,
      mecanico_id: form.mecanicoId ? Number(form.mecanicoId) : null,
      quilometragem: form.km === '' ? null : Number(form.km),
      problema_relatado: form.problema.trim(),
      eh_garantia: form.garantia,
      data_previsao: deCampoDataHora(form.previsao),
      observacoes: form.observacoes.trim() || null,
    })
    if (os) navigate(`/ordens/${os.id}`)
  }

  function cancelar() {
    if (sujo) setConfirmarSaida(true)
    else navigate('/ordens')
  }

  const botoes = (
    <>
      <Botao variante="secundario" onClick={cancelar}>
        Cancelar
      </Botao>
      <Botao type="submit" form={ID_FORMULARIO} carregando={criar.executando}>
        Criar ordem
      </Botao>
    </>
  )

  return (
    <>
      <CabecalhoPagina titulo="Nova ordem de serviço" voltarPara="/ordens" acoes={botoes} />
      <div className="pagina">
        <form id={ID_FORMULARIO} className="pilha" onSubmit={salvar} noValidate>
          {criar.erro && (
            <Aviso tom="perigo" titulo="Não foi possível criar a ordem" onFechar={criar.limparErro}>
              {criar.erro.message}
            </Aviso>
          )}
          {busca.erro && (
            <Aviso tom="perigo" titulo="Não foi possível buscar o veículo" onFechar={busca.limparErro}>
              {busca.erro.message}
            </Aviso>
          )}

          <Cartao titulo="Veículo">
            <GrupoCampos colunas={2}>
              <Campo
                rotulo="Placa"
                value={placa}
                onChange={(e) => mudarPlaca(e.target.value)}
                onBlur={procurarVeiculo}
                placeholder="ABC1D23"
                maxLength={8}
                autoFocus
                erro={erros.placa}
                ajuda={busca.executando ? 'Procurando veículo...' : undefined}
              />
              <Campo
                rotulo="Km na entrada"
                tipo="number"
                min="0"
                value={form.km}
                onChange={(e) => mudar('km', e.target.value)}
                erro={erros.km}
              />
            </GrupoCampos>
            {veiculo && (
              <Aviso tom="sucesso" titulo={`${veiculo.marca} ${veiculo.modelo}`}>
                Cliente: {veiculo.cliente_nome ?? (veiculo.cliente_id ? `nº ${veiculo.cliente_id}` : 'sem cliente')}
              </Aviso>
            )}
            {naoAchou && (
              <Aviso tom="atencao" titulo="Veículo não encontrado">
                Nenhum veículo com essa placa.{' '}
                <Botao variante="sutil" tamanho="pequeno" para="/veiculos/novo">
                  Cadastrar veículo
                </Botao>
              </Aviso>
            )}
          </Cartao>

          <Cartao titulo="Atendimento">
            <GrupoCampos colunas={2}>
              <Campo
                rotulo="Previsão de entrega"
                tipo="datetime-local"
                opcional
                value={form.previsao}
                onChange={(e) => mudar('previsao', e.target.value)}
              />
              <Campo
                rotulo="Mecânico"
                tipo="select"
                value={form.mecanicoId}
                onChange={(e) => mudar('mecanicoId', e.target.value)}
              >
                <option value="">A definir</option>
                {(mecanicos.dados ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </Campo>
            </GrupoCampos>
            <Campo
              rotulo="Problema relatado"
              tipo="textarea"
              value={form.problema}
              onChange={(e) => mudar('problema', e.target.value)}
              erro={erros.problema}
            />
            <Campo
              rotulo="Observações"
              tipo="textarea"
              opcional
              value={form.observacoes}
              onChange={(e) => mudar('observacoes', e.target.value)}
            />
            <Interruptor
              rotulo="Retorno em garantia"
              ajuda="Serviço já feito, sem cobrança."
              ligado={form.garantia}
              onChange={(valor) => mudar('garantia', valor)}
            />
          </Cartao>

          <p className="texto-apoio">Serviços, peças e apontamentos são adicionados depois, no detalhe da OS.</p>
        </form>
      </div>
      <RodapeAcoes soCelular>{botoes}</RodapeAcoes>

      <Modal
        aberto={confirmarSaida}
        onFechar={() => setConfirmarSaida(false)}
        titulo="Sair sem salvar?"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setConfirmarSaida(false)}>
              Continuar editando
            </Botao>
            <Botao variante="perigo" onClick={() => navigate('/ordens')}>
              Sair sem salvar
            </Botao>
          </>
        }
      >
        <p>Os dados preenchidos serão perdidos.</p>
      </Modal>
    </>
  )
}
