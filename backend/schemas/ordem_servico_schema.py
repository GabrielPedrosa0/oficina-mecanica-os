from datetime import datetime
from typing import Literal

from pydantic import BaseModel

# Estados da OS (os mesmos do CHECK ck_os_status do banco).
Status = Literal["ORCAMENTO", "EM_SERVICO", "AGUARDANDO_PECA", "PRONTA", "ENTREGUE", "CANCELADA"]


# O corpo de POST e PUT /api/ordens-servico, por exemplo
# {"veiculo_id": 1, "mecanico_id": 1, "quilometragem": 82300,
#  "problema_relatado": "Barulho ao frear", "eh_garantia": false,
#  "data_abertura": "2026-11-11T08:10:00", "data_previsao": "2026-11-11T17:00:00",
#  "data_conclusao": null, "status": "EM_SERVICO", "observacoes": "Verificar pastilhas"}
# O cliente não vai no corpo: ele é o dono do veículo.
# mecanico_id pode ser null ("A definir").
# O valor total não vai no corpo: ele é a soma das peças e serviços da OS (visão vw_os_total).
# As datas vão sem fuso horário. Se data_abertura faltar, vale o momento atual.
# No banco (tabela os): quilometragem é a coluna km_entrada.
class OrdemServico(BaseModel):
    veiculo_id: int
    mecanico_id: int | None = None
    quilometragem: int | None = None
    problema_relatado: str
    eh_garantia: bool = False
    data_abertura: datetime | None = None
    data_previsao: datetime | None = None
    data_conclusao: datetime | None = None
    status: Status = "ORCAMENTO"
    observacoes: str | None = None
