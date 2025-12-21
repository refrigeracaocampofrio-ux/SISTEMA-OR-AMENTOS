# Importação de dados via CSV

Este pipeline permite importar dados do Google Sheets (ou Excel) para o banco MySQL usado pelo sistema.

## Passo a passo
- Exporte cada aba da planilha para CSV (separador por vírgula).
- Coloque os arquivos CSV aqui em `database/import/`.
- Copie `mapping.sample.json` para `mapping.json` e ajuste os mapeamentos de colunas conforme os cabeçalhos dos seus CSVs.
- Configure as variáveis de ambiente do banco (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`).
- Execute um teste de importação:
  - `npm run import:csv -- --dry-run`
- Execute a importação definitiva:
  - `npm run import:csv`

## Formato do `mapping.json`
Defina por tabela o arquivo CSV e como os cabeçalhos mapeiam para colunas do banco.

Exemplo:
```
{
  "clientes": {
    "file": "clientes.csv",
    "columns": {
      "Nome": "nome",
      "Email": "email",
      "Telefone": "telefone"
    },
    "dedupe": { "by": ["email"] }
  },
  "agendamentos": {
    "file": "agendamentos.csv",
    "columns": {
      "Nome": "nome",
      "Email": "email",
      "Telefone": "telefone",
      "Endereco": "endereco",
      "Complemento": "complemento",
      "Cidade": "cidade",
      "Estado": "estado",
      "CEP": "cep",
      "Data": "data_agendamento",
      "Inicio": "horario_inicio",
      "Fim": "horario_fim",
      "Tipo": "tipo_servico",
      "Descricao": "descricao_problema"
    },
    "defaults": { "status": "pendente" }
  },
  "orcamentos": {
    "file": "orcamentos.csv",
    "columns": {
      "ClienteId": "cliente_id",
      "Valor": "valor_total",
      "Status": "status",
      "Equipamento": "equipamento",
      "Defeito": "defeito",
      "Validade": "validade",
      "Garantia": "garantia",
      "Tecnico": "tecnico",
      "Observacoes": "observacoes"
    }
  },
  "ordens_servico": {
    "file": "ordens.csv",
    "columns": {
      "OrcamentoId": "orcamento_id",
      "Status": "status"
    }
  },
  "estoque": {
    "file": "estoque.csv",
    "columns": {
      "Peca": "nome_peca",
      "Quantidade": "quantidade"
    },
    "dedupe": { "by": ["nome_peca"] }
  }
}
```

## Opções CLI
- `--dry-run`: não insere, apenas valida e mostra contagens.
- `--truncate`: apaga dados existentes das tabelas que serão importadas antes de inserir.
- `--table=clientes`: limita a importação a uma tabela.
- `--limit=100`: importa apenas os primeiros N registros do CSV.

## Observações
- O parser CSV suporta aspas dobradas e vírgulas em campos.
- Duplicidade: se `dedupe.by` estiver definido, o import tenta evitar inserir registros já existentes.
- Datas e números: o script tenta converter automaticamente para formatos compatíveis (por exemplo `YYYY-MM-DD` para datas, números com ponto decimal).
