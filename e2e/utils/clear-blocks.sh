#!/bin/bash
# Script para limpar bloqueios de brute force antes dos testes
# Uso: ./clear-blocks.sh

# Configurações do banco (ajuste conforme necessário)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-qexiback_db}"
DB_USER="${DB_USER:-qexiback_user}"
DB_PASS="${DB_PASS:-qexiback_pass}"

echo "Limpando bloqueios de brute force..."

# Executar SQL para limpar bloqueios
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
-- Limpar bloqueios de emails de teste
DELETE FROM tb_blocked_emails 
WHERE email LIKE '%.teste@qexiback.com';

-- Limpar bloqueios de IPs expirados
DELETE FROM tb_blocked_ips 
WHERE blocked_until < NOW();

-- Limpar tentativas de login dos usuários de teste
DELETE FROM tb_login_attempts 
WHERE email LIKE '%.teste@qexiback.com' 
   OR email IN (
     'empresa.teste@qexiback.com',
     'cliente.teste@qexiback.com',
     'admin.teste@qexiback.com',
     'instituicao.teste@qexiback.com'
   );

-- Limpar tentativas antigas (mais de 1 hora)
DELETE FROM tb_login_attempts 
WHERE attempt_time < NOW() - INTERVAL '1 hour';

SELECT 'Bloqueios limpos com sucesso!' as resultado;
EOF

if [ $? -eq 0 ]; then
  echo "✅ Bloqueios limpos com sucesso!"
else
  echo "❌ Erro ao limpar bloqueios. Verifique as credenciais do banco."
  exit 1
fi

