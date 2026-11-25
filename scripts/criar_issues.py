"""Cria no GitHub as etiquetas, os marcos e as issues do frontend (dados em issues_dados.py),
e coloca as issues no quadro Kanban do GitHub Projects. Só usa a biblioteca padrão + o GitHub CLI (gh).

Antes, uma vez:
    gh auth login
    gh auth refresh -s project            (só se for colocar no quadro do Projects)

Uso (na raiz do repositório):
    python scripts/criar_issues.py --simular                 mostra o que seria feito, sem criar nada
    python scripts/criar_issues.py --markdown                regera docs/issues.md
    python scripts/criar_issues.py --repo dono/oficina-mecanica-os \
        --integrantes ana,bruno,carla,diego,elisa,gabriel \
        --projeto 3 --dono-projeto dono

    --integrantes  logins do GitHub na ordem Integrante 1..6 (vazio = sem responsável; a etiqueta "integrante N" vai igual)
    --projeto      número do Project (aparece na URL: github.com/users/dono/projects/3)
    --dono-projeto quem é dono do Project (usuário ou organização); padrão: o dono do repositório

Rodar duas vezes cria issues repetidas: use --simular antes.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from issues_dados import ETIQUETAS, ISSUES, MARCOS, bloco_antes_de_comecar  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
PADRAO_REF = re.compile(r"\{([a-z0-9-]+)\}")
IDS = {i["id"] for i in ISSUES}
POR_ID = {i["id"]: i for i in ISSUES}


def trocar_referencias(texto, numeros=None):
    """{vei-lista} vira #12 (se já criada) ou o título da issue."""
    def trocar(m):
        chave = m.group(1)
        if chave not in IDS:
            return m.group(0)
        if numeros and chave in numeros:
            return f"#{numeros[chave]}"
        return f"“{POR_ID[chave]['titulo']}”"
    return PADRAO_REF.sub(trocar, texto)


def corpo_completo(issue):
    if issue.get("concluida"):
        return issue["corpo"]
    return bloco_antes_de_comecar(issue["id"]) + issue["corpo"]


def rotulo_integrante(n):
    return "Todos" if n is None else f"Integrante {n}"


def gh(args, simular, capturar=False):
    if simular:
        print("  $ gh " + " ".join(a if " " not in a else repr(a) for a in args))
        return ""
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"gh {' '.join(args[:3])}... falhou:\n{r.stderr.strip()}")
    return r.stdout.strip() if capturar else ""


def secao_integrante(n, doint, cabecalho=True):
    """As issues de um integrante em Markdown (usado no issues.md e nos arquivos de cada um)."""
    parte = ETIQUETAS["todos" if n is None else f"integrante {n}"][1]
    linhas = [f"## {rotulo_integrante(n)} — {parte}", ""] if cabecalho else []
    for i in doint:
        etiquetas = ", ".join(f"`{e}`" for e in i["etiquetas"])
        linhas += [
            f"### {i['titulo']}",
            "",
            f"{'**Já concluída** · ' if i.get('concluida') else ''}**Marco:** {MARCOS[i['marco']]['titulo']} · **Etiquetas:** {etiquetas}",
            "",
            ("\n" + trocar_referencias(corpo_completo(i)).strip()).replace("\n## ", "\n#### ").strip(),
            "",
        ]
    return linhas


