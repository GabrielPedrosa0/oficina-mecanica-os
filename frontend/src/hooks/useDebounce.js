// Espera o usuário parar de digitar antes de buscar. Integrante 6.
//   const [texto, setTexto] = useState('')
//   const busca = useDebounce(texto, 300)
//   useApi(() => listarClientes({ nome: busca }), [busca])
import { useEffect, useState } from 'react'

export function useDebounce(valor, atrasoMs = 300) {
  const [atrasado, setAtrasado] = useState(valor)
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), atrasoMs)
    return () => clearTimeout(t)
  }, [valor, atrasoMs])
  return atrasado
}
