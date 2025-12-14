/**
 * Utilitários para gerar dados aleatórios para testes E2E
 */

/**
 * Gera um sufixo único baseado em timestamp e random
 */
export function generateUniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Gera um email aleatório para testes
 */
export function generateEmail(): string {
  const suffix = generateUniqueSuffix();
  return `teste_${suffix}@playwright.test`;
}

/**
 * Gera um nome aleatório para testes
 */
export function generateName(): string {
  const nomes = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda'];
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Almeida', 'Lima'];
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  return `${nome} ${sobrenome} Teste`;
}

/**
 * Gera um CNPJ válido aleatório
 * O algoritmo gera os 12 primeiros dígitos aleatoriamente e calcula os 2 dígitos verificadores
 */
export function generateCNPJ(): string {
  const randomDigits = (): number[] => {
    const digits: number[] = [];
    for (let i = 0; i < 8; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    // Filial (0001)
    digits.push(0, 0, 0, 1);
    return digits;
  };

  const calculateVerifier = (digits: number[], weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += digits[i] * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digits = randomDigits();
  
  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  digits.push(calculateVerifier(digits, weights1));
  
  // Segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  digits.push(calculateVerifier(digits, weights2));

  // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
  const cnpj = digits.join('');
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
}

/**
 * Gera um nome de empresa aleatório
 */
export function generateCompanyName(): string {
  const prefixes = ['Tech', 'Digital', 'Prime', 'Global', 'Smart', 'Fast', 'Pro', 'Max'];
  const sufixes = ['Solutions', 'Services', 'Corp', 'Group', 'Labs', 'Systems', 'Hub', 'Works'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const sufix = sufixes[Math.floor(Math.random() * sufixes.length)];
  const suffix = generateUniqueSuffix().slice(-6);
  return `${prefix} ${sufix} ${suffix}`;
}

/**
 * Gera um nome de instituição/ONG aleatório
 */
export function generateInstitutionName(): string {
  const prefixes = ['Instituto', 'Associação', 'Fundação', 'ONG', 'Projeto'];
  const temas = ['Esperança', 'Amor', 'Vida Nova', 'Solidariedade', 'Futuro', 'Bem-Estar', 'Luz', 'União'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const tema = temas[Math.floor(Math.random() * temas.length)];
  const suffix = generateUniqueSuffix().slice(-6);
  return `${prefix} ${tema} ${suffix}`;
}

/**
 * Gera uma senha forte que passa na validação
 */
export function generateStrongPassword(): string {
  // Senha deve ter: mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial
  return 'Teste@123456';
}

/**
 * Gera um telefone aleatório formatado
 */
export function generatePhone(): string {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '81'][Math.floor(Math.random() * 8)];
  const part1 = Math.floor(Math.random() * 90000 + 10000);
  const part2 = Math.floor(Math.random() * 9000 + 1000);
  return `(${ddd}) 9${part1}-${part2}`;
}

/**
 * Gera um endereço aleatório
 */
export function generateAddress(): string {
  const ruas = ['Rua das Flores', 'Av. Brasil', 'Rua São Paulo', 'Av. Central', 'Rua da Paz'];
  const rua = ruas[Math.floor(Math.random() * ruas.length)];
  const numero = Math.floor(Math.random() * 1000 + 1);
  return `${rua}, ${numero}`;
}

/**
 * Gera uma cidade aleatória
 */
export function generateCity(): string {
  const cidades = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'];
  return cidades[Math.floor(Math.random() * cidades.length)];
}

/**
 * Gera um estado aleatório (2 letras)
 */
export function generateState(): string {
  const estados = ['SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'SC', 'GO'];
  return estados[Math.floor(Math.random() * estados.length)];
}

/**
 * Dados completos de um usuário para registro
 */
export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Gera dados completos de um usuário para teste
 */
export function generateTestUser(): TestUser {
  return {
    name: generateName(),
    email: generateEmail(),
    password: generateStrongPassword()
  };
}

/**
 * Dados completos de uma empresa para registro
 */
export interface TestCompany {
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  descricao: string;
}

/**
 * Gera dados completos de uma empresa para teste
 */
export function generateTestCompany(): TestCompany {
  return {
    nomeFantasia: generateCompanyName(),
    cnpj: generateCNPJ(),
    email: generateEmail(),
    telefone: generatePhone(),
    endereco: generateAddress(),
    cidade: generateCity(),
    estado: generateState(),
    descricao: 'Empresa de teste criada automaticamente pelo Playwright'
  };
}

/**
 * Dados completos de uma instituição para registro
 */
export interface TestInstitution {
  nomeInstituicao: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  descricao: string;
}

/**
 * Gera dados completos de uma instituição para teste
 */
export function generateTestInstitution(): TestInstitution {
  return {
    nomeInstituicao: generateInstitutionName(),
    cnpj: generateCNPJ(),
    email: generateEmail(),
    telefone: generatePhone(),
    endereco: generateAddress(),
    cidade: generateCity(),
    estado: generateState(),
    descricao: 'Instituição de teste criada automaticamente pelo Playwright'
  };
}
