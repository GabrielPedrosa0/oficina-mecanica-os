# Regras do modo validação (teste de usabilidade remoto).
#
# O aplicador (logado) gera um código e manda o link /validacao?a=CODIGO. Quem abre o link não
# tem login: cria uma sessão, responde o perfil, faz as 4 tarefas nas telas reais e responde o
# feedback. Enquanto isso, a tela manda os eventos em lotes. A análise usa os dois CSV.
import csv
import io
import secrets

from fastapi import HTTPException

from repositories import validacao_repository
from schemas.validacao_schema import Evento, Feedback, NovaSessao, NovoAplicador, Perfil
from services.exportacao_service import celula_csv

# Sem 0/O e 1/I, que se confundem ao ditar ou copiar o link.
LETRAS_DO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
TAMANHO_DO_CODIGO = 5
EVENTOS_POR_LOTE = 200

# Tamanho de cada texto do evento no banco: o que passar disso é cortado, não recusado,
# para um texto comprido não fazer o lote inteiro se perder.
LIMITES_DO_EVENTO = {"tela": 120, "componente": 80, "texto": 200, "metodo": 6, "caminho": 120}


def gerar_codigo():
    return "".join(secrets.choice(LETRAS_DO_CODIGO) for _ in range(TAMANHO_DO_CODIGO))


def criar_aplicador(entrada: NovoAplicador):
    nome = entrada.nome.strip()
    if nome == "":
        raise HTTPException(status_code=422, detail="Informe o primeiro nome do aplicador.")
    # Com 32 letras e 5 posições há 33 milhões de códigos; repetir é raríssimo, mas confere.
    codigo = gerar_codigo()
    while validacao_repository.buscar_aplicador_por_codigo(codigo):
        codigo = gerar_codigo()
    return validacao_repository.criar_aplicador({"codigo": codigo, "nome": nome})


def criar_sessao(entrada: NovaSessao):
    codigo = entrada.codigo_aplicador.strip().upper()
    aplicador = validacao_repository.buscar_aplicador_por_codigo(codigo)
    if aplicador is None:
        raise HTTPException(status_code=404, detail="Link inválido: confira o endereço que você recebeu.")
    dados = entrada.model_dump(exclude={"codigo_aplicador"})
    if dados["navegador"]:
        dados["navegador"] = dados["navegador"][:300]
    return validacao_repository.criar_sessao({**dados, "aplicador_id": aplicador["id"]})


def buscar_sessao(id: int):
    sessao = validacao_repository.buscar_sessao(id)
    if sessao is None:
        raise HTTPException(status_code=404, detail="Sessão de validação não encontrada.")
    return sessao


def gravar_perfil(id: int, entrada: Perfil):
    buscar_sessao(id)
    return validacao_repository.atualizar_sessao(id, entrada.model_dump())


def gravar_eventos(id: int, eventos: list[Evento]):
    buscar_sessao(id)
    if len(eventos) > EVENTOS_POR_LOTE:
        raise HTTPException(status_code=422, detail=f"Mande no máximo {EVENTOS_POR_LOTE} eventos por vez.")
    linhas = []
    for evento in eventos:
        linha = evento.model_dump()
        for campo, limite in LIMITES_DO_EVENTO.items():
            if linha[campo]:
                linha[campo] = linha[campo][:limite]
        linhas.append({**linha, "id_sessao": id})
    return {"gravados": validacao_repository.criar_eventos(linhas)}


def gravar_feedback(id: int, entrada: Feedback):
    buscar_sessao(id)
    if any(nota < 1 or nota > 5 for nota in entrada.sus):
        raise HTTPException(status_code=422, detail="Cada resposta do questionário vai de 1 a 5.")
    if validacao_repository.buscar_resposta(id):
        raise HTTPException(status_code=409, detail="Esta sessão já respondeu o questionário.")
    notas = {f"sus_{n}": nota for n, nota in enumerate(entrada.sus, start=1)}
    return validacao_repository.criar_resposta({"sessao_id": id, **notas, "mais_dificil": entrada.mais_dificil,
                                                "mudaria": entrada.mudaria})


# Pontuação do SUS, de 0 a 100: nas afirmações ímpares (positivas) vale a nota - 1; nas pares
# (negativas), 5 - nota. A soma (0 a 40) vezes 2,5.
def pontuacao_sus(notas: list[int]):
    soma = sum(nota - 1 if n % 2 == 1 else 5 - nota for n, nota in enumerate(notas, start=1))
    return soma * 2.5


# Texto do CSV: separador ";", BOM e números com vírgula, para abrir certo no Excel em português
# (igual à exportação das ordens de serviço).
def montar_csv(cabecalho, linhas):
    saida = io.StringIO()
    escritor = csv.writer(saida, delimiter=";", lineterminator="\r\n")
    escritor.writerow(cabecalho)
    for linha in linhas:
        escritor.writerow([celula_csv(formatar_valor(valor)) for valor in linha])
    return "﻿" + saida.getvalue()


def formatar_valor(valor):
    if valor is None:
        return ""
    if isinstance(valor, float):
        return f"{valor:.1f}".replace(".", ",")
    if hasattr(valor, "isoformat"):
        return valor.isoformat(timespec="milliseconds")
    return valor


# Uma linha por sessão: perfil, aparelho, as 10 notas, a pontuação do SUS e as abertas.
def exportar_sessoes():
    colunas = ["sessao", "aplicador_codigo", "aplicador", "origem", "faixa_etaria", "uso_apps", "sistema_gestao",
               "relacao_oficina", "familiaridade_carro", "habito_formularios", "tipo_aparelho", "largura_tela",
               "altura_tela", "navegador", "iniciada_em", *(f"sus_{n}" for n in range(1, 11)), "sus_pontuacao",
               "mais_dificil", "mudaria", "respondida_em"]
    linhas = []
    for sessao in validacao_repository.listar_sessoes_com_feedback():
        notas = [sessao[f"sus_{n}"] for n in range(1, 11)]
        pontuacao = pontuacao_sus(notas) if sessao["sus_1"] is not None else None
        linhas.append([pontuacao if coluna == "sus_pontuacao" else sessao[coluna] for coluna in colunas])
    return montar_csv(colunas, linhas)


# Uma linha por evento, em ordem de sessão e de instante.
def exportar_eventos():
    colunas = ["id_evento", *validacao_repository.COLUNAS_EVENTO, "recebido_em"]
    linhas = [[evento[coluna] for coluna in colunas] for evento in validacao_repository.listar_eventos()]
    return montar_csv(colunas, linhas)
