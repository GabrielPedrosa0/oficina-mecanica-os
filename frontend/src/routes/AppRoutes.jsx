// Mapa de endereços do app: cada caminho mostra uma página.
// Quem abre o app sem estar logado cai direto em /login (ver RotaProtegida).
import { Navigate, Route, Routes } from 'react-router-dom'
import DetalheClientePage from '../pages/Clientes/DetalheClientePage'
import EditarClientePage from '../pages/Clientes/EditarClientePage'
import ListaClientesPage from '../pages/Clientes/ListaClientesPage'
import NovoClientePage from '../pages/Clientes/NovoClientePage'
import LoginPage from '../pages/Login/LoginPage'
import DetalheOrdemPage from '../pages/OrdensServico/DetalheOrdemPage'
import ListaOrdensPage from '../pages/OrdensServico/ListaOrdensPage'
import PainelPage from '../pages/Painel/PainelPage'
import RotaProtegida from './RotaProtegida'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RotaProtegida />}>
        <Route path="/" element={<PainelPage />} />
        <Route path="/ordens" element={<ListaOrdensPage />} />
        <Route path="/ordens/:id" element={<DetalheOrdemPage />} />
        <Route path="/clientes" element={<ListaClientesPage />} />
        <Route path="/clientes/novo" element={<NovoClientePage />} />
        <Route path="/clientes/:id" element={<DetalheClientePage />} />
        <Route path="/clientes/:id/editar" element={<EditarClientePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
