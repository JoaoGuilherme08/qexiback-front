import { test as base, expect, request } from '@playwright/test';

// ============================================
// USUÁRIOS DE TESTE - Criados via V16 migration
// Senha padrão: Teste@123456
// ============================================
export const testUsers = {
  admin: {
    email: 'admin.teste@qexiback.com',
    password: 'Teste@123456',
    nome: 'Admin Teste Playwright',
    tipo: 1
  },
  empresa: {
    email: 'empresa.teste@qexiback.com',
    password: 'Teste@123456',
    nome: 'Empresa Teste Playwright',
    tipo: 2
  },
  cliente: {
    email: 'cliente.teste@qexiback.com', 
    password: 'Teste@123456',
    nome: 'Cliente Teste Playwright',
    tipo: 4
  },
  instituicao: {
    email: 'instituicao.teste@qexiback.com',
    password: 'Teste@123456',
    nome: 'Instituicao Teste Playwright',
    tipo: 3
  }
};

// URLs base
export const API_BASE_URL = 'http://localhost:8080/api';
export const FRONTEND_BASE_URL = 'http://localhost:5173';

// Helper para esperar toast
export async function waitForToast(page: any, text?: string) {
  const toastSelector = '[data-sonner-toast], [role="status"], .toast';
  await page.waitForSelector(toastSelector, { timeout: 5000 });
  if (text) {
    await expect(page.locator(toastSelector)).toContainText(text);
  }
}

// Helper para gerar dados únicos de teste
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `teste${timestamp}@email.com`,
    cnpj: `${Math.floor(10000000000000 + Math.random() * 89999999999999)}`,
    phone: `119${Math.floor(10000000 + Math.random() * 89999999)}`
  };
}

// Helper para limpar bloqueios de brute force antes dos testes
export async function clearBruteForceBlocks(request: any) {
  try {
    // Limpar bloqueios via SQL direto (se tiver acesso ao banco)
    // Ou criar um endpoint admin para isso
    // Por enquanto, vamos tentar limpar via requisição SQL se possível
    // Nota: Isso requer acesso direto ao banco ou um endpoint admin
    
    // Alternativa: Limpar tentativas antigas que podem estar causando bloqueios
    // Fazendo uma requisição que força limpeza (se houver endpoint)
    await request.post(`${API_BASE_URL}/admin/cleanup-blocks`).catch(() => {
      // Se não houver endpoint, ignorar - será limpo manualmente
    });
  } catch (e) {
    // Ignorar erros - pode não ter endpoint de limpeza
  }
}

// Helper para limpar bloqueios específicos de email e IP
export async function clearBlockForEmailAndIp(request: any, email: string, ipAddress?: string) {
  try {
    // Tentar limpar via SQL direto se possível
    // Por enquanto, vamos documentar que precisa limpar manualmente
    // ou criar um script SQL para isso
    
    // Se houver endpoint admin:
    // await request.delete(`${API_BASE_URL}/admin/blocked-emails/${email}`);
    // if (ipAddress) {
    //   await request.delete(`${API_BASE_URL}/admin/blocked-ips/${ipAddress}`);
    // }
  } catch (e) {
    // Ignorar
  }
}

// Fixture customizado com helpers
export const test = base.extend<{
  loginAs: (userType: 'admin' | 'empresa' | 'cliente' | 'instituicao') => Promise<void>;
  apiUrl: string;
}>({
  apiUrl: API_BASE_URL,
  
  loginAs: async ({ page }, use) => {
    const loginAs = async (userType: 'admin' | 'empresa' | 'cliente' | 'instituicao') => {
      const user = testUsers[userType];
      await page.goto('/login');
      
      // Preencher formulário usando IDs corretos
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);
      await page.click('button[type="submit"]');
      
      // Esperar redirecionamento após login
      await page.waitForURL(/\/(store|institution|home|dashboard)/, { timeout: 10000 });
    };
    await use(loginAs);
  },
});

export { expect, request };
