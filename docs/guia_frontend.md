# Guia do frontend — Oficina Mecânica

Este guia é para quem **nunca usou React** ou quase não mexeu com frontend. Ele explica o mínimo de cada assunto,
sempre com o código deste projeto, e termina com duas telas feitas do zero, passo a passo.

> **Onde ler:** este mesmo texto está no começo da **vitrine de componentes**, com os exemplos funcionando ao vivo
> (online: https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z, ou baixe `docs/vitrine-oficina.html` e abra no
> navegador). Os exemplos ao vivo só aparecem na vitrine.
> As tarefas de cada um estão em [`docs/issues.md`](issues.md).

## 1. Comece aqui

### O que é o frontend

O sistema tem duas partes que conversam pela internet:

```
  NAVEGADOR (frontend)                       SERVIDOR (backend)
  React: telas, botões, formulários   --->   FastAPI: regras e dados
  pasta frontend/                     <---   pasta backend/
           pede:  GET /api/veiculos?placa=QRS
           recebe: [{ "id": 1, "placa": "QRS4F21", "marca": "Volkswagen", ... }]
```

O **backend** guarda os dados e aplica as regras (placa válida, OS não pode ser cancelada depois de entregue...).
O **frontend** mostra os dados e manda o que a pessoa digitou. Ele não guarda nada sozinho: pede ao backend.
As mensagens entre os dois são **JSON**, que é praticamente um dicionário do Python escrito como texto.

### O que instalar (uma vez)

