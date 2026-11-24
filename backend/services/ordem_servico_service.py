# Regras de negócio das ordens de serviço.
from datetime import datetime

from fastapi import HTTPException

from core.texto import limpar, normalizar, placa_confere
from repositories import cliente_repository, mecanico_repository, ordem_servico_repository, veiculo_repository
from schemas.ordem_servico_schema import OrdemServico


# Confere os campos e devolve os dados prontos para gravar. `atual` é a OS já gravada
# (na atualização): se data_abertura vier vazia, fica a original.
def validar_ordem(entrada: OrdemServico, atual=None):
    veiculo = veiculo_repository.buscar(entrada.veiculo_id)
    if veiculo is None:
        raise HTTPException(status_code=422, detail="Veículo não encontrado.")

    # O mecânico é opcional ("A definir"), mas, se vier, tem que existir.
    if entrada.mecanico_id is not None and mecanico_repository.buscar(entrada.mecanico_id) is None:
        raise HTTPException(status_code=422, detail="Mecânico não encontrado.")

    problema = entrada.problema_relatado.strip()
    if problema == "":
        raise HTTPException(status_code=422, detail="O problema relatado é obrigatório.")

    # Sem quilometragem na OS, vale a do cadastro do veículo.
    km = entrada.quilometragem if entrada.quilometragem is not None else veiculo["quilometragem"]
    if km < 0:
        raise HTTPException(status_code=422, detail="A quilometragem não pode ser negativa.")

    for data in (entrada.data_abertura, entrada.data_previsao, entrada.data_conclusao):
        if data is not None and data.tzinfo is not None:
            raise HTTPException(
                status_code=422,
                detail="Informe as datas sem fuso horário, ex.: 2026-11-11T08:10:00.",
            )

    if entrada.data_abertura is not None:
        abertura = entrada.data_abertura
    elif atual is not None:
        abertura = atual["data_abertura"]
    else:
        abertura = datetime.now().replace(microsecond=0)

    if entrada.data_conclusao is not None and entrada.data_conclusao < abertura:
        raise HTTPException(status_code=422, detail="A data de conclusão não pode ser anterior à data de abertura.")
    if entrada.data_previsao is not None and entrada.data_previsao < abertura:
        raise HTTPException(status_code=422, detail="A data de previsão não pode ser anterior à data de abertura.")

    return {
        "veiculo_id": entrada.veiculo_id,
        "quilometragem": km,
        "problema_relatado": problema,
        "mecanico_id": entrada.mecanico_id,
        "eh_garantia": entrada.eh_garantia,
        "data_abertura": abertura,
        "data_previsao": entrada.data_previsao,
        "data_conclusao": entrada.data_conclusao,
        "status": entrada.status,
        "observacoes": limpar(entrada.observacoes),
    }


# Devolve a OS, ou responde 404 se não existe nenhuma com esse id.
def buscar_ordem(id: int):
    ordem = ordem_servico_repository.buscar(id)
    if ordem is None:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada.")
    return ordem


# Exige a OS aberta (nem entregue nem cancelada): fechada, é só para leitura (409).
def exigir_aberta(ordem):
    if ordem["status"] == "ENTREGUE":
        raise HTTPException(status_code=409, detail="A OS já foi entregue: ela é só para leitura.")
    if ordem["status"] == "CANCELADA":
        raise HTTPException(status_code=409, detail="A OS foi cancelada: ela é só para leitura.")


# A OS com os dados que as telas mostram: placa, veículo e cliente.
# Eles vêm do veículo e do cliente na hora da leitura, não ficam gravados na OS.
# mecanico, servico e valor_total também são da leitura. Enquanto os itens da OS
# (peças e serviços) não existem, ficam vazios e o valor total é 0,
# a não ser que a OS gravada já os tenha.
def ordem_completa(ordem):
    veiculo = veiculo_repository.buscar(ordem["veiculo_id"]) or {}
    cliente = cliente_repository.buscar(veiculo.get("cliente_id")) or {}
    return {
        "mecanico": None,
        "servico": None,
        "valor_total": 0.0,
        **ordem,
        "placa": veiculo.get("placa"),
        "veiculo": f"{veiculo.get('marca', '')} {veiculo.get('modelo', '')}".strip(),
        "cliente_id": cliente.get("id"),
        "cliente_nome": cliente.get("nome"),
        "cliente_telefone": cliente.get("telefone"),
    }


# As OS que passam nos filtros (3.7), da mais recente para a mais antiga.
# Usada pela listagem, pela busca geral e pela exportação.
def listar_ordens(status=None, placa=None, cliente=None):
    encontradas = []
    for ordem in ordem_servico_repository.listar():
        completa = ordem_completa(ordem)
        if status and completa["status"] != status:
            continue
        if placa and not placa_confere(completa["placa"], placa):
            continue
        if cliente and normalizar(cliente) not in normalizar(completa["cliente_nome"]):
            continue
        encontradas.append(completa)
    encontradas.sort(key=lambda o: (o["data_abertura"], o["id"]), reverse=True)
    return encontradas


def consultar_ordem(id: int):
    return ordem_completa(buscar_ordem(id))


def cadastrar_ordem(entrada: OrdemServico):
    return ordem_completa(ordem_servico_repository.criar(validar_ordem(entrada)))


def atualizar_ordem(id: int, entrada: OrdemServico):
    atual = buscar_ordem(id)
    exigir_aberta(atual)
    return ordem_completa(ordem_servico_repository.atualizar(id, validar_ordem(entrada, atual)))


def excluir_ordem(id: int):
    buscar_ordem(id)
    ordem_servico_repository.excluir(id)
