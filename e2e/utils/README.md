# Utilitários para Testes E2E

## Limpar Bloqueios de Brute Force

Antes de rodar os testes Playwright, é necessário limpar os bloqueios de brute force que podem ter sido criados por tentativas de login falhadas.

### Opção 1: Script Shell (Recomendado)

Execute o script antes de rodar os testes:

```bash
cd qexiback-front/e2e/utils
./clear-blocks.sh
```

Ou configure as variáveis de ambiente se necessário:

```bash
DB_HOST=localhost DB_PORT=5432 DB_NAME=qexiback_db DB_USER=qexiback_user DB_PASS=qexiback_pass ./clear-blocks.sh
```

### Opção 2: SQL Direto

Execute o SQL diretamente no banco:

```bash
psql -h localhost -U qexiback_user -d qexiback_db -f clear-blocks.sql
```

Ou copie e cole o conteúdo de `clear-blocks.sql` no seu cliente SQL.

### O que o script faz?

1. Remove bloqueios de emails de teste (`*.teste@qexiback.com`)
2. Remove bloqueios de IPs expirados
3. Remove tentativas de login antigas dos usuários de teste
4. Remove tentativas de login com mais de 1 hora

### Quando executar?

- Antes de rodar os testes Playwright
- Após múltiplas tentativas de login falhadas
- Quando os testes começarem a falhar por bloqueio de IP/Email