def gerar_markdown():
    linhas = [
        "# Issues do frontend — divisão entre os 6 integrantes",
        "",
        "Gerado por `scripts/criar_issues.py --markdown` a partir de `scripts/issues_dados.py`.",
        "",
        "Toda issue começa com **Antes de começar**, apontando as seções certas do [guia do frontend](guia_frontend.md) "
        "e da vitrine de componentes ([online](https://claude.ai/artifact/JwmiNpUaHFX2CuvBuadf5z) ou "
        "`docs/vitrine-oficina.html`). O guia também está no começo da vitrine, com os exemplos funcionando.",
        "Para criar no GitHub: `python scripts/criar_issues.py --repo dono/repositorio` (veja o topo do script).",
        "",
        "## Resumo",
        "",
        "| Integrante | Parte | Issues | Já feitas | Marco 1 | Marco 2 | Marco 3 |",
        "|---|---|---|---|---|---|---|",
    ]
    for n in [1, 2, 3, 4, 5, 6, None]:
        doint = [i for i in ISSUES if i["integrante"] == n]
        if not doint:
            continue
        parte = ETIQUETAS["todos" if n is None else f"integrante {n}"][1]
        abertas = [i for i in doint if not i.get("concluida")]
        por_marco = [sum(1 for i in abertas if i["marco"] == m) for m in range(3)]
        feitas = len(doint) - len(abertas)
        linhas.append(f"| {rotulo_integrante(n)} | {parte} | {len(abertas)} | {feitas or '—'} | {por_marco[0]} | {por_marco[1]} | {por_marco[2]} |")

    linhas += ["", "## Marcos", ""]
    for m in MARCOS:
        linhas.append(f"- **{m['titulo']}** — até {m['data'][8:10]}/{m['data'][5:7]}: {m['descricao']}")

    linhas += ["", "## Quadro (sugestão de colunas)", "",
               "Backlog → A fazer → Em andamento → Em revisão (PR aberto) → Concluído. "
               "Cada um puxa as próprias issues; o PR fecha a issue com `Closes #N`.", ""]

    for n in [1, 2, 3, 4, 5, 6, None]:
        doint = [i for i in ISSUES if i["integrante"] == n]
        if not doint:
            continue
        linhas += ["---", ""] + secao_integrante(n, doint)
    destino = RAIZ / "docs" / "issues.md"
    destino.write_text("\n".join(linhas).replace("\n\n\n", "\n\n") + "\n", encoding="utf-8")
    print(f"Escrito: {destino.relative_to(RAIZ)}")

    # Um arquivo por integrante, para mandar a cada um só o que é dele.
    pasta = RAIZ / "docs" / "issues"
    pasta.mkdir(exist_ok=True)
    for n in [1, 2, 3, 4, 5, 6, None]:
        doint = [i for i in ISSUES if i["integrante"] == n]
        if not doint:
            continue
        abertas = [i for i in doint if not i.get("concluida")]
        nome = "todos" if n is None else f"integrante-{n}"
        texto = [
            f"# Suas issues — {rotulo_integrante(n)}",
            "",
            f"Parte: **{ETIQUETAS['todos' if n is None else f'integrante {n}'][1]}** · {len(abertas)} para fazer.",
            "Lista completa do grupo em [../issues.md](../issues.md). Marcos: "
            + "; ".join(f"{m['titulo']} até {m['data'][8:10]}/{m['data'][5:7]}" for m in MARCOS) + ".",
            "",
            "| Issue | Marco |",
            "|---|---|",
            *[f"| {i['titulo']}{' (já feita)' if i.get('concluida') else ''} | {MARCOS[i['marco']]['titulo'].split('.')[0]} |" for i in doint],
            "",
        ] + secao_integrante(n, doint, cabecalho=False)
        arquivo = pasta / f"{nome}.md"
        arquivo.write_text("\n".join(texto).replace("](guia_frontend.md)", "](../guia_frontend.md)").replace("\n\n\n", "\n\n") + "\n", encoding="utf-8")
        print(f"Escrito: {arquivo.relative_to(RAIZ)}")


