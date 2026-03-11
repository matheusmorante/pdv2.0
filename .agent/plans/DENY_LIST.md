# 🚫 Deny List (Arquivos Protegidos)

Como medida de segurança para o modo de automação total, os seguintes arquivos e padrões são marcados como sensíveis. O agente não deve realizar operações de escrita ou leitura indiscriminada neles sem contexto específico compartilhado pelo usuário.

### 🔑 Credenciais e Segredos
- `.env` (Todas as instâncias)
- `AUDIT_CREDENTIALS.md`
- `SUPABASE_SECRET_KEY`
- Arquivos contendo `password`, `secret`, `key` no nome.

### 💾 Banco de Dados (Destrutivos)
- Scripts de `DROP TABLE` ou `TRUNCATE` sem backup prévio.

### 📂 Diretórios do Sistema
- `.git/` (Exceto comando git status)
- `.vscode/`
- `.gemini/`
