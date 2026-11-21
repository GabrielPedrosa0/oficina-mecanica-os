from typing import Literal

from pydantic import BaseModel

# Os tipos que a pessoa escolhe ao registrar um apontamento. O banco aceita mais três
# (ABERTURA, ORCAMENTO e ENTREGA, ver o CHECK ck_apontamento_tipo), que o sistema registra sozinho.
TipoRegistravel = Literal["DIAGNOSTICO", "APROVACAO", "EXECUCAO", "PECA", "OBSERVACAO"]


# O corpo de POST /api/ordens-servico/{os_id}/apontamentos, por exemplo
# {"tipo": "EXECUCAO", "descricao": "Óleo e filtros trocados; testando vazamentos."}
# A OS vem do endereço e a data é o momento do registro: nenhuma das duas vai no corpo.
# A descrição ("O que foi feito") é obrigatória e tem até 500 letras (o service confere).
# Um tipo que não está na lista é recusado com 422 pelo próprio FastAPI.
class Apontamento(BaseModel):
    tipo: TipoRegistravel
    descricao: str
