import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30000,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: false,
    launchOptions: {
      slowMo: 100, // Mais rápido: 100ms ao invés de 500ms
    },
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },

  projects: [
    {
      name: 'main-tests',
      use: { ...devices['Desktop Chrome'] },
      // Testes que não bloqueiam IP
      testMatch: [
        '**/api.spec.ts',
        '**/admin.spec.ts', 
        '**/complete-flow.spec.ts',
        '**/products.spec.ts',
        '**/purchases.spec.ts',
        '**/cashback.spec.ts',
      ],
    },
    {
      name: 'auth-tests',
      use: { ...devices['Desktop Chrome'] },
      // Auth por último (tem o teste de brute force que bloqueia IP)
      testMatch: ['**/auth.spec.ts'],
      dependencies: ['main-tests'], // Executar após main-tests
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
