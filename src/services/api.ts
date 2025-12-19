export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
  statusAprovacao?: string; // PENDENTE, APROVADA, REJEITADA
  motivoRejeicao?: string;
  dtAprovacao?: string;
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

// ========== INTERFACES DE SAQUE ==========
export interface Saque {
  id: string;
  usuarioId: string;
  nomeUsuario: string;
  emailUsuario: string;
  valorSaque: number;
  chavePix: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'PAGO' | 'CANCELADO';
  dtSolicitacao: string;
  dtAprovacao?: string;
  dtRejeicao?: string;
  aprovadoPorId?: string;
  nomeAprovador?: string;
  motivoRejeicao?: string;
  observacoes?: string;
}

export interface SaqueRequest {
  valorSaque: number;
  chavePix: string;
}

export interface AprovarSaqueRequest {
  saqueId: string;
  observacoes?: string;
}

export interface RejeitarSaqueRequest {
  saqueId: string;
  motivoRejeicao: string;
  observacoes?: string;
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

  async buscarEmpresasPorNome(nome: string): Promise<Empresa[]> {
    const response = await fetch(`${API_URL}/empresas/buscar?nome=${encodeURIComponent(nome)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao buscar empresas');
    }

    return response.json();
  },

  async listarTodasEmpresasAtivas(): Promise<Empresa[]> {
    const response = await fetch(`${API_URL}/empresas`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar empresas');
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

  async listarTodasInstituicoesAtivas(): Promise<Instituicao[]> {
    const response = await fetch(`${API_URL}/instituicoes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar instituições');
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

  // Métodos Administrativos de Instituição
  async listarTodasInstituicoesAdmin(): Promise<Instituicao[]> {
    const response = await fetch(`${API_URL}/instituicoes/admin/todas`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar instituições');
    }

    return response.json();
  },

  async listarInstituicoesPorStatus(status: string): Promise<Instituicao[]> {
    const response = await fetch(`${API_URL}/instituicoes/admin/status/${status}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar instituições por status');
    }

    return response.json();
  },

  async contarInstituicoesPendentes(): Promise<number> {
    const response = await fetch(`${API_URL}/instituicoes/admin/pendentes/count`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao contar instituições pendentes');
    }

    return response.json();
  },

  async aprovarInstituicao(instituicaoId: string, adminId: string): Promise<Instituicao> {
    const response = await fetch(`${API_URL}/instituicoes/admin/${instituicaoId}/aprovar?adminId=${adminId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao aprovar instituição');
    }

    return response.json();
  },

  async rejeitarInstituicao(instituicaoId: string, adminId: string, motivo: string): Promise<Instituicao> {
    const response = await fetch(`${API_URL}/instituicoes/admin/${instituicaoId}/rejeitar?adminId=${adminId}&motivo=${encodeURIComponent(motivo)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao rejeitar instituição');
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
      // Se for 403, pode ser que a empresa não esteja aprovada ou usuário não tenha permissão
      if (response.status === 403) {
        throw new Error('Acesso negado. Verifique se a empresa está aprovada e você tem permissão.');
      }
      
      // Tentar ler JSON de erro, mas tratar caso a resposta esteja vazia
      let errorData;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch {
        errorData = {};
      }
      
      throw new Error(errorData.message || `Erro ao listar funcionários (${response.status})`);
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

// Interfaces de Produto
export interface Produto {
  id: string;
  empresaId: string;
  nomeProduto: string;
  descricaoProduto?: string;
  precoProduto: number;
  prcntCashback?: number;
  fotoUrl?: string;
  categoria?: string;
  status: boolean;
  dtCadastro: string;
  dtInicio?: string;
  dtFim?: string;
  quantidadeEstoque?: number;
  nomeFantasiaEmpresa?: string;
  cnpjEmpresa?: string;
}

export interface ProdutoRequest {
  empresaId: string;
  nomeProduto: string;
  descricaoProduto?: string;
  precoProduto: number;
  prcntCashback?: number;
  fotoUrl?: string;
  categoria?: string;
  status?: boolean;
  dtInicio?: string;
  dtFim?: string;
  quantidadeEstoque?: number;
}

export const produtoService = {
  async criarProduto(data: ProdutoRequest, imageFile?: File): Promise<Produto> {
    // Se houver imagem, usar multipart/form-data
    if (imageFile) {
      const formData = new FormData();
      formData.append('produto', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      formData.append('foto', imageFile);

      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar produto');
      }

      return response.json();
    } else {
      // Se não houver imagem, usar JSON (endpoint alternativo)
      const response = await fetch(`${API_URL}/produtos/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar produto');
      }

      return response.json();
    }
  },

  async listarProdutos(): Promise<Produto[]> {
    const response = await fetch(`${API_URL}/produtos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar produtos');
    }

    return response.json();
  },

  async listarProdutosPorEmpresa(empresaId: string): Promise<Produto[]> {
    const response = await fetch(`${API_URL}/produtos/empresa/${empresaId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar produtos da empresa');
    }

    return response.json();
  },

  async listarProdutosAtivosPorEmpresa(empresaId: string): Promise<Produto[]> {
    const response = await fetch(`${API_URL}/produtos/empresa/${empresaId}/ativos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar produtos ativos');
    }

    return response.json();
  },

  async buscarProdutoPorId(id: string): Promise<Produto> {
    const response = await fetch(`${API_URL}/produtos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao buscar produto');
    }

    return response.json();
  },

  async atualizarProduto(id: string, data: ProdutoRequest, imageFile?: File): Promise<Produto> {
    // Se houver imagem, usar multipart/form-data
    if (imageFile) {
      const formData = new FormData();
      formData.append('produto', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      formData.append('foto', imageFile);

      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar produto');
      }

      return response.json();
    } else {
      // Se não houver imagem, usar JSON (endpoint alternativo)
      const response = await fetch(`${API_URL}/produtos/${id}/json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar produto');
      }

      return response.json();
    }
  },

  async alterarStatusProduto(id: string, status: boolean): Promise<Produto> {
    const response = await fetch(`${API_URL}/produtos/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(status),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao alterar status do produto');
    }

    return response.json();
  },

  async deletarProduto(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/produtos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao deletar produto');
    }
  },

  async listarProdutosAtivos(): Promise<Produto[]> {
    const response = await fetch(`${API_URL}/produtos/ativos`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar produtos ativos');
    }

    return response.json();
  },

  async listarProdutosPorCategoria(categoria: string): Promise<Produto[]> {
    const response = await fetch(`${API_URL}/produtos/categoria/${encodeURIComponent(categoria)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar produtos por categoria');
    }

    return response.json();
  },

  async listarProdutosComMaiorCashback(limite?: number): Promise<Produto[]> {
    const url = limite 
      ? `${API_URL}/produtos/maior-cashback?limite=${limite}`
      : `${API_URL}/produtos/maior-cashback`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar produtos com maior cashback');
    }

    return response.json();
  },

  async listarCategorias(): Promise<string[]> {
    const response = await fetch(`${API_URL}/produtos/categorias`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar categorias');
    }

    return response.json();
  },
};

// Serviço de Upload
// Interfaces de Doação
export interface Doacao {
  id: string;
  usuarioId: string;
  instituicaoId: string;
  valorDoado: number;
  dtDoacao: string;
  nomeUsuario?: string;
  nomeInstituicao?: string;
}

export interface DoacaoRequest {
  instituicaoId: string;
  valorDoado: number;
}

export const doacaoService = {
  async listarDoacoesPorInstituicao(instituicaoId: string): Promise<Doacao[]> {
    const response = await fetch(`${API_URL}/doacoes/instituicao/${instituicaoId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar doações da instituição');
    }
    return response.json();
  },

  async listarDoacoesPorUsuario(usuarioId: string): Promise<Doacao[]> {
    const response = await fetch(`${API_URL}/doacoes/usuario/${usuarioId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar doações do usuário');
    }
    return response.json();
  },

  async realizarDoacao(usuarioId: string, data: DoacaoRequest): Promise<Doacao> {
    const response = await fetch(`${API_URL}/doacoes/usuario/${usuarioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao realizar doação');
    }
    return response.json();
  },
};

// Interfaces de Carteira
export interface Carteira {
  id: string;
  usuarioId: string;
  saldoDisponivel: number;
  saldoBloqueado: number;
  saldoTotal: number;
  totalDoado: number;
  podeSacar: boolean;
  percentualDoado: number;
  mensagemValidacao: string;
}

export interface SaqueRequest {
  valorSaque: number;
  chavePix: string;
}

export const carteiraService = {
  async consultarCarteira(usuarioId: string): Promise<Carteira> {
    const response = await fetch(`${API_URL}/carteira/usuario/${usuarioId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao consultar carteira');
    }
    return response.json();
  },

  async solicitarSaque(usuarioId: string, data: SaqueRequest): Promise<any> {
    const response = await fetch(`${API_URL}/carteira/usuario/${usuarioId}/saque`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.mensagem || 'Erro ao solicitar saque');
    }
    return response.json();
  },
};

// Interfaces de Transação
export interface Transacao {
  id: string;
  codigoRetirada: string;
  usuarioId: string;
  produtoId: string;
  empresaId: string;
  valorCompra: number;
  valorCashback: number;
  statusTransacao: 'PENDENTE' | 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'LIBERADO' | 'CANCELADO';
  pixCode?: string;
  pixQrcode?: string;
  pixExpiresAt?: string;
  dtCompra: string;
  dtLiberacao?: string;
  nomeProduto?: string;
  nomeFantasiaEmpresa?: string;
  nomeUsuario?: string;
}

export interface TransacaoRequest {
  produtoId: string;
  usuarioId: string;
}

export const transacaoService = {
  async criarTransacao(data: TransacaoRequest): Promise<Transacao> {
    const response = await fetch(`${API_URL}/transacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao criar transação');
    }
    return response.json();
  },

  async confirmarPagamento(transacaoId: string): Promise<Transacao> {
    const response = await fetch(`${API_URL}/transacoes/${transacaoId}/confirmar-pagamento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao confirmar pagamento');
    }
    return response.json();
  },

  async listarTransacoesPorUsuario(usuarioId: string): Promise<Transacao[]> {
    const response = await fetch(`${API_URL}/transacoes/usuario/${usuarioId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar transações');
    }
    return response.json();
  },
};

export interface UploadResponse {
  url: string;  // URL completa para exibição/preview (presigned URL válida por 7 dias)
  path: string;  // Path relativo para salvar no banco de dados
  message?: string;
}

export const uploadService = {
  async uploadProdutoImagem(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/produto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return {
      url: data.url,
      path: data.path,
      message: data.message,
    };
  },

  async uploadUsuarioImagem(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/usuario`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return {
      url: data.url,
      path: data.path,
      message: data.message,
    };
  },
};

// ========== SERVIÇO DE SAQUES ==========
export const saqueService = {
  /**
   * Solicitar um novo saque
   */
  async solicitarSaque(usuarioId: string, request: SaqueRequest): Promise<Saque> {
    const response = await fetch(`${API_URL}/saques/usuario/${usuarioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao solicitar saque');
    }

    return response.json();
  },

  /**
   * Listar saques do usuário
   */
  async listarSaquesPorUsuario(usuarioId: string): Promise<Saque[]> {
    const response = await fetch(`${API_URL}/saques/usuario/${usuarioId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar saques');
    }

    return response.json();
  },

  /**
   * Listar todos os saques (ADMIN)
   */
  async listarTodosSaques(): Promise<Saque[]> {
    const response = await fetch(`${API_URL}/saques/admin/todos`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar saques');
    }

    return response.json();
  },

  /**
   * Listar saques pendentes (ADMIN)
   */
  async listarSaquesPendentes(): Promise<Saque[]> {
    const response = await fetch(`${API_URL}/saques/admin/pendentes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao listar saques pendentes');
    }

    return response.json();
  },

  /**
   * Contar saques pendentes (ADMIN)
   */
  async contarSaquesPendentes(): Promise<number> {
    const response = await fetch(`${API_URL}/saques/admin/pendentes/count`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao contar saques pendentes');
    }

    const data = await response.json();
    return data.count;
  },

  /**
   * Aprovar saque (ADMIN)
   */
  async aprovarSaque(adminId: string, request: AprovarSaqueRequest): Promise<Saque> {
    const response = await fetch(`${API_URL}/saques/admin/${adminId}/aprovar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao aprovar saque');
    }

    return response.json();
  },

  /**
   * Rejeitar saque (ADMIN)
   */
  async rejeitarSaque(adminId: string, request: RejeitarSaqueRequest): Promise<Saque> {
    const response = await fetch(`${API_URL}/saques/admin/${adminId}/rejeitar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao rejeitar saque');
    }

    return response.json();
  },
};


