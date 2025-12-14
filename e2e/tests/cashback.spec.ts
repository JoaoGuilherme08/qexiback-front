import { test, expect, Page } from '@playwright/test';

// Usuário comum (cliente) já cadastrado no banco
const CLIENTE_USER = {
  email: 'cliente.teste@qexiback.com',
  password: '123456'
};

// Admin para aprovação de saque
const ADMIN_USER = {
  email: 'admin.teste@qexiback.com',
  password: '123456'
};

// Helpers
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  
  await page.locator('button[type="submit"]').click();
  
  await page.waitForTimeout(3000);
  await expect(page).not.toHaveURL('/login', { timeout: 10000 });
}

test.describe('Carteira e Cashback', () => {
  
  test('Cliente pode acessar sua carteira', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.waitForURL(/\/home/);
    await page.waitForLoadState('networkidle');
    
    // Navegar para a carteira
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Verificar que a página da carteira carregou
    await expect(page.locator('h1:has-text("Minha Carteira")')).toBeVisible({ timeout: 10000 });
  });

  test('Cliente pode ver saldo na carteira', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Verificar que há elementos de saldo
    await expect(page.locator('text=R$').first()).toBeVisible({ timeout: 10000 });
    
    // Verificar elementos de saldo disponível, pendente, etc
    await expect(page.locator('text=Saldo Total')).toBeVisible();
  });

  test('Cliente pode ver botão de saque', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Verificar que há botão de saque
    const saqueBtn = page.locator('button:has-text("Solicitar Saque")');
    await expect(saqueBtn).toBeVisible({ timeout: 10000 });
  });

  test('Cliente pode ver botão de doação', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    
    // Verificar que há botão de doação
    const doacaoBtn = page.locator('button:has-text("Ver Instituições")');
    await expect(doacaoBtn).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Aprovação de Saques - Admin', () => {
  
  test('Admin pode acessar página de aprovação de saques', async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    
    await page.waitForURL(/\/home/);
    await page.waitForLoadState('networkidle');
    
    // Navegar para página de aprovação de saques
    await page.goto('/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    
    // Verificar que a página carregou
    await expect(page.locator('text=Aprovação de Saques')).toBeVisible({ timeout: 10000 });
  });

  test('Admin pode ver tabs de status de saques', async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    
    await page.goto('/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    
    // Verificar que há tabs de status
    await expect(page.locator('[role="tablist"]')).toBeVisible({ timeout: 10000 });
  });

  test('Admin pode filtrar por saques pendentes', async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    
    await page.goto('/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    
    // Clicar na aba de pendentes
    const pendentesTab = page.locator('[role="tab"]:has-text("Pendentes")');
    await pendentesTab.click();
    await page.waitForTimeout(500);
    
    // A aba deve estar selecionada
    await expect(pendentesTab).toHaveAttribute('data-state', 'active');
  });

  test('Admin pode filtrar por saques aprovados', async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    
    await page.goto('/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    
    // Clicar na aba de aprovados
    const aprovadosTab = page.locator('[role="tab"]:has-text("Aprovados")');
    await aprovadosTab.click();
    await page.waitForTimeout(500);
    
    // A aba deve estar selecionada
    await expect(aprovadosTab).toHaveAttribute('data-state', 'active');
  });

  test('Admin pode filtrar por saques rejeitados', async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    
    await page.goto('/admin/withdrawals');
    await page.waitForLoadState('networkidle');
    
    // Clicar na aba de rejeitados
    const rejeitadosTab = page.locator('[role="tab"]:has-text("Rejeitados")');
    await rejeitadosTab.click();
    await page.waitForTimeout(500);
    
    // A aba deve estar selecionada
    await expect(rejeitadosTab).toHaveAttribute('data-state', 'active');
  });
});
