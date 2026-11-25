from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# Os códigos das respostas do perfil. A tela mostra o texto; a API e o banco guardam o código.
FaixaEtaria = Literal["ATE_29", "30_A_44", "45_A_59", "60_OU_MAIS"]
UsoApps = Literal["QUASE_NUNCA", "AS_VEZES", "TODO_DIA"]
SistemaGestao = Literal["SIM", "NAO"]
RelacaoOficina = Literal["TRABALHA", "JA_TRABALHOU", "NUNCA"]
FamiliaridadeCarro = Literal["NAO_DIRIGE", "DIRIGE", "ENTENDE_MECANICA"]
HabitoFormularios = Literal["QUASE_NUNCA", "AS_VEZES", "COM_FREQUENCIA"]

TipoEvento = Literal[
    "TELA",                 # abriu uma tela (o endereço vai em "tela")
    "CLIQUE",               # tocou num botão, link ou campo
    "CLIQUE_DESABILITADO",  # tocou num botão desabilitado
    "ERRO_FORMULARIO",      # a tela mostrou um erro num campo (a mensagem vai em "texto")
    "CHAMADA_API",          # a tela chamou a API (metodo, caminho, status, id_registro)
    "SAIU",                 # saiu do app (trocou de aba, bloqueou o celular)
    "VOLTOU",               # voltou para o app
    "INICIO_TAREFA",        # tocou em "Começar"
    "FIM_TAREFA",           # a chamada final da tarefa deu certo
]


# POST /api/validacao/aplicadores, por exemplo {"nome": "Rolf"}
class NovoAplicador(BaseModel):
    nome: str = Field(min_length=1, max_length=60)


# POST /api/validacao/sessoes (no "Aceito participar"), por exemplo
# {"codigo_aplicador": "K7M3P", "origem": "PESSOA", "tipo_aparelho": "CELULAR",
#  "largura_tela": 390, "altura_tela": 844, "navegador": "Mozilla/5.0 (Linux; Android 14) ..."}
class NovaSessao(BaseModel):
    codigo_aplicador: str
    origem: Literal["PESSOA", "PERSONA"] = "PESSOA"
    tipo_aparelho: Literal["CELULAR", "TABLET", "COMPUTADOR"] | None = None
    largura_tela: int | None = Field(default=None, ge=0)
    altura_tela: int | None = Field(default=None, ge=0)
    navegador: str | None = None


# PUT /api/validacao/sessoes/{id}/perfil: as 6 perguntas de toque.
class Perfil(BaseModel):
    faixa_etaria: FaixaEtaria
    uso_apps: UsoApps
    sistema_gestao: SistemaGestao
    relacao_oficina: RelacaoOficina
    familiaridade_carro: FamiliaridadeCarro
    habito_formularios: HabitoFormularios


# Um item da lista de POST /api/validacao/sessoes/{id}/eventos, por exemplo
# {"tarefa": 1, "tipo": "CHAMADA_API", "tela": "/clientes/novo", "metodo": "POST",
#  "caminho": "/clientes", "status": 201, "id_registro": 15, "instante": "2026-11-25T14:03:12.481Z"}
# Os textos longos demais são cortados (o service corta), para não perder o lote inteiro.
class Evento(BaseModel):
    tarefa: int = Field(default=0, ge=0, le=4)
    tipo: TipoEvento
    tela: str | None = None
    componente: str | None = None
    texto: str | None = None
    metodo: str | None = None
    caminho: str | None = None
    status: int | None = None
    id_registro: int | None = None
    instante: datetime


# POST /api/validacao/sessoes/{id}/feedback, por exemplo
# {"sus": [4, 2, 5, 1, 4, 2, 5, 1, 4, 2], "mais_dificil": "Achar a placa", "mudaria": ""}
# sus: as 10 respostas na ordem do questionário, cada uma de 1 a 5.
class Feedback(BaseModel):
    sus: list[int] = Field(min_length=10, max_length=10)
    mais_dificil: str | None = None
    mudaria: str | None = None
