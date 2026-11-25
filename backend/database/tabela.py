# Ajuda os repositories a ler e gravar uma tabela usando os nomes de campo da API.
#
# A API fala "cliente_id", "quilometragem"...; o banco tem "id_cliente", "km_atual"...
# Cada repository descreve a tabela uma vez (campo da API -> coluna) e usa os métodos daqui.
# Campos que não estão no mapa (ex.: "valor_total", calculado na leitura) são ignorados ao gravar.
#
# Os nomes de tabela e coluna vêm só do código (nunca do usuário); os valores vão sempre
# como parâmetros (%s), então não há risco de SQL injection.
from database.connection import consultar, consultar_um, executar


class Tabela:
    def __init__(self, nome, chave, campos, leitura=None):
        self.nome = nome
        self.chave = chave            # coluna da chave primária, ex.: "id_cliente"
        self.campos = campos          # {"campo_da_api": "coluna"}
        # Expressões SQL de leitura diferentes da coluna pura, ex.: {"chassi": "rtrim(chassi)"}.
        self.leitura = leitura or {}

    # "id_cliente AS id, nome AS nome, ..." para o SELECT.
    def colunas_select(self, apelido=None):
        prefixo = f"{apelido}." if apelido else ""
        partes = [f"{prefixo}{self.chave} AS id"]
        for campo, coluna in self.campos.items():
            expressao = self.leitura.get(campo, f"{prefixo}{coluna}")
            partes.append(f"{expressao} AS {campo}")
        return ", ".join(partes)

    def select(self, onde="", ordem=None):
        sql = f"SELECT {self.colunas_select()} FROM {self.nome}"
        if onde:
            sql += f" WHERE {onde}"
        return sql + f" ORDER BY {ordem or self.chave}"

    def listar(self, onde="", parametros=None, ordem=None):
        return consultar(self.select(onde, ordem), parametros)

    def buscar(self, id):
        if id is None:
            return None
        return consultar_um(self.select(f"{self.chave} = %s"), (id,))

    def buscar_por(self, onde, parametros):
        return consultar_um(self.select(onde) + " LIMIT 1", parametros)

    # Só as colunas que vieram em `dados` (as outras ficam com o DEFAULT do banco).
    def criar(self, dados):
        campos = [c for c in self.campos if c in dados]
        if not campos:
            linha = consultar_um(f"INSERT INTO {self.nome} DEFAULT VALUES RETURNING {self.chave} AS id")
        else:
            colunas = ", ".join(self.campos[c] for c in campos)
            marcadores = ", ".join(["%s"] * len(campos))
            linha = consultar_um(
                f"INSERT INTO {self.nome} ({colunas}) VALUES ({marcadores}) RETURNING {self.chave} AS id",
                [dados[c] for c in campos],
            )
        return self.buscar(linha["id"])

    # Grava com um id escolhido (testes e dados iniciais) e acerta o contador do serial,
    # para o próximo INSERT sem id não repetir esse número.
    def criar_com_id(self, id, dados):
        campos = [c for c in self.campos if c in dados]
        colunas = ", ".join([self.chave, *(self.campos[c] for c in campos)])
        marcadores = ", ".join(["%s"] * (len(campos) + 1))
        executar(f"INSERT INTO {self.nome} ({colunas}) VALUES ({marcadores})", [id, *(dados[c] for c in campos)])
        executar(f"SELECT setval(pg_get_serial_sequence('{self.nome}', '{self.chave}'), "
                 f"(SELECT max({self.chave}) FROM {self.nome}))")
        return self.buscar(id)

    def atualizar(self, id, dados):
        campos = [c for c in self.campos if c in dados]
        if campos:
            atribuicoes = ", ".join(f"{self.campos[c]} = %s" for c in campos)
            executar(f"UPDATE {self.nome} SET {atribuicoes} WHERE {self.chave} = %s",
                     [*(dados[c] for c in campos), id])
        return self.buscar(id)

    def excluir(self, id):
        executar(f"DELETE FROM {self.nome} WHERE {self.chave} = %s", (id,))

    # Só para os testes: esvazia a tabela (e as que dependem dela) e volta os ids para 1.
    def esvaziar(self):
        executar(f"TRUNCATE {self.nome} RESTART IDENTITY CASCADE")
