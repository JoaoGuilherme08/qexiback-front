import { test, expect, Page } from '@playwright/test';

// Usuário empresa já cadastrado e aprovado no banco
// Senha: 123456 (conforme outros testes que funcionam)
const EMPRESA_USER = {
  email: 'empresa.teste@qexiback.com',
  password: '123456'
};

// Helper para limpar bloqueios de brute force
// IMPORTANTE: Execute o script clear-blocks.sh antes de rodar os testes
// ou limpe manualmente no banco:
// DELETE FROM tb_blocked_emails WHERE email LIKE '%.teste@qexiback.com';
// DELETE FROM tb_blocked_ips WHERE blocked_until < NOW();
// DELETE FROM tb_login_attempts WHERE email LIKE '%.teste@qexiback.com';
async function clearBruteForceBlocks(request: any) {
  // Por enquanto, apenas log - execute o script clear-blocks.sh manualmente
  // ou configure um endpoint admin para limpar bloqueios
  console.log('⚠️  Lembre-se de executar ./e2e/utils/clear-blocks.sh antes dos testes');
}

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

async function createProduct(page: Page, productName: string): Promise<void> {
  await page.goto('/store/products');
  await page.waitForLoadState('networkidle');

  const novoProdutoBtn = page.locator('button:has-text("Novo Produto")');
  await novoProdutoBtn.click();
  
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  
  await page.fill('#productName', productName);
  await page.fill('#price', '100');
  await page.fill('#cashback', '15');
  await page.fill('#stock', '50');
  await page.fill('#description', 'Produto de teste E2E');
  
  await page.click('button:has-text("Cadastrar")');
  
  await expect(page.locator('.sonner-toast:has-text("sucesso"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function deleteProduct(page: Page, productName: string): Promise<boolean> {
  await page.goto('/store/products');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[placeholder*="Buscar"]', productName);
  await page.waitForTimeout(500);
  
  // Procurar o produto na lista
  const productLocator = page.locator(`text=${productName}`).first();
  
  if (await productLocator.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Encontrar o row do produto
    const productRow = page.locator(`.rounded-lg:has-text("${productName}")`).first();
    
    // Botão de deletar é o terceiro botão (toggle, edit, delete)
    const deleteBtn = productRow.locator('button').last();
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      await page.waitForSelector('[role="alertdialog"]', { state: 'visible' });
      await page.locator('[role="alertdialog"] button:has-text("Excluir")').click();
      
      await page.waitForTimeout(1000);
      return true;
    }
  }
  return false;
}

test.describe('Gestão de Produtos - Empresa', () => {
  
  // Limpar bloqueios antes de cada teste
  test.beforeEach(async ({ request }) => {
    await clearBruteForceBlocks(request);
  });
  
  test('Empresa deve criar um novo produto', async ({ page }) => {
    const productName = `Produto Criar ${Date.now()}`;
    
    await login(page, EMPRESA_USER.email, EMPRESA_USER.password);
    await page.goto('/store/products');
    await page.waitForLoadState('networkidle');

    const novoProdutoBtn = page.locator('button:has-text("Novo Produto")');
    await expect(novoProdutoBtn).toBeVisible();
    
    await novoProdutoBtn.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    await page.fill('#productName', productName);
    await page.fill('#price', '100');
    await page.fill('#cashback', '15');
    await page.fill('#stock', '50');
    await page.fill('#description', 'Descrição do produto de teste E2E');
    
    await page.click('button:has-text("Cadastrar")');
    
    await expect(page.locator('.sonner-toast:has-text("sucesso"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Verificar se o produto aparece na lista
    await expect(page.locator(`text=${productName}`).first()).toBeVisible({ timeout: 10000 });
    
    // Cleanup: deletar o produto criado
    await deleteProduct(page, productName);
  });

  test('Empresa deve editar um produto', async ({ page }) => {
    const productName = `Produto Editar ${Date.now()}`;
    
    await login(page, EMPRESA_USER.email, EMPRESA_USER.password);
    
    // Criar produto primeiro
    await createProduct(page, productName);
    
    // Agora editar
    await page.goto('/store/products');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="Buscar"]', productName);
    await page.waitForTimeout(500);
    
    // Encontrar o produto - é um div com classe rounded-lg
    const productRow = page.locator(`.rounded-lg:has-text("${productName}")`).first();
    await expect(productRow).toBeVisible({ timeout: 10000 });
    
    // Botão de editar é o segundo botão (toggle, edit, delete)
    const buttons = productRow.locator('button');
    const editBtn = buttons.nth(1);
    await editBtn.click();
    
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Alterar valores - IDs de edição são diferentes
    await page.fill('#editPrice', '120');
    await page.fill('#editCashback', '20');
    
    await page.locator('[role="dialog"] button:has-text("Salvar")').first().click();
    
    await expect(page.locator('.sonner-toast:has-text("atualizado"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
    
    // Cleanup
    await deleteProduct(page, productName);
  });

  test('Empresa deve remover um produto', async ({ page }) => {
    const productName = `Produto Remover ${Date.now()}`;
    
    await login(page, EMPRESA_USER.email, EMPRESA_USER.password);
    
    // Criar produto primeiro
    await createProduct(page, productName);
    
    // Verificar que o produto existe
    await page.goto('/store/products');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder*="Buscar"]', productName);
    await page.waitForTimeout(500);
    
    await expect(page.locator(`text=${productName}`).first()).toBeVisible({ timeout: 10000 });
    
    // Encontrar o produto row
    const productRow = page.locator(`.rounded-lg:has-text("${productName}")`).first();
    
    // Botão de deletar é o último (terceiro)
    const deleteBtn = productRow.locator('button').last();
    await deleteBtn.click();
    
    await page.waitForSelector('[role="alertdialog"]', { state: 'visible' });
    await page.locator('[role="alertdialog"] button:has-text("Excluir")').click();
    
    await expect(page.locator('.sonner-toast:has-text("removido"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
    
    // Verificar que o produto não existe mais
    await page.fill('input[placeholder*="Buscar"]', productName);
    await page.waitForTimeout(1000);
    
    await expect(page.locator(`text=${productName}`).first()).not.toBeVisible({ timeout: 5000 });
  });

  test('Empresa deve salvar quantidade de estoque corretamente', async ({ page }) => {
    const productName = `Produto Estoque ${Date.now()}`;
    const quantidadeEstoque = 75;
    
    await login(page, EMPRESA_USER.email, EMPRESA_USER.password);
    await page.goto('/store/products');
    await page.waitForLoadState('networkidle');

    // Criar produto com quantidade de estoque
    const novoProdutoBtn = page.locator('button:has-text("Novo Produto")');
    await novoProdutoBtn.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    await page.fill('#productName', productName);
    await page.fill('#price', '150');
    await page.fill('#cashback', '10');
    await page.fill('#stock', quantidadeEstoque.toString());
    await page.fill('#description', 'Produto para testar estoque');
    
    await page.click('button:has-text("Cadastrar")');
    
    await expect(page.locator('.sonner-toast:has-text("sucesso"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Verificar se o produto aparece na lista
    await expect(page.locator(`text=${productName}`).first()).toBeVisible({ timeout: 10000 });
    
    // Verificar se a quantidade de estoque está sendo exibida corretamente
    const productRow = page.locator(`.rounded-lg:has-text("${productName}")`).first();
    await expect(productRow).toBeVisible();
    
    // Verificar se o estoque aparece na interface (pode estar em um badge ou texto)
    const stockText = productRow.locator(`text=${quantidadeEstoque}`);
    await expect(stockText.first()).toBeVisible({ timeout: 5000 });
    
    // Editar o produto e verificar se o estoque é mantido/carregado corretamente
    const buttons = productRow.locator('button');
    const editBtn = buttons.nth(1);
    await editBtn.click();
    
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Verificar se o campo de estoque está preenchido com o valor correto
    const stockInput = page.locator('#editStock');
    await expect(stockInput).toHaveValue(quantidadeEstoque.toString());
    
    // Alterar o estoque
    const novaQuantidade = 100;
    await page.fill('#editStock', novaQuantidade.toString());
    
    await page.locator('[role="dialog"] button:has-text("Salvar")').first().click();
    
    await expect(page.locator('.sonner-toast:has-text("atualizado"), [data-sonner-toast]:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Verificar se o novo estoque foi salvo
    await page.fill('input[placeholder*="Buscar"]', productName);
    await page.waitForTimeout(500);
    
    const updatedProductRow = page.locator(`.rounded-lg:has-text("${productName}")`).first();
    await expect(updatedProductRow).toBeVisible();
    
    // Verificar se o novo estoque aparece
    const newStockText = updatedProductRow.locator(`text=${novaQuantidade}`);
    await expect(newStockText.first()).toBeVisible({ timeout: 5000 });
    
    // Verificar novamente editando para confirmar que foi salvo no banco
    const editBtnAgain = updatedProductRow.locator('button').nth(1);
    await editBtnAgain.click();
    
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    const stockInputAgain = page.locator('#editStock');
    await expect(stockInputAgain).toHaveValue(novaQuantidade.toString());
    
    // Fechar dialog e fazer cleanup
    await page.locator('[role="dialog"] button:has-text("Cancelar")').first().click();
    await deleteProduct(page, productName);
  });
});
