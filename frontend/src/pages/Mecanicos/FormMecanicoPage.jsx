// Novo mecânico e editar mecânico (Figma "Celular — Novo mecânico"). Integrante 1.
// Em /mecanicos/novo e /mecanicos/:id/editar.
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { EstadoCarregando, EstadoErro } from '../../components/ui/Estados'
import { ModalConfirmacao } from '../../components/ui/Modal'
import { excluindo, useAcao, useApi } from '../../hooks/useApi'
import {
  atualizarMecanico,
  cadastrarMecanico,
  consultarMecanico,
  excluirMecanico,
} from '../../services/mecanicosService'
import { formatarCpfCnpj, formatarTelefone } from '../../utils/formatadores'
import { obrigatorio, validar, validarCpfCnpj, validarExpediente, validarTelefone } from '../../utils/validadores'
import './mecanicos.css'

function Formulario({ mecanico }) {
  const navigate = useNavigate()
  const editando = Boolean(mecanico)
  const [form, setForm] = useState(() => ({
    nome: mecanico?.nome ?? '',
    cpf: mecanico?.cpf ?? '',
    telefone: mecanico?.telefone ?? '',
    expediente_inicio: mecanico?.expediente_inicio ?? '08:00',
    expediente_fim: mecanico?.expediente_fim ?? '17:00',
  }))
  const [erros, setErros] = useState({})
  const [excluir, setExcluir] = useState(false)
  const salvar = useAcao(editando ? (d) => atualizarMecanico(mecanico.id, d) : cadastrarMecanico)
  const apagar = useAcao(excluindo(excluirMecanico))

  const mudar = (campo, mascara) => (e) =>
    setForm((f) => ({ ...f, [campo]: mascara ? mascara(e.target.value) : e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    const cpfDigitos = form.cpf.replace(/\D/g, '')
    const encontrados = validar({
      nome: obrigatorio(form.nome, 'Informe o nome.'),
      cpf:
        cpfDigitos && cpfDigitos.length !== 11
          ? 'CPF tem 11 números.'
          : validarCpfCnpj(form.cpf, { obrigatorio: false }),
      telefone: form.telefone ? validarTelefone(form.telefone) : null,
      expediente: validarExpediente(form.expediente_inicio, form.expediente_fim),
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    const salvo = await salvar.executar({
      nome: form.nome.trim(),
      cpf: form.cpf.trim() || null,
      telefone: form.telefone.trim() || null,
      expediente_inicio: form.expediente_inicio,
      expediente_fim: form.expediente_fim,
    })
    if (salvo) navigate('/mecanicos', { replace: true })
  }

  async function confirmarExclusao() {
    if (await apagar.executar(mecanico.id)) navigate('/mecanicos', { replace: true })
  }

  return (
    <>
      <CabecalhoPagina
        titulo={editando ? 'Editar mecânico' : 'Novo mecânico'}
        voltarPara={-1}
        acoes={
          editando && (
            <Botao variante="secundario" icone={Trash2} onClick={() => setExcluir(true)}>
              Excluir mecânico
            </Botao>
          )
        }
      />
      <form className="pagina form-mecanico" onSubmit={enviar} noValidate>
        {salvar.erro && (
          <Aviso tom="perigo" titulo="Não foi possível salvar" onFechar={salvar.limparErro}>
            {salvar.erro.message}
          </Aviso>
        )}
        <Cartao>
          <Campo rotulo="Nome" value={form.nome} onChange={mudar('nome')} erro={erros.nome} autoComplete="name" />
          <Campo
            rotulo="CPF"
            inputMode="numeric"
            value={form.cpf}
            onChange={mudar('cpf', (v) => formatarCpfCnpj(v.replace(/[^\d.-]/g, '').slice(0, 14)))}
            erro={erros.cpf}
            opcional
          />
          <Campo
            rotulo="Telefone"
            tipo="tel"
            value={form.telefone}
            onChange={mudar('telefone', (v) => formatarTelefone(v.replace(/[^\d() -]/g, '')))}
            erro={erros.telefone}
            placeholder="(85) 90000-0000"
            opcional
          />
          <p className="form-mecanico__expediente-titulo">Expediente</p>
          <div className="form-mecanico__expediente">
            <Campo
              rotulo="Início"
              tipo="time"
              value={form.expediente_inicio}
              onChange={mudar('expediente_inicio')}
              erro={erros.expediente}
            />
            <Campo rotulo="Fim" tipo="time" value={form.expediente_fim} onChange={mudar('expediente_fim')} />
          </div>
        </Cartao>
        {editando && (
          <div className="so-celular">
            <Botao variante="fantasma" icone={Trash2} larguraTotal onClick={() => setExcluir(true)}>
              Excluir mecânico
            </Botao>
          </div>
        )}
        <RodapeAcoes>
          <Botao variante="secundario" onClick={() => navigate(-1)}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={salvar.executando}>
            Salvar mecânico
          </Botao>
        </RodapeAcoes>
      </form>

      <ModalConfirmacao
        aberto={excluir}
        titulo={`Excluir ${mecanico?.nome ?? 'mecânico'}?`}
        texto="Mecânicos com OS em andamento não podem ser excluídos."
        rotuloConfirmar="Excluir mecânico"
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

export default function FormMecanicoPage() {
  const { id } = useParams()
  const { dados, carregando, erro, recarregar } = useApi(() => consultarMecanico(id), [id], { ativo: Boolean(id) })

  if (!id) return <Formulario />
  if (carregando) return <EstadoCarregando texto="Carregando mecânico..." />
  if (erro)
    return (
      <div className="pagina">
        <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
      </div>
    )
  return <Formulario key={dados.id} mecanico={dados} />
}
