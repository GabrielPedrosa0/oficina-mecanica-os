from fastapi import APIRouter, Depends, Query

from schemas.dashboard_schema import ListaEntregasHoje, ListaOrdensRecentes, ResumoDashboard
from services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


# GET /api/dashboard/resumo
@router.get("/resumo", response_model=ResumoDashboard, summary="Indicadores gerais da oficina")
def obter_resumo(ver_faturamento: bool = Depends(dashboard_service.pode_ver_faturamento)):
    """
    Os quatro indicadores do topo do **Painel (PC)** e do **Início (celular)**:

    | Indicador | Valor | Texto de apoio |
    |---|---|---|
    | Em serviço | OS com status `EM_SERVICO` | `em_servico_previsao_hoje` |
    | Aguardando peça | OS com status `AGUARDANDO_PECA` | `aguardando_peca_atrasadas` |
    | Prontas | OS com status `PRONTA` | Texto fixo "Avisar o cliente" |
    | Faturado no mês | Soma de `valor_total` das OS `ENTREGUE` concluídas no mês | Só o Gerente vê; para os demais vem `null` |

    Tocar em um indicador abre `GET /api/ordens-servico?status=<status>`.
    """
    return dashboard_service.obter_resumo(ver_faturamento)


# GET /api/dashboard/entregas-hoje?limite=20&offset=0
@router.get("/entregas-hoje", response_model=ListaEntregasHoje, summary="OS com previsão de entrega para hoje")
def listar_entregas_hoje(
    limite: int = Query(dashboard_service.LIMITE_ENTREGAS, ge=1, le=100, description="Itens por página."),
    offset: int = Query(0, ge=0, description="Quantos itens pular (para carregar mais ao rolar)."),
):
    """
    Cartões **"Entregas de hoje"** do **Início (celular)**: OS ainda não entregues com
    `data_previsao` hoje, da mais cedo para a mais tarde. Carregue a próxima página com
    `offset` enquanto `tem_mais` for `true`. Sem entregas, `itens` vem vazio e
    `mensagem_vazia` traz o texto do estado vazio.
    """
    return dashboard_service.listar_entregas_hoje(limite, offset)


# GET /api/dashboard/ordens-recentes?limite=10
@router.get("/ordens-recentes", response_model=ListaOrdensRecentes, summary="OS abertas mais recentes")
def listar_ordens_recentes(
    limite: int = Query(dashboard_service.LIMITE_RECENTES, ge=1, le=50, description="Máximo de ordens."),
):
    """
    Tabela **"Ordens recentes"** do **Painel (PC)**: OS ainda não entregues, da entrada
    mais nova para a mais antiga. Clicar em uma linha abre `GET /api/ordens-servico/{id}`.
    """
    return dashboard_service.listar_ordens_recentes(limite)