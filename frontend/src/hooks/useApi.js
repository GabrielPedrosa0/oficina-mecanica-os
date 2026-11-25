// Hooks para falar com o backend sem repetir useState/useEffect em toda tela. Integrante 6.
import { useCallback, useEffect, useEffectEvent, useState } from 'react'

// LEITURA: chama a função do service ao abrir a tela e quando `dependencias` mudam.
//
//   const { dados, carregando, erro, recarregar } = useApi(() => listarOrdens({ status }), [status])
//
//   if (carregando) return <EstadoCarregando />
//   if (erro) return <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
//
// Se uma resposta antiga chegar depois de uma nova (ex.: digitando na busca), ela é ignorada.
// `ativo: false` não chama (ex.: só buscar depois de digitar 2 letras).
export function useApi(funcao, dependencias = [], { ativo = true } = {}) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(ativo)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const chamar = useEffectEvent(() => funcao())

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps --
     o efeito existe justamente para buscar dados quando a tela abre ou um filtro muda */
  useEffect(() => {
    if (!ativo) {
      setCarregando(false)
      return
    }
    let valida = true // vira false se outra chamada começar antes desta terminar
    setCarregando(true)
    setErro(null)
    chamar()
      .then((resultado) => valida && setDados(resultado))
      .catch((e) => valida && setErro(e))
      .finally(() => valida && setCarregando(false))
    return () => {
      valida = false
    }
  }, [ativo, versao, ...dependencias])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  return { dados, setDados, carregando, erro, recarregar }
}

// ESCRITA (salvar, excluir, mudar status): só chama quando você mandar.
//
//   const { executar, executando, erro } = useAcao(cadastrarOrdem)
//   async function salvar() {
//     const os = await executar(form)   // devolve null se deu erro (o erro fica em `erro`)
//     if (os) navigate(`/ordens/${os.id}`)
//   }
export function useAcao(funcao) {
  const [executando, setExecutando] = useState(false)
  const [erro, setErro] = useState(null)

  const executar = useCallback(
    async (...argumentos) => {
      setExecutando(true)
      setErro(null)
      try {
        return await funcao(...argumentos)
      } catch (e) {
        setErro(e)
        return null
      } finally {
        setExecutando(false)
      }
    },
    [funcao],
  )

  const limparErro = useCallback(() => setErro(null), [])

  return { executar, executando, erro, limparErro }
}

// Para usar com useAcao em rotas que respondem 204 sem corpo (DELETE): devolve true quando deu certo,
// já que o useAcao devolve null tanto no erro quanto numa resposta vazia.
//   const apagar = useAcao(excluindo(excluirCliente))
//   if (await apagar.executar(id)) navigate('/clientes')
export const excluindo =
  (funcao) =>
  async (...argumentos) => {
    await funcao(...argumentos)
    return true
  }
