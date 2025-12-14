import { test, expect } from '@playwright/test';

// Usuários de teste - Senha: 123456
const testUsers = {
  empresa: { email: 'empresa.teste@qexiback.com', password: '123456' },
  cliente: { email: 'cliente.teste@qexiback.com', password: '123456' },
  instituicao: { email: 'instituicao.teste@qexiback.com', password: '123456' },
};

// Helper para login com espera robusta
async function loginAs(page: any, userType: 'empresa' | 'cliente' | 'instituicao') {
  const user = testUsers[userType];
  await page.goto('/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  
  // Esperar navegação após clique (usa window.location.href)
  await Promise.all([
    page.waitForURL(/\/(store|institution|home)/, { timeout: 15000 }),
    page.click('button[type="submit"]')
  ]);
}

test.describe('Dashboard Empresa', () => {
  
  test('deve acessar dashboard após login', async ({ page }) => {
    await loginAs(page, 'empresa');
    await expect(page).toHaveURL(/\/store/);
  });

  test('deve ter menu lateral visível', async ({ page }) => {
    await loginAs(page, 'empresa');
    const nav = page.locator('nav, aside, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });
});

test.describe('Dashboard Instituição', () => {
  
  test('deve acessar dashboard após login', async ({ page }) => {
    await loginAs(page, 'instituicao');
    await expect(page).toHaveURL(/\/institution/);
  });
});

test.describe('Home Cliente', () => {
  
  test('deve acessar home após login', async ({ page }) => {
    await loginAs(page, 'cliente');
    await expect(page).toHaveURL(/\/home/);
  });
});
