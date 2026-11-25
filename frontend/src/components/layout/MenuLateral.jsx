// Menu lateral escuro do PC (Figma "Barras e menu"). Integrante 6.
// Só aparece no PC (a partir de 900 px); no celular quem navega é a BarraAbas.
//
//   <MenuLateral usuario={{ nome: 'Ana', perfil: 'RECEPCAO' }} nomeOficina="Oficina do Raimundo" />
//
// Itens no Figma: Painel, Ordens de serviço, Clientes, Veículos, Mecânicos, Serviços, Peças e Usuários
// (Usuários só aparece para o Gerente).
import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Botao from '../ui/Botao'
import Logo from './Logo'
import { rotuloPerfil } from '../../constants/perfis'
import { ITENS_MENU, itensDoPerfil } from './itensMenu'
import './layout.css'

function ItemMenu({ para, rotulo, icone: Icone, emBreve }) {
  return (
    <NavLink
      to={para}
      end={para === '/'}
      className={({ isActive }) => `menu-item ${isActive ? 'menu-item--ativo' : ''}`}
    >
      <Icone size={20} className="menu-item__icone" aria-hidden="true" />
      <span className="menu-item__rotulo">{rotulo}</span>
      {emBreve && <span className="menu-item__breve">Em breve</span>}
    </NavLink>
  )
}

export default function MenuLateral({
  nomeOficina = 'Sua Oficina',
  usuario = { nome: 'Usuário', perfil: 'RECEPCAO' },
  itens = ITENS_MENU,
  rodape,
  onSair,
}) {
  return (
    <aside className="menu-lateral" aria-label="Menu principal">
      <div className="menu-lateral__topo">
        <Logo nome={nomeOficina} />
      </div>

      <nav className="menu-lateral__nav">
        {itensDoPerfil(itens, usuario?.perfil).map((item) => (
          <ItemMenu key={item.para} {...item} />
        ))}
      </nav>

      <div className="menu-lateral__rodape">
        {rodape}
        {usuario && (
          <div className="menu-lateral__usuario">
            <Avatar nome={usuario.nome} tamanho={32} />
            <span className="menu-lateral__usuario-textos">
              <span className="menu-lateral__usuario-nome">{usuario.nome}</span>
              <span className="menu-lateral__usuario-perfil">{rotuloPerfil(usuario.perfil)}</span>
            </span>
            {onSair && (
              <Botao
                variante="fantasma"
                tamanho="pequeno"
                icone={LogOut}
                aria-label="Sair"
                title="Sair"
                className="menu-lateral__sair"
                onClick={onSair}
              />
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
