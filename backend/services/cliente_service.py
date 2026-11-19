# Regras de negócio dos clientes.
import re
from datetime import date

from fastapi import HTTPException

from core.texto import limpar, normalizar
from repositories import cliente_repository, ordem_servico_repository, veiculo_repository
from schemas.cliente_schema import Cliente
from services import ordem_servico_service

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# Confere os campos e devolve os dados prontos para gravar: telefone no formato
# (85) 90000-0001 e e-mail em minúsculas. Na atualização, o id do próprio cliente
# é ignorado na checagem de e-mail repetido.
def validar_cliente(entrada: Cliente, id: int | None = None):
    nome = entrada.nome.strip()
    if nome == "":
        raise HTTPException(status_code=422, detail="O nome é obrigatório.")

    digitos = re.sub(r"\D", "", entrada.telefone)
    if len(digitos) not in (10, 11):
        raise HTTPException(status_code=422, detail="Telefone inválido. Use DDD + número, ex.: (85) 90000-0001.")
    corte = 7 if len(digitos) == 11 else 6
    telefone = f"({digitos[:2]}) {digitos[2:corte]}-{digitos[corte:]}"

    email = limpar(entrada.email)
    if email is not None:
        email = email.lower()
        if not EMAIL.match(email):
            raise HTTPException(status_code=422, detail="E-mail inválido.")
        repetido = cliente_repository.buscar_por_email(email)
        if repetido is not None and repetido["id"] != id:
            raise HTTPException(status_code=409, detail="Já existe um cliente com esse e-mail.")

    # CPF (11 dígitos) ou CNPJ (14 dígitos), gravado só com os números.
    cpf_cnpj = limpar(entrada.cpf_cnpj)
    if cpf_cnpj is not None:
        cpf_cnpj = re.sub(r"\D", "", cpf_cnpj)
        if len(cpf_cnpj) not in (11, 14):
            raise HTTPException(status_code=422, detail="CPF/CNPJ inválido. Use 11 ou 14 dígitos.")
        repetido = cliente_repository.buscar_por_cpf_cnpj(cpf_cnpj)
        if repetido is not None and repetido["id"] != id:
            raise HTTPException(status_code=409, detail="Já existe um cliente com esse CPF/CNPJ.")

    # Endereço (opcional). CEP com 8 dígitos e UF com 2 letras maiúsculas, como pede o banco.
    cep = limpar(entrada.cep)
    if cep is not None:
        cep = re.sub(r"\D", "", cep)
        if len(cep) != 8:
            raise HTTPException(status_code=422, detail="CEP inválido. Use 8 dígitos, ex.: 60000-000.")
    uf = limpar(entrada.uf)
    if uf is not None:
        uf = uf.upper()
        if not re.fullmatch(r"[A-Z]{2}", uf):
            raise HTTPException(status_code=422, detail="UF inválida. Use a sigla do estado, ex.: CE.")

    return {"nome": nome, "cpf_cnpj": cpf_cnpj, "telefone": telefone, "email": email,
            "cliente_desde": entrada.cliente_desde or date.today(),
            "cep": cep, "logradouro": limpar(entrada.logradouro), "numero": limpar(entrada.numero),
            "complemento": limpar(entrada.complemento), "bairro": limpar(entrada.bairro),
            "cidade": limpar(entrada.cidade), "uf": uf}


# Devolve o cliente, ou responde 404 se não existe nenhum com esse id.
def buscar_cliente(id: int):
    cliente = cliente_repository.buscar(id)
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return cliente


# O cliente com a quantidade de veículos (a tela mostra "2 veículos").
# A quantidade é calculada na leitura, não é gravada.
def cliente_completo(cliente):
    return {**cliente, "quantidade_veiculos": len(veiculo_repository.listar_por_cliente(cliente["id"]))}


def listar_clientes(nome=None):
    encontrados = cliente_repository.listar()
    if nome:
        encontrados = [c for c in encontrados if normalizar(nome) in normalizar(c["nome"])]
    encontrados.sort(key=lambda c: normalizar(c["nome"]))
    return [cliente_completo(c) for c in encontrados]


def consultar_cliente(id: int):
    return cliente_completo(buscar_cliente(id))


def cadastrar_cliente(entrada: Cliente):
    return cliente_completo(cliente_repository.criar(validar_cliente(entrada)))


def atualizar_cliente(id: int, entrada: Cliente):
    buscar_cliente(id)
    return cliente_completo(cliente_repository.atualizar(id, validar_cliente(entrada, id)))


# Um cliente com veículos vinculados não pode ser excluído (409).
def excluir_cliente(id: int):
    buscar_cliente(id)
    if veiculo_repository.listar_por_cliente(id):
        raise HTTPException(
            status_code=409,
            detail="Não é possível excluir: o cliente possui veículos vinculados.",
        )
    cliente_repository.excluir(id)


def listar_veiculos_do_cliente(id: int):
    buscar_cliente(id)
    return veiculo_repository.listar_por_cliente(id)


# As ordens de serviço dos veículos do cliente, da mais recente para a mais antiga.
def consultar_historico_do_cliente(id: int):
    buscar_cliente(id)
    ids_dos_veiculos = {v["id"] for v in veiculo_repository.listar_por_cliente(id)}
    historico = [ordem_servico_service.ordem_completa(o)
                 for o in ordem_servico_repository.listar_por_veiculos(ids_dos_veiculos)]
    historico.sort(key=lambda o: (o["data_abertura"], o["id"]), reverse=True)
    return historico
