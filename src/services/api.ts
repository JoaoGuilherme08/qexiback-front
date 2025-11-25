const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpfCnpj: string;
  tipoUsuario: 'CLIENTE' | 'EMPRESA' | 'INSTITUICAO' | 'ADMIN' | 'ADMINISTRADOR_EMPRESA' | 'FUNCIONARIO';
  telefone?: string;
  endereco?: string;
  empresaId?: string;
  instituicaoId?: string;
  dtCadastro: string;
  status: boolean;
}

export interface UsuarioUpdateRequest {
  nome: string;
  email: string;
  telefone?: string;
  cpfCnpj?: string;
  endereco?: string;
  empresaId?: string;
  instituicaoId?: string;
}

export interface Empresa {
  id: string;
  userId: string;
  nomeFantasia: string;
  cnpjEmpresa: string;
  descricaoEmpresa?: string;
  enderecoEmpresa?: string;
  cidadeEmpresa?: string;
  estadoEmpresa?: string;
  email?: string;
  telefone?: string;
  statusEmpresa: boolean;
  dtCadastro: string;
  dtAtualizacao?: string;
  nomeProprietario?: string;
  emailProprietario?: string;
}

export interface EmpresaCreateRequest {
  userId: string;
  nomeFantasia: string;
  cnpjEmpresa: string;
  descricaoEmpresa?: string;
  enderecoEmpresa?: string;
  cidadeEmpresa?: string;
  estadoEmpresa?: string;
  statusEmpresa?: boolean;
  email?: string;
  telefone?: string;
}

export interface CadastroEmpresaRequest {
  nome: string;
  email: string;
  senha: string;
  nomeFantasia: string;
  cnpjEmpresa: string;
  descricaoEmpresa?: string;
  enderecoEmpresa?: string;
  cidadeEmpresa?: string;
  estadoEmpresa?: string;
  telefone?: string;
  chavePix?: string;
}

export interface CadastroResponse {
  success: boolean;
  message: string;
  data?: Empresa;
}

export interface Instituicao {
  id: string;
  userId: string;
  nomeInstituicao: string;
  cnpjInstituicao: string;
  descricaoInstituicao?: string;
  enderecoInstituicao?: string;
  cidadeInstituicao?: string;
  estadoInstituicao?: string;
  email?: string;
  telefone?: string;
  chavePix?: string;
  statusInstituicao: boolean;
  dtCadastro: string;
  dtAtualizacao?: string;
  nomeResponsavel?: string;
  emailResponsavel?: string;
}

export interface InstituicaoCreateRequest {
  userId: string;
  nomeInstituicao: string;
  cnpjInstituicao: string;
  descricaoInstituicao?: string;
  enderecoInstituicao?: string;
  cidadeInstituicao?: string;
  estadoInstituicao?: string;
  email?: string;
  telefone?: string;
  chavePix?: string;
  statusInstituicao?: boolean;
}

export type InstituicaoUpdateRequest = Partial<Omit<InstituicaoCreateRequest, 'userId' | 'cnpjInstituicao'>> & {
  statusInstituicao?: boolean;
};

export interface FuncionarioCreateRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpfCnpj?: string;
}

export interface FuncionarioUpdateRequest {
  nome: string;
  email: string;
  telefone?: string;
  cpfCnpj?: string;
  senha?: string;
  endereco?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    nome: string;
    email: string;
    tipoUsuario: string;
    token: string;
    expiresIn: number;
    telefone?: string;
    endereco?: string;
    cpfCnpj?: string;
    empresaId?: string;
    nomeFantasia?: string;
    cnpjEmpresa?: string;
    instituicaoId?: string;
    nomeInstituicao?: string;
    cnpjInstituicao?: string;
    chavePixInstituicao?: string;
  };
}