- **Node.js 22** (https://nodejs.org): é o “Python” do JavaScript; traz o `npm`, que é o “pip”.
- **VS Code** com as extensões **ESLint** e **Prettier** (apontam erros e arrumam o código ao salvar).
- **Python 3.12** para rodar o backend junto.

### Rodar o projeto

São três terminais, todos a partir da pasta do repositório:

```bash
# Terminal 1 — backend em http://127.0.0.1:8000
cd backend
python3 -m venv .venv            # só na primeira vez: cria um Python só do projeto
source .venv/bin/activate        # no Windows: .venv\Scripts\activate
pip install -r requirements.txt  # só na primeira vez (instala FastAPI e uvicorn)
uvicorn app:app --reload

# Terminal 2 — coloca no backend os dados de exemplo do Figma (rode de novo se reiniciar o backend)
python scripts/dados_exemplo.py

# Terminal 3 — frontend em http://localhost:5173
cd frontend
npm install        # só na primeira vez (baixa as bibliotecas para a pasta node_modules)
npm run dev        # deixe rodando: cada vez que você salva um arquivo, a tela atualiza sozinha
```

Abra http://localhost:5173 no navegador. Para ver a versão de celular: aperte **F12**, clique no ícone de celular
e escolha 390 px de largura.

### Onde fica cada coisa

```
frontend/src/
├── main.jsx            o primeiro arquivo que roda: liga o React na página
├── App.jsx             só chama as rotas
├── routes/             AppRoutes.jsx: qual endereço abre qual tela
├── pages/              UMA PASTA POR TELA — é aqui que você vai trabalhar
├── components/         peças prontas para montar as telas
│   ├── ui/             botão, campo, selo, etiqueta, abas, tabela, cartão, modal...
│   ├── layout/         menu lateral, abas do celular, cabeçalho da página
│   ├── os/             cartão e tabela de OS, serviços e peças, apontamentos
│   └── veiculos/       linha de veículo das listas do celular
├── services/           funções que falam com o backend (uma por rota)
├── hooks/              useApi, useAcao, useDebounce (ajudantes do React)
├── utils/              formatar dinheiro, data, placa; validar campos
├── constants/          status da OS, tipos de apontamento e perfis de acesso
└── styles/             cores, fontes e espaços do Figma
```

Regra de ouro: **você quase só mexe na pasta da sua tela em `pages/`**. Todo o resto já está pronto para usar.

## 2. JavaScript para quem vem do Python

O React é escrito em JavaScript. A lógica é a mesma do Python; muda a escrita. Isto é quase tudo que aparece no projeto:

| Python | JavaScript | Observação |
|---|---|---|
| `nome = 'Ana'` | `const nome = 'Ana'` | `const` não muda; `let` pode mudar. Nunca use `var` |
| `f'Olá, {nome}'` | `` `Olá, ${nome}` `` | crase, não aspas |
| `def soma(a, b): return a + b` | `const soma = (a, b) => a + b` | “função seta”; também existe `function soma(a, b) { ... }` |
| `None` | `null` (e `undefined`) | |
| `True and False`, `not x` | `true && false`, `!x` | |
| `x if cond else y` | `cond ? x : y` | |
| `[v.placa for v in veiculos]` | `veiculos.map((v) => v.placa)` | |
| `[v for v in veiculos if v.ano > 2020]` | `veiculos.filter((v) => v.ano > 2020)` | |
| `len(lista)` | `lista.length` | |
| `d['placa']` ou `d.get('placa')` | `d.placa` | |
| `{**form, 'placa': 'X'}` | `{ ...form, placa: 'X' }` | “espalhar” (spread) |
| `a, b = par` | `const [a, b] = par` | desestruturação de lista |
| `placa = veiculo['placa']` | `const { placa } = veiculo` | desestruturação de objeto |
| `from x import y` | `import { y } from './x'` | e `import Y from './x'` para o “padrão” do arquivo |
| `await` dentro de `async def` | `await` dentro de `async function` | igual |
| `x or 'padrão'` | `x ?? 'padrão'` | `??` só troca `null`/`undefined` |
| `os.cliente.nome` que pode ser `None` | `os.cliente?.nome` | `?.` não quebra se for `null` |

Duas diferenças que pegam todo mundo:

- **`===` em vez de `==`.** Em JavaScript, `'1' == 1` é verdadeiro. Use sempre `===` e `!==`.
- **Ponto e vírgula e aspas:** o projeto não usa `;` e usa aspas simples. Não se preocupe: `npm run formatar` arruma.

## 3. React: componentes e JSX

### Componente é uma função que devolve a tela

Em React, cada pedaço da tela é um **componente**: uma função (com nome começando em letra maiúscula) que devolve
o que deve aparecer. O “HTML” dentro do JavaScript se chama **JSX**.

```jsx
function Saudacao() {
  return <h1 className="t-h2">Bom dia, oficina!</h1>
}
```

E se usa como se fosse uma tag nova: `<Saudacao />`. Uma tela inteira é só um componente grande feito de componentes menores.

### As regras do JSX

```jsx
function CartaoSimples() {
  const placa = 'QRS4F21'
  const pronta = true
  const servicos = ['Troca de óleo', 'Filtros', 'Alinhamento']

  return (
    <div className="cartao">                          {/* 1. class vira className */}
      <p>Placa: {placa}</p>                           {/* 2. { } coloca JavaScript dentro */}
      {pronta && <p>Pronta para entrega</p>}          {/* 3. só mostra se for verdadeiro */}
      <p>{pronta ? 'Avisar o cliente' : 'Em serviço'}</p> {/* 4. um ou outro */}
      <ul>
        {servicos.map((s) => (
          <li key={s}>{s}</li>                        // 5. listas com map + key única
        ))}
      </ul>
      <img src="/foto.png" alt="Foto do carro" />     {/* 6. tags vazias fecham com /> */}
    </div>
  )
}
```

7. O componente devolve **um** elemento só. Precisa de dois lado a lado? Embrulhe em `<> ... </>` (um “fragmento”).
8. Comentário dentro do JSX é `{/* assim */}`.

<!-- demo:jsx -->

## 4. Props: configurando um componente

**Props** são os “parâmetros” de um componente. É assim que o mesmo `Botao` vira “Salvar”, “Excluir” ou “Nova ordem”:

```jsx
<Botao variante="perigo" icone={Trash2} onClick={excluir}>Excluir</Botao>
```

Do lado de dentro, o componente recebe tudo num objeto e normalmente já desestrutura:

```jsx
function Saudacao({ nome, oficina = 'Sua Oficina' }) {   // oficina tem valor padrão
  return <p>Bom dia, {nome}! Bem-vindo à {oficina}.</p>
}

<Saudacao nome="Marina" />
<Saudacao nome="Rafael" oficina="Oficina do Raimundo" />
```

Detalhes que aparecem o tempo todo:

- Texto vai entre aspas (`nome="Marina"`); **todo o resto** vai entre chaves: `ano={2022}`, `ativo={true}`, `onClick={salvar}`.
- O que fica entre a tag de abrir e a de fechar chega como a prop `children`: em `<Botao>Excluir</Botao>`, `children` é “Excluir”.
- Ícones são passados **sem** `< />`: `icone={Plus}`. Quem desenha o ícone é o componente.
- Cada componente da vitrine tem a tabela “Propriedades” dizendo o que dá para configurar.

<!-- demo:props -->

## 5. Estado: a tela que muda

### useState

Uma variável comum **não** atualiza a tela. Para guardar algo que muda (o texto digitado, um filtro, se o modal
está aberto), use **estado**:

```jsx
import { useState } from 'react'

function Contador() {
  const [quantidade, setQuantidade] = useState(0)   // valor atual e a função que troca o valor

  return (
    <Botao onClick={() => setQuantidade(quantidade + 1)}>
      Cliquei {quantidade} vezes
    </Botao>
  )
}
```

Quando você chama `setQuantidade`, o React **roda a função do componente de novo** com o valor novo e atualiza
só o que mudou na tela. Isso se chama **renderizar**.

<!-- demo:contador -->

### Campos de formulário

Um campo “controlado” mostra o que está no estado e avisa quando a pessoa digita:

```jsx
const [placa, setPlaca] = useState('')

<Campo rotulo="Placa" value={placa} onChange={(evento) => setPlaca(evento.target.value)} />
```

`evento.target.value` é o texto que está no campo agora.

<!-- demo:campo -->

### Nunca mude o estado “na mão”

```jsx
form.placa = 'ABC1234'                          // ERRADO: a tela não fica sabendo
setForm({ ...form, placa: 'ABC1234' })          // CERTO: um objeto novo, copiando o resto

lista.push(novo)                                // ERRADO
setLista([...lista, novo])                      // CERTO
```

## 6. Hooks: useEffect e os ajudantes do projeto

Funções que começam com `use` são **hooks**: dão “poderes” ao componente (estado, buscar dados, ler o endereço...).
Duas regras: chame hooks **sempre no começo do componente** e **nunca dentro de `if`, laço ou outra função**.

### useEffect (e por que você quase não vai precisar dele)

`useEffect` roda um código **depois** que a tela aparece, por exemplo para buscar dados. Escrever isso à mão dá
trabalho (carregando, erro, resposta atrasada...). Por isso o projeto tem três hooks prontos em `hooks/`:

| Hook | Para quê | Exemplo |
|---|---|---|
| `useApi` | **buscar** dados ao abrir a tela (e de novo quando algo mudar) | `useApi(() => listarOrdens({ status }), [status])` |
| `useAcao` | **salvar, excluir, mudar status**: só roda quando você chamar | `const { executar } = useAcao(cadastrarOrdem)` |
| `useDebounce` | esperar a pessoa parar de digitar antes de buscar | `const busca = useDebounce(texto, 300)` |

O segundo argumento do `useApi` (`[status]`) é a lista de **dependências**: quando algum desses valores muda, ele
busca de novo. Lista vazia `[]` = busca só uma vez, ao abrir a tela.

<!-- demo:debounce -->

## 7. Telas e rotas

Cada tela tem um endereço. A lista está em `routes/AppRoutes.jsx`:

```jsx
<Route path="veiculos" element={<ListaVeiculosPage />} />
<Route path="veiculos/:id" element={<DetalheVeiculoPage />} />   {/* :id = um pedaço que muda */}
```

Todas as telas (menos o Login) aparecem dentro do `LayoutPrincipal`, que já desenha o menu lateral no PC e as
abas no celular. Você só cuida do miolo.

Para navegar, nunca use `<a href>` (ele recarrega o site inteiro). Use:

```jsx
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

<Link to="/veiculos/novo">Novo veículo</Link>         // um link
<Botao para="/veiculos/novo">Novo veículo</Botao>     // o nosso botão já faz o mesmo

const navigate = useNavigate()
navigate('/ordens/1042')                               // ir para outra tela pelo código (ex.: depois de salvar)
navigate(-1)                                           // voltar

const { id } = useParams()                             // em /veiculos/7, id = '7' (sempre texto!)
const [parametros] = useSearchParams()                 // em /ordens?status=PRONTA
const status = parametros.get('status')                // 'PRONTA'
```

Criou uma tela nova? Acrescente a `<Route>` no `AppRoutes.jsx` e, se ela aparece no menu, o item em
`components/layout/itensMenu.js`.

O menu segue o Figma do MVP. No PC: Painel, Ordens de serviço, Clientes, Veículos, Mecânicos, Serviços, Peças e
Usuários (este só para o Gerente). No celular, as abas são Início, Ordens, Clientes, Veículos e Mais; Mecânicos,
Serviços, Peças e Usuários ficam dentro de **Mais**. Para esconder um item de quem não é Gerente, escreva
`perfis: ['GERENTE']` no item.

## 8. Estilo: como a tela fica bonita

O visual vem do Figma e já está pronto em variáveis CSS (`styles/tokens.css`). Na maioria das telas você **não
precisa escrever CSS nenhum**: os componentes já vêm com o estilo certo. Quando precisar, crie um arquivo na pasta
da sua tela (ex.: `pages/Clientes/clientes.css`), importe no componente (`import './clientes.css'`) e siga isto:

```css
/* Nomes de classe começando pelo nome da tela, para não bater com a tela de outra pessoa */
.clientes__lado-a-lado {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--espaco-4);                  /* espaços: --espaco-1 (4 px) até --espaco-16 (64 px) */
  background: var(--fundo-superficie);   /* NUNCA uma cor solta como #FFFFFF */
  border: 1px solid var(--borda-padrao);
  border-radius: var(--raio-g);
}

/* Celular: tudo que tiver menos de 900 px de largura */
@media (max-width: 899px) {
  .clientes__lado-a-lado {
    grid-template-columns: 1fr;          /* uma coluna só */
  }
}
```

- **Cores por função**: `--fundo-*`, `--texto-*`, `--borda-*`, `--status-*`. A seção **Cores** da vitrine mostra
  todas; clique para copiar.
- **Texto**: use as classes prontas (`t-h2`, `t-corpo-m`, `titulo-secao`...) em vez de `font-size`.
- **Mostrar só num tamanho**: `className="so-pc"` ou `className="so-celular"`.
- **Ajudantes de página**: `pagina` (margens certas), `pilha` (um embaixo do outro), `linha` (um ao lado do outro).

Regras do Figma: **um** botão laranja (primário) por tela; status sempre com texto, nunca só cor; rótulo do campo
sempre visível; ícones com 20 px em botões e listas.

## 9. Falando com o backend

### O caminho de um dado

```
sua tela  →  função do service  →  api.js  →  /api/...  →  FastAPI  →  banco
```

**Nenhuma tela chama o backend direto.** Cada grupo de rotas tem um arquivo em `services/` com uma função por rota:

```jsx
// services/veiculosService.js
export const listarVeiculos = ({ placa } = {}) => apiGet('/veiculos', { placa })   // GET /api/veiculos?placa=...
export const cadastrarVeiculo = (dados) => apiPost('/veiculos', dados)             // POST /api/veiculos
```

O `api.js` cuida do resto: monta o endereço, manda o login e, se der erro, transforma a mensagem do backend em
`erro.message` (ex.: “Placa inválida. Use ABC1234 ou ABC1D23.”), pronta para mostrar.

### Buscar e mostrar: o padrão de toda lista

Toda lista tem quatro situações, e a tela precisa mostrar algo em cada uma:

```jsx
const { dados, carregando, erro, recarregar } = useApi(() => listarClientes({ nome }), [nome])

if (carregando) return <EstadoCarregando />                                           // 1. esperando
if (erro) return <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />   // 2. deu erro
if (dados.length === 0) return <EstadoVazio titulo="Nenhum cliente encontrado" />     // 3. não veio nada
return dados.map((c) => <ItemLista key={c.id} titulo={c.nome} />)                     // 4. deu certo
```

<!-- demo:useapi -->

### Salvar: useAcao

```jsx
const { executar, executando, erro } = useAcao(cadastrarOrdem)

async function criar() {
  const os = await executar(dados)   // se der erro, devolve null e a mensagem fica em erro.message
  if (os) navigate(`/ordens/${os.id}`)
}

{erro && <Aviso tom="perigo">{erro.message}</Aviso>}
<Botao carregando={executando} onClick={criar}>Criar ordem</Botao>
```

### Formatos combinados com o backend

- **Datas** vão e voltam sem fuso: `"2026-11-11T17:00:00"`. Para mostrar: `formatarPrevisao()` (“Hoje, 17:00”).
  Para enviar o valor de um campo de data e hora: `deCampoDataHora()`.
- **Dinheiro** vem em reais (`340.0`). Para mostrar: `formatarMoeda()` (“R$ 340,00”) ou `formatarMoedaCurta()` (“R$ 340”).
- **Placa**: `limparPlaca()` tira hífen e põe em maiúsculas antes de enviar.
- **Status**: o backend manda o código (`EM_SERVICO`); o `<SeloStatus status="EM_SERVICO" />` mostra “Em serviço” com a cor certa.

A seção **Formatadores** da vitrine mostra o resultado de cada função.

## 10. Sua primeira tela, passo a passo

Vamos fazer a lista de veículos do zero. Abra `pages/Veiculos/ListaVeiculosPage.jsx`.

**Passo 1 — o esqueleto.** Toda tela começa assim: o cabeçalho e o conteúdo dentro de `pagina`.

```jsx
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'

export default function ListaVeiculosPage() {
  return (
    <>
      <CabecalhoPagina titulo="Veículos" />
      <div className="pagina">Aqui vai a lista</div>
    </>
  )
}
```

Salve e abra http://localhost:5173/veiculos. Já aparece com o menu, no PC e no celular.

**Passo 2 — buscar os dados.** Use o service e o `useApi`. Por enquanto, mostre quantos vieram:

```jsx
const { dados, carregando } = useApi(() => listarVeiculos(), [])
// ...
<div className="pagina">{carregando ? 'Carregando...' : `${dados.length} veículos`}</div>
```

**Passo 3 — as quatro situações.** Troque o texto pelos componentes de estado e pela lista com `map`
(passo 4 da seção 9).

**Passo 4 — a busca.** Um estado para o texto, o `useDebounce` para esperar a digitação e o valor nas dependências do `useApi`.

**Passo 5 — o botão de novo.** No cabeçalho para o PC (`acoes`) e fixo embaixo no celular (`RodapeAcoes`).

O resultado final, completo:

```jsx
// pages/Veiculos/ListaVeiculosPage.jsx
import { useState } from 'react'
import { Car, Plus } from 'lucide-react'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import BarraBusca from '../../components/ui/BarraBusca'
import Botao from '../../components/ui/Botao'
import Cartao from '../../components/ui/Cartao'
import ItemLista from '../../components/ui/ItemLista'
import { EstadoCarregando, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { listarVeiculos } from '../../services/veiculosService'
import { formatarKm } from '../../utils/formatadores'

export default function ListaVeiculosPage() {
  // 1. Estado: o que a pessoa digitou na busca
  const [texto, setTexto] = useState('')
  const placa = useDebounce(texto.trim(), 300)

  // 2. Dados do backend: busca de novo sempre que `placa` mudar
  const { dados, carregando, erro, recarregar } = useApi(() => listarVeiculos({ placa }), [placa])

  // 3. O que mostrar em cada situação
  let conteudo
  if (carregando) {
    conteudo = <EstadoCarregando texto="Carregando veículos..." />
  } else if (erro) {
    conteudo = <EstadoErro mensagem={erro.message} onTentarDeNovo={recarregar} />
  } else if (dados.length === 0) {
    conteudo = <EstadoVazio icone={Car} titulo="Nenhum veículo encontrado" />
  } else {
    conteudo = (
      <Cartao semEspaco>
        {dados.map((veiculo) => (
          <ItemLista
            key={veiculo.id}
            icone={Car}
            titulo={`${veiculo.marca} ${veiculo.modelo}`}
            subtitulo={`${veiculo.placa} · ${formatarKm(veiculo.quilometragem)}`}
            para={`/veiculos/${veiculo.id}`}
          />
        ))}
      </Cartao>
    )
  }

  // 4. A tela
  return (
    <>
      <CabecalhoPagina
        titulo="Veículos"
        acoes={
          <Botao para="/veiculos/novo" icone={Plus}>
            Novo veículo
          </Botao>
        }
      />
      <div className="pagina">
        <BarraBusca valor={texto} onChange={setTexto} placeholder="Buscar pela placa" />
        {conteudo}
      </div>
      <RodapeAcoes soCelular>
        <Botao para="/veiculos/novo" icone={Plus} larguraTotal>
          Novo veículo
        </Botao>
      </RodapeAcoes>
    </>
  )
}
```

<!-- demo:tela-lista -->

## 11. Seu primeiro formulário

Agora o “Novo veículo”. As ideias novas: **um estado com todos os campos** (um objeto), **validar antes de enviar**
e **ir para outra tela quando der certo**.

```jsx
// pages/Veiculos/FormVeiculoPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CabecalhoPagina from '../../components/layout/CabecalhoPagina'
import RodapeAcoes from '../../components/layout/RodapeAcoes'
import Aviso from '../../components/ui/Aviso'
import Botao from '../../components/ui/Botao'
import Campo from '../../components/ui/Campo'
import Cartao from '../../components/ui/Cartao'
import { useAcao } from '../../hooks/useApi'
import { cadastrarVeiculo } from '../../services/veiculosService'
import { limparPlaca, obrigatorio, validar, validarAno, validarPlaca } from '../../utils/validadores'

const VAZIO = { placa: '', marca: '', modelo: '', ano: '', quilometragem: '' }

export default function FormVeiculoPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(VAZIO) // os valores de todos os campos
  const [erros, setErros] = useState({}) // { placa: 'Placa inválida...' }
  const { executar, executando, erro } = useAcao(cadastrarVeiculo)

  // Devolve a função que atualiza um campo: mudar('placa') -> (evento) => ...
  const mudar = (campo) => (evento) => setForm({ ...form, [campo]: evento.target.value })

  async function salvar(evento) {
    evento.preventDefault() // não deixa o navegador recarregar a página

    const encontrados = validar({
      placa: validarPlaca(form.placa),
      marca: obrigatorio(form.marca, 'Informe a marca.'),
      modelo: obrigatorio(form.modelo, 'Informe o modelo.'),
      ano: validarAno(form.ano),
    })
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return // tem erro: não envia

    const veiculo = await executar({
      ...form,
      placa: limparPlaca(form.placa),
      ano: Number(form.ano),
      quilometragem: Number(form.quilometragem || 0),
    })
    if (veiculo) navigate('/veiculos') // deu certo: volta para a lista
  }

  return (
    <>
      <CabecalhoPagina titulo="Novo veículo" voltarPara="/veiculos" />
      <form className="pagina" onSubmit={salvar} noValidate>
        {erro && <Aviso tom="perigo">{erro.message}</Aviso>}
        <Cartao>
          <Campo rotulo="Placa" value={form.placa} onChange={mudar('placa')} erro={erros.placa} />
          <Campo rotulo="Marca" value={form.marca} onChange={mudar('marca')} erro={erros.marca} />
          <Campo rotulo="Modelo" value={form.modelo} onChange={mudar('modelo')} erro={erros.modelo} />
          <Campo rotulo="Ano" tipo="number" value={form.ano} onChange={mudar('ano')} erro={erros.ano} />
          <Campo
            rotulo="Quilometragem"
            tipo="number"
            opcional
            value={form.quilometragem}
            onChange={mudar('quilometragem')}
          />
        </Cartao>
        <RodapeAcoes>
          <Botao type="submit" carregando={executando}>
            Salvar veículo
          </Botao>
        </RodapeAcoes>
      </form>
    </>
  )
}
```

O que acontece quando a pessoa clica em “Salvar veículo”:

1. O `<form onSubmit={salvar}>` chama `salvar`. O `preventDefault()` impede o navegador de recarregar a página.
2. `validar({...})` roda as regras de `utils/validadores.js` e devolve só os campos com problema, por exemplo
   `{ placa: 'Placa inválida. Use ABC1234 ou ABC1D23.' }`. Cada `<Campo>` recebe o seu em `erro`.
3. Sem erro, `executar(...)` manda para o backend. Enquanto espera, o botão mostra o “carregando”.
4. Se o backend recusar (ex.: placa repetida), a mensagem aparece no `<Aviso>`. Se der certo, `navigate` volta para a lista.

<!-- demo:tela-form -->

## 12. Quando der errado

Abra o **F12** sempre que algo estranho acontecer. As abas que importam:

- **Console**: erros em vermelho, com o arquivo e a linha.
- **Rede (Network)**: cada pedido ao backend. Clique nele para ver o que foi enviado e o que voltou.

| O que aparece | Causa provável | O que fazer |
|---|---|---|
| Tela toda branca | Erro de JavaScript | Leia o Console; o arquivo e a linha estão lá |
| `Cannot read properties of null (reading 'map')` | Usou `dados` antes de chegar | Trate o `carregando` antes de usar `dados` |
| “Sem conexão com o servidor” | O backend não está rodando | Terminal 1: ative o `.venv` e rode `uvicorn app:app --reload` |
| “Essa rota ainda não existe no backend” | A tela chama uma rota que ninguém fez ainda (ex.: `/api/mecanicos`) | Combine com quem faz a rota; enquanto isso, teste na vitrine com os dados de exemplo |
| `uvicorn: command not found` | O `.venv` não está ativo ou faltou o `pip install` | `source .venv/bin/activate` e `pip install -r requirements.txt` |
| “Não encontrado.” | A rota ainda não existe no backend ou o endereço está errado | Confira em http://127.0.0.1:8000/api/docs |
| `Each child in a list should have a unique "key"` | Faltou `key` no `map` | `key={item.id}` |
| `... is not a function` ou `undefined` no import | Import com ou sem chaves errado | Arquivo com `export default`: `import X from`; sem: `import { X } from` |
| A tela não atualiza | Mudou o estado “na mão” | Use o `set...` com um objeto novo (seção 5) |
| Fica buscando sem parar | Dependência que muda a cada render no `useApi` | Coloque nas dependências só valores simples (texto, número) |
| `React Hook ... is called conditionally` | Hook dentro de `if` | Mova o hook para o começo do componente |

Antes de mandar o código: `npm run lint` mostra problemas (tem que terminar sem erro) e `npm run formatar`
arruma espaços e aspas.

## 13. Trabalhando em grupo no GitHub

1. Pegue uma issue no quadro e mova para **Em andamento**.
2. Crie uma branch com o número dela: `git checkout -b issue-12-lista-veiculos`.
3. Faça commits pequenos com mensagens claras: `git commit -m "Lista de veículos com busca por placa"`.
4. Envie e abra um Pull Request: `git push -u origin issue-12-lista-veiculos`. Na descrição, escreva `Closes #12`.
5. Espere a verificação automática ficar verde e alguém do grupo aprovar. Depois do merge, a issue fecha sozinha.

Antes de abrir o PR, confira:

- [ ] Funciona em 390 px (celular) e em 1440 px (PC), comparado com o Figma
- [ ] Carregando, vazio e erro aparecem
- [ ] Erros do backend aparecem para a pessoa (`<Aviso>` ou o `erro` do `<Campo>`)
- [ ] Só cores por função (`var(--...)`) e nenhuma chamada ao backend fora dos services
- [ ] `npm run lint` sem erro e `npm run formatar` rodado

## 14. Glossário

| Palavra | O que é |
|---|---|
| **Componente** | Função que devolve um pedaço da tela (`Botao`, `CartaoOS`, uma página inteira) |
| **JSX** | O “HTML” escrito dentro do JavaScript |
| **Props** | Os parâmetros de um componente (`variante="perigo"`) |
| **Estado** | Valor guardado pelo componente que, quando muda, atualiza a tela (`useState`) |
| **Renderizar** | O React rodar o componente de novo e atualizar a tela |
| **Hook** | Função `use...` que dá um poder ao componente (`useState`, `useApi`, `useNavigate`) |
| **Rota** | Endereço que abre uma tela (`/veiculos/7`) |
| **Endpoint** | Endereço do backend que responde dados (`GET /api/veiculos`) |
| **Service** | Nosso arquivo com uma função por endpoint (`veiculosService.js`) |
| **JSON** | O formato dos dados trocados com o backend |
| **Debounce** | Esperar a pessoa parar de digitar antes de buscar |
| **Token** | A “credencial” que o login devolve e vai junto em cada pedido |
| **npm** | O instalador de bibliotecas do JavaScript (como o pip) |
| **Vite** | O programa que roda o projeto (`npm run dev`) e gera a versão final (`npm run build`) |
