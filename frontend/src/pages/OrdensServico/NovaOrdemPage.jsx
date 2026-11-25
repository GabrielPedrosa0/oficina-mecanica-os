// Nova OS (Figma "PC — Nova OS" e "Celular — Nova OS"). Integrante 2.
// Placa primeiro: achou o veículo, o cliente aparece e o Km vem preenchido; não achou, cadastra e volta.
// Meta do teste com usuários: abrir uma OS em menos de 2 minutos.
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Car, Plus } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao, { Dado, GradeDados } from '../../components/ui/Cartao'
import Interruptor from '../../components/ui/Interruptor'
import { ModalConfirmacao } from '../../components/ui/Modal'
import Placa from '../../components/ui/Placa'
import SeloStatus from '../../components/ui/SeloStatus'
import { useAcao, useApi } from '../../hooks/useApi'
import { listarMecanicos } from '../../services/mecanicosService'
import { cadastrarOrdem } from '../../services/ordensServicoService'
import { listarVeiculos } from '../../services/veiculosService'
import { deCampoDataHora, formatarExpediente, formatarKm } from '../../utils/formatadores'
import {
  limparPlaca,
  obrigatorio,
  validar,
  validarNumeroNaoNegativo,
  validarPlaca,
  validarPrevisao,
} from '../../utils/validadores'
import './ordens.css'

const VAZIO = {
  placa: '',
  quilometragem: null, // null = ainda não digitado: mostra o Km do cadastro do veículo
  data_previsao: '',
  mecanico_id: '',
  problema_relatado: '',
  observacoes: '',
}

