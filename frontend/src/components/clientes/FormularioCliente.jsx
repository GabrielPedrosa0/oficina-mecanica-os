// O MESMO formulário serve para cadastrar e para editar um cliente.
// - Cadastrar: chega sem `cliente` e os campos começam vazios.
// - Editar: chega com o `cliente` que veio da API e os campos começam preenchidos.
import { useState } from 'react'
import Aviso from '../ui/Aviso'
import Botao from '../ui/Botao'
import Campo from '../ui/Campo'
import GrupoCampos from '../ui/GrupoCampos'

export default function FormularioCliente({ cliente = {}, textoBotao, salvando, erro, onSalvar }) {
  // Um estado para cada campo (campos controlados).
  const [nome, setNome] = useState(cliente.nome ?? '')
  const [telefone, setTelefone] = useState(cliente.telefone ?? '')
  const [cpf_cnpj, setCpfCnpj] = useState(cliente.cpf_cnpj ?? '')
  const [email, setEmail] = useState(cliente.email ?? '')

  // Nome e telefone são obrigatórios no backend.
  const faltaCampo = nome.trim() === '' || telefone.trim() === ''

  function enviar(evento) {
    evento.preventDefault() // não deixa o navegador recarregar a página
    // `...cliente` guarda os campos que este formulário não mostra (endereço etc.),
    // para o PUT não apagar o que já estava salvo.
    onSalvar({
      ...cliente,
      nome: nome.trim(),
      telefone: telefone.trim(),
      cpf_cnpj: cpf_cnpj.trim() === '' ? null : cpf_cnpj.trim(),
      email: email.trim() === '' ? null : email.trim(),
    })
  }

  return (
    <form onSubmit={enviar} className="pilha">
      <GrupoCampos titulo="Dados do cliente">
        <Campo rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Campo rotulo="Telefone" tipo="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <Campo rotulo="CPF ou CNPJ" opcional value={cpf_cnpj} onChange={(e) => setCpfCnpj(e.target.value)} />
        <Campo rotulo="E-mail" tipo="email" opcional value={email} onChange={(e) => setEmail(e.target.value)} />
      </GrupoCampos>

      {erro && (
        <Aviso tom="perigo" titulo="Não foi possível salvar">
          {erro.message}
        </Aviso>
      )}

      <Botao type="submit" disabled={faltaCampo} carregando={salvando}>
        {textoBotao}
      </Botao>
    </form>
  )
}
