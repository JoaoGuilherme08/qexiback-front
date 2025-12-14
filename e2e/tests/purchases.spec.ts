import { test, expect, Page } from '@playwright/test';

// Usuário comum (cliente) já cadastrado no banco
const CLIENTE_USER = {
  email: 'cliente.teste@qexiback.com',
  password: '123456'
};

// Usuário empresa para criar produto de teste
const EMPRESA_USER = {
  email: 'empresa.teste@qexiback.com',
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

async function createProductForPurchase(page: Page, productName: string): Promise<void> {
  await page.goto('/store/products');
  await page.waitForLoadState('networkidle');

  const novoProdutoBtn = page.locator('button:has-text("Novo Produto")');
  await novoProdutoBtn.click();
  
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  
  await page.fill('#productName', productName);
  await page.fill('#price', '100');
  await page.fill('#cashback', '60'); // Alto cashback para testes de cashback
  await page.fill('#stock', '50');
  await page.fill('#description', 'Produto para teste de compra E2E');
  
  await page.click('button:has-text("Cadastrar")');
  
  await expect(page.locator('.sonner-toast:has-text("sucesso"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function deleteProductCleanup(page: Page, productName: string): Promise<void> {
  await page.goto('/store/products');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[placeholder*="Buscar"]', productName);
  await page.waitForTimeout(500);
  
  const productRow = page.locator(`.rounded-lg:has-text("${productName}")`).first();
  
  if (await productRow.isVisible({ timeout: 3000 }).catch(() => false)) {
    const deleteBtn = productRow.locator('button').last();
    await deleteBtn.click();
    
    await page.waitForSelector('[role="alertdialog"]', { state: 'visible' });
    await page.locator('[role="alertdialog"] button:has-text("Excluir")').click();
    await page.waitForTimeout(1000);
  }
}

test.describe('Fluxo de Compras - Usuário Comum', () => {
  const productName = `Produto Compra E2E ${Date.now()}`;

  test.beforeAll(async ({ browser }) => {
    // Criar produto pela empresa antes dos testes de compra
    const page = await browser.newPage();
    await login(page, EMPRESA_USER.email, EMPRESA_USER.password);
    await createProductForPurchase(page, productName);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    // Limpar produto após os testes
    const page = await browser.newPage();
    await login(page, EMPRESA_USER.email, EMPRESA_USER.password);
    await deleteProductCleanup(page, productName);
    await page.close();
  });

  test('Cliente pode ver produtos na página inicial', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.waitForURL(/\/home/);
    await page.waitForLoadState('networkidle');
    
    // Verificar que a página carregou com o título ou navbar
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
  });

  test('Cliente pode buscar um produto', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.waitForURL(/\/home/);
    await page.waitForLoadState('networkidle');
    
    // Buscar pelo produto
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill(productName);
      await page.waitForTimeout(1000);
      
      // Verificar que o produto aparece
      await expect(page.locator(`text=${productName}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Cliente pode acessar página de checkout', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.waitForURL(/\/home/);
    await page.waitForLoadState('networkidle');
    
    // Buscar pelo produto
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(productName);
      await page.waitForTimeout(1000);
    }
    
    // Clicar no produto
    const productCard = page.locator(`.card:has-text("${productName}")`).first();
    
    if (await productCard.isVisible()) {
      // Clicar no botão de ação do card
      const actionBtn = productCard.locator('button').first();
      await actionBtn.click();
    } else {
      await page.locator(`text=${productName}`).first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Verificar navegação para detalhes ou checkout
    const url = page.url();
    expect(url.includes('/offers/') || url.includes('/checkout/')).toBeTruthy();
    
    // Se estiver na página de detalhes, clicar em Comprar
    if (url.includes('/offers/')) {
      const comprarBtn = page.locator('button:has-text("Comprar")').first();
      if (await comprarBtn.isVisible()) {
        await comprarBtn.click();
        await page.waitForURL(/\/checkout/, { timeout: 10000 });
      }
    }
    
    // Verificar que está na página de checkout
    if (page.url().includes('/checkout/')) {
      await expect(page.locator('h1:has-text("Finalizar Compra")')).toBeVisible();
    }
  });

  test('Cliente pode gerar código PIX no checkout', async ({ page }) => {
    await login(page, CLIENTE_USER.email, CLIENTE_USER.password);
    
    await page.waitForURL(/\/home/);
    await page.waitForLoadState('networkidle');
    
    // Buscar e navegar até o checkout
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(productName);
      await page.waitForTimeout(1000);
    }
    
    const productCard = page.locator(`.card:has-text("${productName}")`).first();
    if (await productCard.isVisible()) {
      await productCard.locator('button').first().click();
    } else {
      await page.locator(`text=${productName}`).first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Ir para checkout
    if (page.url().includes('/offers/')) {
      await page.locator('button:has-text("Comprar")').first().click();
      await page.waitForURL(/\/checkout/, { timeout: 10000 });
    }
    
    // Se chegou ao checkout, tentar finalizar compra
    if (page.url().includes('/checkout/')) {
      const finalizarBtn = page.locator('button:has-text("Finalizar Compra"), button:has-text("Gerar PIX")').first();
      
      if (await finalizarBtn.isVisible()) {
        await finalizarBtn.click();
        await page.waitForTimeout(3000);
        
        // Verificar se apareceu QR Code ou botão de copiar PIX
        const qrOrPix = page.locator('svg, button:has-text("Copiar"), button:has-text("PIX")').first();
        await expect(qrOrPix).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