export default function NovaOrdemPage() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const placaInicial = limparPlaca(parametros.get('placa'))
  const [form, setForm] = useState({ ...VAZIO, placa: placaInicial })
  // A placa procurada (ao sair do campo ou Enter). Vindo do cadastro de veículo, já procura.
  const [placaBuscada, setPlacaBuscada] = useState(placaInicial)
  const [garantia, setGarantia] = useState(false)
  const [erros, setErros] = useState({})
  const [sair, setSair] = useState(false)

  const mecanicos = useApi(() => listarMecanicos())
  const placaValida = !validarPlaca(placaBuscada)
  const procura = useApi(() => listarVeiculos({ placa: placaBuscada }), [placaBuscada], { ativo: placaValida })
  const criar = useAcao(cadastrarOrdem)

  // O veículo vale enquanto a placa do campo for a mesma que foi procurada.
  const placaLimpa = limparPlaca(form.placa)
  const procurada = placaValida && placaBuscada === placaLimpa && !procura.carregando && !procura.erro
  const veiculo = procurada ? (procura.dados ?? []).find((v) => v.placa === placaLimpa) : null
  const naoAchou = procurada && procura.dados && !veiculo
  const km = form.quilometragem ?? String(veiculo?.quilometragem ?? '')

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const procurarVeiculo = () => setPlacaBuscada(placaLimpa)

  async function salvar(e) {
    e.preventDefault()
    const encontrados = validar({
      placa: validarPlaca(form.placa) ?? (veiculo ? null : 'Procure um veículo cadastrado com esta placa.'),
      quilometragem: validarNumeroNaoNegativo(km),
      data_previsao: validarPrevisao(form.data_previsao),
      problema_relatado: obrigatorio(form.problema_relatado, 'Descreva o problema relatado pelo cliente.'),
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const os = await criar.executar({
      veiculo_id: veiculo.id,
      quilometragem: km === '' ? null : Number(km),
      data_previsao: deCampoDataHora(form.data_previsao),
      mecanico_id: form.mecanico_id ? Number(form.mecanico_id) : null,
      problema_relatado: form.problema_relatado.trim(),
      observacoes: form.observacoes.trim() || null,
      eh_garantia: garantia,
      status: 'ORCAMENTO',
    })
    if (os) navigate(`/ordens/${os.id}`, { replace: true })
  }

  const preenchido = Object.values(form).some((v) => v !== '' && v !== null) || garantia
  const cancelar = () => (preenchido ? setSair(true) : navigate(-1))
  const voltarParaCa = `/ordens/nova?placa=${placaLimpa}`

  return (
    <>
      <CabecalhoPagina titulo="Nova ordem de serviço" tituloCelular="Nova OS" voltarPara={-1} />
      <form className="pagina nova-os" onSubmit={salvar} noValidate>
        {criar.erro && (
          <Aviso tom="perigo" titulo="Não foi possível criar a OS" onFechar={criar.limparErro}>
            {criar.erro.message}
          </Aviso>
        )}

        <Cartao titulo="Veículo">
          <div className="nova-os__veiculo">
            <Campo
              rotulo="Placa"
              value={form.placa}
              onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value, quilometragem: null }))}
              onBlur={procurarVeiculo}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  procurarVeiculo()
                }
              }}
              placeholder="ABC1D23"
              autoCapitalize="characters"
              autoFocus
              erro={erros.placa}
              ajuda={procura.carregando ? 'Procurando o veículo...' : 'Digite a placa e saia do campo para buscar.'}
            />
          </div>
          {procura.erro && <Aviso tom="perigo">{procura.erro.message}</Aviso>}
          {naoAchou && (
            <Aviso tom="atencao" titulo={`Nenhum veículo com a placa ${placaLimpa}`}>
              <p>Cadastre o veículo e volte para cá para abrir a OS.</p>
              <Botao
                variante="secundario"
                tamanho="pequeno"
                icone={Plus}
                para={`/veiculos/novo?placa=${placaLimpa}&voltar=${encodeURIComponent(voltarParaCa)}`}
              >
                Cadastrar veículo
              </Botao>
            </Aviso>
          )}
          {veiculo && (
            <>
              <GradeDados>
                <Dado rotulo="Veículo">
                  <span className="linha">
                    <Car size={16} aria-hidden="true" /> {veiculo.marca} {veiculo.modelo} · {veiculo.ano}
                  </span>
                </Dado>
                <Dado rotulo="Cliente">{veiculo.cliente_nome ?? 'Sem cliente vinculado'}</Dado>
                <Dado rotulo="Km no cadastro">{formatarKm(veiculo.quilometragem)}</Dado>
                <Dado rotulo="Placa">
                  <Placa placa={veiculo.placa} />
                </Dado>
              </GradeDados>
              {veiculo.os_aberta_id && (
                <Aviso tom="atencao" titulo="Este veículo já tem uma OS aberta">
                  <span className="linha">
                    <SeloStatus status={veiculo.status_os_aberta} />
                    <Link to={`/ordens/${veiculo.os_aberta_id}`} className="link-secao">
                      Abrir OS {veiculo.os_aberta_id}
                    </Link>
                  </span>
                </Aviso>
              )}
            </>
          )}
        </Cartao>

        <Cartao titulo="Ordem de serviço">
          <div className="detalhe-os__duas">
            <Campo
              rotulo="Km na entrada"
              tipo="number"
              min="0"
              inputMode="numeric"
              value={km}
              onChange={mudar('quilometragem')}
              erro={erros.quilometragem}
              opcional
            />
            <Campo
              rotulo="Previsão de entrega"
              tipo="datetime-local"
              value={form.data_previsao}
              onChange={mudar('data_previsao')}
              erro={erros.data_previsao}
              opcional
            />
          </div>
          <Campo
            rotulo="Mecânico"
            tipo="select"
            value={form.mecanico_id}
            onChange={mudar('mecanico_id')}
            opcional
            disabled={mecanicos.carregando}
            ajuda={mecanicos.erro ? `Não foi possível carregar os mecânicos: ${mecanicos.erro.message}` : undefined}
          >
            <option value="">A definir</option>
            {(mecanicos.dados ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} · {formatarExpediente(m.expediente_inicio, m.expediente_fim)}
              </option>
            ))}
          </Campo>
          <Campo
            rotulo="Problema relatado"
            tipo="textarea"
            maxLength={1000}
            value={form.problema_relatado}
            onChange={mudar('problema_relatado')}
            erro={erros.problema_relatado}
            placeholder="O que o cliente contou: barulho, luz acesa no painel, revisão..."
          />
          <Campo
            rotulo="Observações"
            tipo="textarea"
            maxLength={1000}
            value={form.observacoes}
            onChange={mudar('observacoes')}
            opcional
          />
          <Interruptor
            rotulo="Serviço em garantia"
            ajuda="Retorno de um serviço já feito; não é cobrado"
            ligado={garantia}
            onChange={setGarantia}
          />
        </Cartao>

        <p className="nova-os__nota">Serviços, peças e apontamentos são adicionados depois, no detalhe da OS.</p>

        <RodapeAcoes>
          <Botao variante="secundario" onClick={cancelar}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={criar.executando}>
            Criar ordem
          </Botao>
        </RodapeAcoes>
      </form>

      <ModalConfirmacao
        aberto={sair}
        titulo="Sair sem salvar?"
        texto="O que você preencheu nesta OS será perdido."
        rotuloConfirmar="Sair sem salvar"
        rotuloCancelar="Continuar editando"
        perigo
        onConfirmar={() => navigate(-1)}
        onCancelar={() => setSair(false)}
      />
    </>
  )
}
