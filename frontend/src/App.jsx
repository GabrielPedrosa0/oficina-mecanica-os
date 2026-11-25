import AppRoutes from './routes/AppRoutes'
import { capturando } from './utils/modoValidacao'
import { instalarRegistrador } from './utils/registrador'

// Quem reabre o link no meio do teste continua sendo registrado (ver utils/registrador.js).
if (capturando()) instalarRegistrador()

// O app é só as rotas. Layout, telas e estilos ficam nas pastas de cada parte.
export default function App() {
  return <AppRoutes />
}
