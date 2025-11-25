// Utilitários de validação

const CPF_REGEX = /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;
const CNPJ_REGEX = /^(?:\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/;

export const sanitizeDocument = (value: string): string => value.replace(/\D/g, '');

export const isValidCpfRegex = (value: string): boolean => {
  const clean = sanitizeDocument(value);
  return /^\d{11}$/.test(clean);
};

export const isValidCnpjRegex = (value: string): boolean => {
  const clean = sanitizeDocument(value);
  return /^\d{14}$/.test(clean);
};

export type DocumentoTipo = 'CPF' | 'CNPJ' | null;

export const detectDocumentType = (value: string): DocumentoTipo => {
  const clean = sanitizeDocument(value);
  if (/^\d{11}$/.test(clean)) return 'CPF';
  if (/^\d{14}$/.test(clean)) return 'CNPJ';
  return null;
};

/**
 * Valida CNPJ utilizando regex e dígitos verificadores
 */
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = sanitizeDocument(cnpj);

  // Checa formato válido via regex
  if (!CNPJ_REGEX.test(cnpj) && cleanCNPJ.length !== 14) return false;
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let weight = 5;
  
  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(cleanCNPJ[12]) !== digit1) return false;
  
  // Segundo dígito verificador
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(cleanCNPJ[13]) === digit2;
};

/**
 * Aplica máscara de CNPJ
 */
export const maskCNPJ = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 14) {
    return cleanValue
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return value;
};

export const maskCPF = (value: string): string => {
  const cleanValue = sanitizeDocument(value).slice(0, 11);
  return cleanValue
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida senha
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número' };
  }
  
  return { isValid: true };
};

/**
 * Extrai cidade e estado de um endereço
 */
export const parseAddress = (address: string): { cidade?: string; estado?: string } => {
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];
    
    // Verifica se a última parte tem formato "Cidade - UF"
    if (lastPart.includes(' - ') && lastPart.length >= 5) {
      const [cidade, estado] = lastPart.split(' - ');
      return { cidade: cidade.trim(), estado: estado.trim() };
    }
    
    // Se não, assume que a penúltima parte é a cidade e a última é o estado
    return { 
      cidade: secondLastPart, 
      estado: lastPart.length === 2 ? lastPart.toUpperCase() : undefined 
    };
  }
  
  return {};
};
