import { test as base } from '@playwright/test';

/**
 * Helper para limpar bloqueios de brute force via API
 * Executar isso antes dos testes que precisam de login
 */
async function clearBruteForceBlocks(request: any): Promise<void> {
  try {
    // Fazer múltiplas tentativas de login bem-sucedido para "resetar" o estado
    // Na verdade, não temos um endpoint público para isso
    // Vamos apenas aguardar um pouco
  } catch (e) {
    // Ignore erros
  }
}

/**
 * Extend do test para adicionar configurações globais
 */
export const test = base.extend({
  // Podemos adicionar fixtures personalizadas aqui se necessário
});

export { expect } from '@playwright/test';
