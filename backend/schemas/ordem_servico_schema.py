from datetime import datetime
from typing import Literal

from pydantic import BaseModel

# Estados da OS. Integrante 3: quando o core/enums.py existir, este tipo pode passar a
# usar o enum de lá (os valores são os mesmos do guia).
Status = Literal["ORCAMENTO", "EM_SERVICO", "AGUARDANDO_PECA", "PRONTA", "ENTREGUE"]


# O corpo de POST e PUT /api/ordens-servico, por exemplo
# {"veiculo_id": 1, "quilometragem": 82300, "problema_relatado": "Barulho ao frear",
#  "servico": "Troca de óleo e filtros", "mecanico": "Rafael",
#  "data_abertura": "2026-11-11T08:10:00", "data_previsao": "2026-11-11T17:00:00",
#  "data_conclusao": null, "status": "EM_SERVICO",
#  "observacoes": "Verificar pastilhas", "valor_total": 340.00}
# O cliente não vai no corpo: ele é o dono do veículo.
# As datas vão sem fuso horário. Se data_abertura faltar, vale o momento atual.
class OrdemServico(BaseModel):
    veiculo_id: int
    quilometragem: int | None = None
    problema_relatado: str
    servico: str | None = None
    mecanico: str | None = None
    data_abertura: datetime | None = None
    data_previsao: datetime | None = None
    data_conclusao: datetime | None = None
    status: Status = "ORCAMENTO"
    observacoes: str | None = None
    valor_total: float = 0
