// "Mais" do celular: o que não cabe na barra de abas (Figma "Celular — Mais"). Integrante 6.
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import { ITENS_MAIS, itensDoPerfil } from '../../components/layout/itensMenu'
import Cartao from '../../components/ui/Cartao'
import ItemLista from '../../components/ui/ItemLista'
import { rotuloPerfil } from '../../constants/perfis'
import { sair, usuarioSalvo } from '../../services/authService'

export default function MaisPage() {
  const navigate = useNavigate()
  const usuario = usuarioSalvo()

  return (
    <>
      <CabecalhoPagina titulo="Mais" />
      <div className="pagina">
        {usuario && (
          <Cartao semEspaco>
            <ItemLista
              avatar={usuario.nome}
              titulo={usuario.nome}
              subtitulo={[rotuloPerfil(usuario.perfil), usuario.email].filter(Boolean).join(' · ')}
            />
          </Cartao>
        )}
        <Cartao semEspaco>
          {itensDoPerfil(ITENS_MAIS, usuario?.perfil).map((item) => (
            <ItemLista
              key={item.para}
              icone={item.icone}
              titulo={item.rotulo}
              subtitulo={item.descricao}
              para={item.para}
            />
          ))}
        </Cartao>
        <Cartao semEspaco>
          <ItemLista
            icone={LogOut}
            titulo="Sair"
            onClick={() => {
              sair()
              navigate('/login')
            }}
          />
        </Cartao>
      </div>
    </>
  )
}
