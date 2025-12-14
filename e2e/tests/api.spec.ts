import { test, expect } from '@playwright/test';

// Usuários de teste - Senha: 123456
const testUsers = {
  empresa: { email: 'empresa.teste@qexiback.com', password: '123456' },
};

test.describe('API - Login', () => {
  
  test('deve fazer login com sucesso via API', async ({ request }) => {
    const response = await request.post('http://localhost:8080/api/cadastro/login', {
      data: {
        email: testUsers.empresa.email,
        senha: testUsers.empresa.password
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
  });

  test('deve retornar erro para credenciais inválidas', async ({ request }) => {
    const response = await request.post('http://localhost:8080/api/cadastro/login', {
      data: {
        email: 'invalido@teste.com',
        senha: 'senhaerrada'
      }
    });
    
    expect(response.status()).toBe(401);
  });
});
