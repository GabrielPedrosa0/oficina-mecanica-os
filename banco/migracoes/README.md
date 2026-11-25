# Migrações do banco

Para mudar o banco (nova coluna, nova tabela, índice, dados fixos), crie um arquivo `.sql` aqui.
Não edite `../modelo_logico_oficina.sql` para isso: no Supabase ele só roda quando o banco está vazio.

## Como criar

1. Dê ao arquivo o próximo número e um nome curto: `001_email_mecanico.sql`, `002_tabela_fornecedor.sql`...
   Os arquivos são aplicados em ordem de nome, então sempre use 3 dígitos.
2. Escreva o SQL normalmente. **Não** use `BEGIN`/`COMMIT`: cada arquivo já roda numa transação.
3. Teste no seu banco de testes (`TEST_DATABASE_URL`): os testes aplicam as migrações sozinhos.
4. Faça o push para a `main`. O GitHub Actions aplica o arquivo no Supabase.

Para aplicar à mão: `cd backend && python -m database.migrar`.

## Regras

- **Nunca altere nem renomeie um arquivo já aplicado.** Ele não roda de novo. Para corrigir, crie outro arquivo.
- Se uma migração der erro, nada dela fica no banco e ela não é anotada. Corrija o arquivo e rode de novo.
- As aplicadas ficam anotadas na tabela `migracao` do banco (nome e data).

Exemplo (`001_email_mecanico.sql`):

```sql
ALTER TABLE mecanico ADD COLUMN email varchar(120);
```
