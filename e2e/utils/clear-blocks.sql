-- Script SQL para limpar bloqueios de brute force antes dos testes
-- Execute este script antes de rodar os testes Playwright

-- Limpar bloqueios de emails de teste
DELETE FROM tb_blocked_emails 
WHERE email LIKE '%.teste@qexiback.com';

-- Limpar bloqueios de IPs (cuidado: isso limpa TODOS os IPs bloqueados)
DELETE FROM tb_blocked_ips 
WHERE blocked_until < NOW() + INTERVAL '1 hour';

-- Limpar tentativas de login antigas dos usuários de teste
DELETE FROM tb_login_attempts 
WHERE email LIKE '%.teste@qexiback.com' 
   OR email IN (
     'empresa.teste@qexiback.com',
     'cliente.teste@qexiback.com',
     'admin.teste@qexiback.com',
     'instituicao.teste@qexiback.com'
   );

-- Limpar tentativas de login antigas (mais de 1 hora)
DELETE FROM tb_login_attempts 
WHERE attempt_time < NOW() - INTERVAL '1 hour';

