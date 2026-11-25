// Novo veículo e editar veículo (Figma "Celular — Novo veículo"). Integrante 1.
// /veiculos/novo, /veiculos/novo?cliente=3 (vem do detalhe do cliente), /veiculos/novo?placa=ABC1D23&voltar=...
// (vem da Nova OS: depois de salvar, volta para lá) e /veiculos/:id/editar.
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ClipboardList, Trash2 } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro } from '../../components/ui/Estados'
import { ModalConfirmacao } from '../../components/ui/Modal'
import SeloStatus from '../../components/ui/SeloStatus'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import { listarClientes } from '../../services/clientesService'
import { atualizarVeiculo, cadastrarVeiculo, consultarVeiculo, excluirVeiculo } from '../../services/veiculosService'
import {
  limparPlaca,
  obrigatorio,
  validar,
  validarAno,
  validarChassi,
  validarNumeroNaoNegativo,
  validarPlaca,
} from '../../utils/validadores'
import './veiculos.css'

function Formulario({ veiculo }) {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const editando = Boolean(veiculo)
  const voltar = parametros.get('voltar')
  const [form, setForm] = useState(() => ({
    cliente_id: String(veiculo?.cliente_id ?? parametros.get('cliente') ?? ''),
    placa: veiculo?.placa ?? limparPlaca(parametros.get('placa')),
    chassi: veiculo?.chassi ?? '',
    marca: veiculo?.marca ?? '',
    modelo: veiculo?.modelo ?? '',
    ano: String(veiculo?.ano ?? ''),
    quilometragem: String(veiculo?.quilometragem ?? ''),
  }))
  const [erros, setErros] = useState({})
  const [excluir, setExcluir] = useState(false)

  const clientes = useApi(() => listarClientes())
  const salvar = useAcao(editando ? (d) => atualizarVeiculo(veiculo.id, d) : cadastrarVeiculo)
  const apagar = useAcao(excluindo(excluirVeiculo))

  const mudar = (campo, transformar) => (e) =>
    setForm((f) => ({ ...f, [campo]: transformar ? transformar(e.target.value) : e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    const encontrados = validar({
      cliente_id: obrigatorio(form.cliente_id, 'Escolha o cliente dono do veículo.'),
      placa: validarPlaca(form.placa),
      chassi: validarChassi(form.chassi),
      marca: obrigatorio(form.marca, 'Informe a marca.'),
      modelo: obrigatorio(form.modelo, 'Informe o modelo.'),
      ano: validarAno(form.ano),
      quilometragem: validarNumeroNaoNegativo(form.quilometragem),
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const salvo = await salvar.executar({
      cliente_id: Number(form.cliente_id),
      placa: limparPlaca(form.placa),
      chassi: form.chassi.replace(/\s/g, '').toUpperCase() || null,
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano: Number(form.ano),
      quilometragem: Number(form.quilometragem || 0),
    })
    if (!salvo) return
    // Veio da Nova OS: volta para lá com a placa, que já procura o veículo.
    if (voltar?.startsWith('/')) navigate(voltar, { replace: true })
    else if (parametros.get('cliente')) navigate(`/clientes/${parametros.get('cliente')}`, { replace: true })
    else navigate('/veiculos', { replace: true })
  }

  async function confirmarExclusao() {
    if (await apagar.executar(veiculo.id)) navigate('/veiculos', { replace: true })
  }

  // Placa ou chassi repetido (409) aparece no campo.
  const conflito = salvar.erro?.status === 409 ? salvar.erro.message : null
  const campoConflito = conflito && (/chassi/i.test(conflito) ? 'chassi' : 'placa')
  const errosVisiveis = campoConflito ? { ...erros, [campoConflito]: conflito } : erros

  return (
    <>
      <CabecalhoPagina
        titulo={editando ? 'Editar veículo' : 'Novo veículo'}
        voltarPara={-1}
        acoes={
          editando && (
            <Botao variante="secundario" icone={Trash2} onClick={() => setExcluir(true)}>
              Excluir veículo
            </Botao>
          )
        }
      />
      <form className="pagina form-veiculo" onSubmit={enviar} noValidate>
        {salvar.erro && !conflito && (
          <Aviso tom="perigo" titulo="Não foi possível salvar" onFechar={salvar.limparErro}>
            {salvar.erro.message}
          </Aviso>
        )}
        {editando && veiculo.os_aberta_id && (
          <Aviso tom="info" titulo="Este veículo tem uma OS aberta">
            <span className="linha">
              <SeloStatus status={veiculo.status_os_aberta} />
              <Link to={`/ordens/${veiculo.os_aberta_id}`} className="link-secao">
                Abrir OS {veiculo.os_aberta_id}
              </Link>
            </span>
          </Aviso>
        )}
        <Cartao>
          <Campo
            rotulo="Cliente"
            tipo="select"
            value={form.cliente_id}
            onChange={mudar('cliente_id')}
            erro={errosVisiveis.cliente_id}
            disabled={clientes.carregando}
            ajuda={
              clientes.erro
                ? clientes.erro.message
                : !form.cliente_id
                  ? 'Não achou? Cadastre o cliente antes.'
                  : undefined
            }
          >
            <option value="">Escolha o cliente</option>
            {(clientes.dados ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} · {c.telefone}
              </option>
            ))}
          </Campo>
          {!form.cliente_id && (
            <Link to="/clientes/novo" className="link-secao">
              + Cadastrar cliente
            </Link>
          )}
          <Campo
            rotulo="Placa"
            value={form.placa}
            onChange={mudar('placa', (v) => v.toUpperCase())}
            erro={errosVisiveis.placa}
            placeholder="ABC1D23"
            maxLength={8}
          />
          <Campo
            rotulo="Chassi"
            value={form.chassi}
            onChange={mudar('chassi', (v) => v.toUpperCase())}
            erro={errosVisiveis.chassi}
            maxLength={17}
            opcional
            ajuda="17 letras e números, sem I, O e Q."
          />
          <div className="form-veiculo__duas">
            <Campo rotulo="Marca" value={form.marca} onChange={mudar('marca')} erro={errosVisiveis.marca} />
            <Campo rotulo="Modelo" value={form.modelo} onChange={mudar('modelo')} erro={errosVisiveis.modelo} />
            <Campo
              rotulo="Ano"
              tipo="number"
              inputMode="numeric"
              value={form.ano}
              onChange={mudar('ano')}
              erro={errosVisiveis.ano}
            />
            <Campo
              rotulo="Km atual"
              tipo="number"
              inputMode="numeric"
              min="0"
              value={form.quilometragem}
              onChange={mudar('quilometragem')}
              erro={errosVisiveis.quilometragem}
              opcional
            />
          </div>
        </Cartao>
        {editando && (
          <div className="so-celular pilha">
            <Botao
              variante="secundario"
              icone={ClipboardList}
              larguraTotal
              para={`/ordens/nova?placa=${veiculo.placa}`}
            >
              Nova ordem para este veículo
            </Botao>
            <Botao variante="fantasma" icone={Trash2} larguraTotal onClick={() => setExcluir(true)}>
              Excluir veículo
            </Botao>
          </div>
        )}
        <RodapeAcoes>
          <Botao variante="secundario" onClick={() => navigate(-1)}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={salvar.executando}>
            Salvar veículo
          </Botao>
        </RodapeAcoes>
      </form>

      <ModalConfirmacao
        aberto={excluir}
        titulo={`Excluir o veículo ${veiculo?.placa ?? ''}?`}
        texto="Veículos com ordens de serviço não podem ser excluídos."
        rotuloConfirmar="Excluir veículo"
        perigo
        carregando={apagar.executando}
        onCancelar={() => {
          apagar.limparErro()
          setExcluir(false)
        }}
        onConfirmar={confirmarExclusao}
      >
        {apagar.erro && <Aviso tom="perigo">{apagar.erro.message}</Aviso>}
      </ModalConfirmacao>
    </>
  )
}

export default function FormVeiculoPage() {
  const { id } = useParams()
  const { dados, carregando, erro, recarregar } = useApi(() => consultarVeiculo(id), [id], { ativo: Boolean(id) })

  if (!id) return <Formulario />
  if (carregando) return <EstadoCarregando texto="Carregando veículo..." />
  if (erro)
    return (
      <div className="pagina">
        <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
      </div>
    )
  return <Formulario key={dados.id} veiculo={dados} />
}