export const apiService = {

  async atualizarCpfCnpj(usuarioId: string, cpfCnpj: string): Promise<Usuario> {
    const response = await fetch(`${API_URL}/usuarios/${usuarioId}/cpf-cnpj?cpfCnpj=${encodeURIComponent(cpfCnpj)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar CPF/CNPJ');
    }

    return response.json();
  },

  async atualizarUsuario(id: string, data: UsuarioUpdateRequest): Promise<Usuario> {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar usuário');
    }

    return response.json();
  },

  // Métodos de Empresa
  async criarEmpresa(data: EmpresaCreateRequest): Promise<Empresa> {
    const response = await fetch(`${API_URL}/empresas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar empresa');
    }

    return response.json();
  },

  async buscarEmpresaPorUsuario(userId: string): Promise<Empresa[]> {
    const response = await fetch(`${API_URL}/empresas/usuario/${userId}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar empresas do usuário');
    }

    return response.json();
  },

  async buscarEmpresaPorId(id: string): Promise<Empresa> {
    const response = await fetch(`${API_URL}/empresas/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar empresa');
    }

    return response.json();
  },

  async atualizarEmpresa(id: string, data: EmpresaCreateRequest): Promise<Empresa> {
    const response = await fetch(`${API_URL}/empresas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar empresa');
    }

    return response.json();
  },

  // Métodos de Instituição
  async criarInstituicao(data: InstituicaoCreateRequest): Promise<Instituicao> {
    const response = await fetch(`${API_URL}/instituicoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao criar instituição');
    }

    return response.json();
  },

  async buscarInstituicaoPorId(id: string): Promise<Instituicao> {
    const response = await fetch(`${API_URL}/instituicoes/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao buscar instituição');
    }

    return response.json();
  },

  async getInstituicaoData(userId: string): Promise<Instituicao> {
    const response = await fetch(`${API_URL}/instituicoes/by-user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao buscar dados da instituição');
    }

    return response.json();
  },

  async updateInstituicaoData(userId: string, data: InstituicaoUpdateRequest): Promise<Instituicao> {
    const response = await fetch(`${API_URL}/instituicoes/by-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao atualizar dados da instituição');
    }

    return response.json();
  },

  // Métodos de Cadastro Tradicional
  async cadastrarEmpresa(data: CadastroEmpresaRequest): Promise<CadastroResponse> {
    const response = await fetch(`${API_URL}/cadastro/empresa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao cadastrar empresa');
    }

    return response.json();
  },

  async verificarEmail(email: string): Promise<{ disponivel: boolean; message: string }> {
    const response = await fetch(`${API_URL}/cadastro/verificar-email?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error('Erro ao verificar e-mail');
    }

    return response.json();
  },

  async verificarCnpj(cnpj: string): Promise<{ disponivel: boolean; message: string }> {
    const response = await fetch(`${API_URL}/cadastro/verificar-cnpj?cnpj=${encodeURIComponent(cnpj)}`);

    if (!response.ok) {
      throw new Error('Erro ao verificar CNPJ');
    }

    return response.json();
  },

  async verificarCpf(cpf: string): Promise<{ disponivel: boolean; message: string }> {
    const response = await fetch(`${API_URL}/cadastro/verificar-cpf?cpf=${encodeURIComponent(cpf)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao verificar CPF');
    }

    return response.json();
  },

  // Login tradicional
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/cadastro/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    return response.json();
  },

  // Registrar usuário cliente
  async registrarUsuario(data: { nome: string; email: string; senha: string; tipoUsuario: string }): Promise<any> {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        cpfCnpj: null, // Usuários clientes não têm CPF/CNPJ obrigatório no cadastro
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao registrar usuário');
    }

    return response.json();
  },

  // Validar token
  async validateToken(token: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/cadastro/validate-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Token inválido');
    }

    return response.json();
  },

  // Buscar dados da empresa por ID do usuário (para perfil)
  async getEmpresaData(userId: string): Promise<Empresa> {
    const response = await fetch(`${API_URL}/empresas/by-user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar dados da empresa');
    }

    return response.json();
  },

  // Atualizar dados da empresa por ID do usuário (para perfil)
  async updateEmpresaData(userId: string, data: any): Promise<Empresa> {
    const response = await fetch(`${API_URL}/empresas/by-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar dados da empresa');
    }

    return response.json();
  },

  async listarFuncionarios(empresaId: string): Promise<Usuario[]> {
    const response = await fetch(`${API_URL}/empresas/${empresaId}/funcionarios`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao listar funcionários');
    }

    return response.json();
  },

  async criarFuncionario(empresaId: string, data: FuncionarioCreateRequest): Promise<Usuario> {
    const response = await fetch(`${API_URL}/empresas/${empresaId}/funcionarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar funcionário');
    }

    return response.json();
  },

  async atualizarFuncionario(empresaId: string, funcionarioId: string, data: FuncionarioUpdateRequest): Promise<Usuario> {
    const response = await fetch(`${API_URL}/empresas/${empresaId}/funcionarios/${funcionarioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar funcionário');
    }

    return response.json();
  },

  async removerFuncionario(empresaId: string, funcionarioId: string): Promise<void> {
    const response = await fetch(`${API_URL}/empresas/${empresaId}/funcionarios/${funcionarioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao remover funcionário');
    }
  },
};
