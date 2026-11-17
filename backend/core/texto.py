# Funções de texto usadas por mais de um módulo (clientes, ordens, busca).
import re
import unicodedata


# Tira acentos e maiúsculas, para a busca achar "Araújo" ao digitar "araujo".
def normalizar(texto):
    texto = unicodedata.normalize("NFD", texto or "")
    return "".join(c for c in texto if not unicodedata.combining(c)).lower().strip()


# Texto opcional: vazio vira None.
def limpar(texto):
    texto = (texto or "").strip()
    return texto or None


# True se a placa contém o texto buscado ("qrs-4f" acha QRS4F21).
def placa_confere(placa, busca):
    busca = re.sub(r"[^A-Z0-9]", "", busca.upper())
    return busca != "" and busca in (placa or "")