def criar(args):
    simular = args.simular
    repo = args.repo or "dono/repositorio"
    integrantes = [x.strip() for x in (args.integrantes or "").split(",")] if args.integrantes else []
    integrantes += [""] * (6 - len(integrantes))

    print(f"Repositório: {repo}{'  (SIMULAÇÃO: nada será criado)' if simular else ''}")

    print("\n1) Etiquetas")
    for nome, (cor, descricao) in ETIQUETAS.items():
        gh(["label", "create", nome, "--color", cor, "--description", descricao, "--force", "-R", repo], simular)

    print("\n2) Marcos")
    existentes = set()
    if not simular:
        saida = gh(["api", f"repos/{repo}/milestones?state=all&per_page=100", "--jq", ".[].title"], False, capturar=True)
        existentes = set(saida.splitlines())
    for m in MARCOS:
        if m["titulo"] in existentes:
            print(f"  já existe: {m['titulo']}")
            continue
        gh(["api", f"repos/{repo}/milestones", "-f", f"title={m['titulo']}", "-f", f"description={m['descricao']}",
            "-f", f"due_on={m['data']}T23:59:00Z"], simular)

    print("\n3) Issues")
    numeros = {}
    criadas = []
    for i in ISSUES:
        corpo = trocar_referencias(corpo_completo(i), numeros)
        etiquetas = [*i["etiquetas"], "todos" if i["integrante"] is None else f"integrante {i['integrante']}"]
        comando = ["issue", "create", "-R", repo, "--title", i["titulo"], "--body", corpo,
                   "--milestone", MARCOS[i["marco"]]["titulo"]]
        for e in etiquetas:
            comando += ["--label", e]
        login = integrantes[i["integrante"] - 1] if i["integrante"] else ""
        if login:
            comando += ["--assignee", login]
        if simular:
            print(f"  [{i['id']}] {i['titulo']}  ->  {rotulo_integrante(i['integrante'])}{' [já feita: criada e fechada]' if i.get('concluida') else ''}"
                  f"{' (' + login + ')' if login else ''}, {MARCOS[i['marco']]['titulo']}")
            numeros[i["id"]] = f"?{len(numeros) + 1}"
            continue
        url = gh(comando, False, capturar=True)
        numeros[i["id"]] = url.rstrip("/").split("/")[-1]
        criadas.append(url)
        if i.get("concluida"):
            gh(["issue", "close", numeros[i["id"]], "-R", repo, "--reason", "completed"], False)
        print(f"  #{numeros[i['id']]} {i['titulo']}{'  (fechada: já feita)' if i.get('concluida') else ''}")

    # Issues que citam outras criadas depois: troca o título pelo número agora que todas existem.
    if not simular:
        for i in ISSUES:
            citadas = {m for m in PADRAO_REF.findall(i["corpo"]) if m in IDS}
            if citadas and any(list(numeros).index(c) > list(numeros).index(i["id"]) for c in citadas):
                gh(["issue", "edit", numeros[i["id"]], "-R", repo, "--body", trocar_referencias(corpo_completo(i), numeros)], False)

    if args.projeto:
        dono = args.dono_projeto or repo.split("/")[0]
        print(f"\n4) Quadro: Project {args.projeto} de {dono}")
        for url in criadas:
            gh(["project", "item-add", str(args.projeto), "--owner", dono, "--url", url], simular)
        if simular:
            print("  (cada issue criada seria adicionada ao quadro)")

    print(f"\nPronto: {len(ISSUES)} issues{' simuladas' if simular else ' criadas'}.")
    if not simular:
        (RAIZ / "scripts" / "issues_criadas.json").write_text(json.dumps(numeros, indent=2), encoding="utf-8")


def main():
    p = argparse.ArgumentParser(description="Cria as issues do projeto no GitHub")
    p.add_argument("--repo", help="dono/repositorio")
    p.add_argument("--integrantes", help="logins do GitHub, na ordem Integrante 1..6, separados por vírgula")
    p.add_argument("--projeto", type=int, help="número do GitHub Project para colocar as issues no quadro")
    p.add_argument("--dono-projeto", help="dono do Project (padrão: dono do repositório)")
    p.add_argument("--simular", action="store_true", help="só mostra o que seria feito")
    p.add_argument("--markdown", action="store_true", help="regera docs/issues.md e sai")
    args = p.parse_args()

    if args.markdown:
        gerar_markdown()
        return
    if not args.repo and not args.simular:
        p.error("informe --repo dono/repositorio (ou use --simular)")
    try:
        criar(args)
    except FileNotFoundError:
        sys.exit("GitHub CLI (gh) não encontrado. Instale: https://cli.github.com e rode `gh auth login`.")
    except RuntimeError as erro:
        sys.exit(str(erro))


if __name__ == "__main__":
    main()
