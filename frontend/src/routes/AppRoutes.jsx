// Mapa de endereços do app: cada caminho mostra uma página.
import { Navigate, Route, Routes } from 'react-router-dom'
import DetalheClientePage from '../pages/Clientes/DetalheClientePage'
import EditarClientePage from '../pages/Clientes/EditarClientePage'
import ListaClientesPage from '../pages/Clientes/ListaClientesPage'
import NovoClientePage from '../pages/Clientes/NovoClientePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clientes" replace />} />
      <Route path="/clientes" element={<ListaClientesPage />} />
      <Route path="/clientes/novo" element={<NovoClientePage />} />
      <Route path="/clientes/:id" element={<DetalheClientePage />} />
      <Route path="/clientes/:id/editar" element={<EditarClientePage />} />
    </Routes>
  )
}
