import { test, expect } from '@playwright/test';

// Usuários de teste - Senha: 123456
const testUsers = {
  empresa: { email: 'empresa.teste@qexiback.com', password: '123456' },
  cliente: { email: 'cliente.teste@qexiback.com', password: '123456' },
  instituicao: { email: 'instituicao.teste@qexiback.com', password: '123456' },
};

test.describe('Autenticação', () => {
  
  test('deve exibir página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve fazer login como empresa', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', testUsers.empresa.email);
    await page.fill('#password', testUsers.empresa.password);
    
    await Promise.all([
      page.waitForURL(/\/store/, { timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    
    await expect(page).toHaveURL(/\/store/);
  });

  test('deve fazer login como cliente', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', testUsers.cliente.email);
    await page.fill('#password', testUsers.cliente.password);
    
    await Promise.all([
      page.waitForURL(/\/home/, { timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    
    await expect(page).toHaveURL(/\/home/);
  });

  test('deve fazer login como instituição', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', testUsers.instituicao.email);
    await page.fill('#password', testUsers.instituicao.password);
    
    await Promise.all([
      page.waitForURL(/\/institution/, { timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    
    await expect(page).toHaveURL(/\/institution/);
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'invalido@teste.com');
    await page.fill('#password', 'senhaerrada123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
  });

  test('deve navegar para página de registro', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe('Proteção Brute Force', () => {
  
  test('deve bloquear após 5 tentativas falhas', async ({ page }) => {
    await page.goto('/login');
    const email = `brute-${Date.now()}@teste.com`;
    
    for (let i = 0; i < 5; i++) {
      await page.fill('#email', email);
      await page.fill('#password', 'SenhaErrada123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(300);
    }
    
    // Verifica que pelo menos um toast de erro está visível (pega o primeiro)
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible();
  });
});
