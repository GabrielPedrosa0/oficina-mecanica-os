from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from schemas.ordem_servico_schema import OrdemServico


# GET /api/dashboard/resumo. Os quatro indicadores do topo da tela, com os textos de apoio.
class ResumoDashboard(BaseModel):
    em_servico: int = Field(description="OS com status EM_SERVICO.")
    em_servico_previsao_hoje: int = Field(description="Dessas em serviço, quantas têm previsão para hoje.")
    aguardando_peca: int = Field(description="OS com status AGUARDANDO_PECA.")
    aguardando_peca_atrasadas: int = Field(description="Dessas aguardando peça, quantas já passaram da previsão.")
    prontas: int = Field(description="OS com status PRONTA (avisar o cliente).")
    faturamento_mes: float | None = Field(
        description="Soma do valor_total das OS ENTREGUES com data_conclusao no mês atual, em reais. "
                    "null quando o usuário não pode ver o faturamento (só o Gerente vê).")
    mes_referencia: str = Field(description="Mês usado no faturamento, no formato AAAA-MM.")
    gerado_em: datetime = Field(description="Momento do cálculo, no horário da oficina (sem fuso, como as OS).")

    model_config = ConfigDict(json_schema_extra={"example": {
        "em_servico": 12, "em_servico_previsao_hoje": 5, "aguardando_peca": 4,
        "aguardando_peca_atrasadas": 1, "prontas": 3, "faturamento_mes": 18240.00,
        "mes_referencia": "2026-11", "gerado_em": "2026-11-11T09:50:00",
    }})


# Uma OS como aparece nos cartões (celular) e na tabela (PC). É a mesma OS que
# GET /api/ordens-servico devolve (herda os campos do schema da OS), mais o resumo do serviço.
class OrdemPainel(OrdemServico):
    id: int
    placa: str | None = None
    veiculo: str = Field(description='Marca e modelo, ex.: "Volkswagen Gol 1.6".')
    cliente_id: int | None = None
    cliente_nome: str | None = None
    cliente_telefone: str | None = None
    servico_resumo: str = Field(
        description="Texto da coluna Serviço: o campo servico ou, sem ele, o problema relatado, "
                    "cortado em 60 caracteres.")


EXEMPLO_ORDEM = {
    "id": 1042, "veiculo_id": 1, "quilometragem": 82300, "problema_relatado": "Barulho ao frear",
    "servico": "Troca de óleo e filtros", "mecanico": "Rafael",
    "data_abertura": "2026-11-11T08:10:00", "data_previsao": "2026-11-11T17:00:00", "data_conclusao": None,
    "status": "EM_SERVICO", "observacoes": None, "valor_total": 340.00,
    "placa": "QRS4F21", "veiculo": "Volkswagen Gol 1.6",
    "cliente_id": 1, "cliente_nome": "Marina Souza", "cliente_telefone": "(85) 90000-0001",
    "servico_resumo": "Troca de óleo e filtros",
}


# GET /api/dashboard/entregas-hoje. Lista paginada: o celular carrega 20 por vez ao rolar.
class ListaEntregasHoje(BaseModel):
    data: date = Field(description="Dia considerado, no horário da oficina.")
    total: int = Field(description="Total de OS com entrega prevista para hoje (todas as páginas).")
    limite: int
    offset: int
    tem_mais: bool = Field(description="true se ainda há itens para carregar ao rolar.")
    mensagem_vazia: str | None = Field(description="Texto do estado vazio, quando não há entregas.")
    itens: list[OrdemPainel]

    model_config = ConfigDict(json_schema_extra={"example": {
        "data": "2026-11-11", "total": 1, "limite": 20, "offset": 0, "tem_mais": False,
        "mensagem_vazia": None, "itens": [EXEMPLO_ORDEM],
    }})


# GET /api/dashboard/ordens-recentes. Tabela "Ordens recentes" do PC.
class ListaOrdensRecentes(BaseModel):
    total: int = Field(description="Quantidade de itens devolvidos.")
    itens: list[OrdemPainel]

    model_config = ConfigDict(json_schema_extra={"example": {"total": 1, "itens": [EXEMPLO_ORDEM]}})