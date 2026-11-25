// Itens do menu lateral (PC) e das abas (celular), como no Figma do MVP. Integrante 6.
// Para incluir uma tela no menu, acrescente aqui e crie a rota em routes/AppRoutes.jsx.
// `perfis` limita quem vê o item (ex.: Usuários só para o Gerente); sem `perfis`, todos veem.
import { Car, ClipboardList, HardHat, KeyRound, LayoutDashboard, Menu, Package, Users, Wrench } from 'lucide-react'

export const ITENS_MENU = [
  { para: '/', rotulo: 'Painel', icone: LayoutDashboard },
  { para: '/ordens', rotulo: 'Ordens de serviço', icone: ClipboardList },
  { para: '/clientes', rotulo: 'Clientes', icone: Users },
  { para: '/veiculos', rotulo: 'Veículos', icone: Car },
  { para: '/mecanicos', rotulo: 'Mecânicos', icone: HardHat },
  { para: '/servicos', rotulo: 'Serviços', icone: Wrench },
  { para: '/pecas', rotulo: 'Peças', icone: Package },
  { para: '/usuarios', rotulo: 'Usuários', icone: KeyRound, perfis: ['ADMIN'] },
]

// Tela "Mais" do celular: o que não cabe na barra de abas, com a descrição do Figma.
export const ITENS_MAIS = [
  { para: '/mecanicos', rotulo: 'Mecânicos', descricao: 'Equipe e horário de expediente', icone: HardHat },
  { para: '/servicos', rotulo: 'Serviços', descricao: 'Catálogo com preço base e tempo', icone: Wrench },
  { para: '/pecas', rotulo: 'Peças', descricao: 'Estoque e preço de venda', icone: Package },
  {
    para: '/usuarios',
    rotulo: 'Usuários',
    descricao: 'Acesso ao sistema e perfis',
    icone: KeyRound,
    perfis: ['ADMIN'],
  },
]

// Barra de abas do celular: no máximo 5. O resto fica em "Mais".
export const ABAS_CELULAR = [
  { para: '/', rotulo: 'Início', icone: LayoutDashboard },
  { para: '/ordens', rotulo: 'Ordens', icone: ClipboardList },
  { para: '/clientes', rotulo: 'Clientes', icone: Users },
  { para: '/veiculos', rotulo: 'Veículos', icone: Car },
  { para: '/mais', rotulo: 'Mais', icone: Menu, inclui: ['/mecanicos', '/servicos', '/pecas', '/usuarios'] },
]

// Filtra os itens pelo perfil do usuário. Sem usuário (ainda sem login), mostra tudo.
export function itensDoPerfil(itens, perfil) {
  if (!perfil) return itens
  const chave = String(perfil).toUpperCase()
  return itens.filter((item) => !item.perfis || item.perfis.includes(chave))
}
