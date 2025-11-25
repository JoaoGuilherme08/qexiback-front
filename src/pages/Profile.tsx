import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Building2, Users, Heart } from "lucide-react";
import { apiService, Usuario, Empresa, Instituicao } from "@/services/api";
import { maskCPF, maskCNPJ, sanitizeDocument, detectDocumentType, isValidCpfRegex, validateCNPJ, isValidCnpjRegex } from "@/utils/validators";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  // Estado inicial dos dados do usuário
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    cpfCnpj: "",
    joinDate: "",
    avatar: ""
  });

  // Estado inicial dos dados da empresa
  const [companyData, setCompanyData] = useState({
    id: "",
    userId: "",
    nomeFantasia: "",
    cnpjEmpresa: "",
    email: "",
    telefone: "",
    enderecoEmpresa: "",
    cidadeEmpresa: "",
    estadoEmpresa: "",
    descricaoEmpresa: ""
  });

  const [institutionData, setInstitutionData] = useState({
    id: "",
    userId: "",
    nomeInstituicao: "",
    cnpjInstituicao: "",
    email: "",
    telefone: "",
    enderecoInstituicao: "",
    cidadeInstituicao: "",
    estadoInstituicao: "",
    descricaoInstituicao: "",
    chavePix: ""
  });

  // Estado de edição
  const [editingUser, setEditingUser] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(false);
  const [editUserData, setEditUserData] = useState({
    ...userData
  });
  const [editCompanyData, setEditCompanyData] = useState({
    ...companyData
  });
  const [editInstitutionData, setEditInstitutionData] = useState({
    ...institutionData
  });
  const [cpfCnpjError, setCpfCnpjError] = useState<string | null>(null);
  const [empresaIdAssociada, setEmpresaIdAssociada] = useState<string | null>(null);
  const [hasEmpresaVinculada, setHasEmpresaVinculada] = useState(false);
  const [instituicaoIdAssociada, setInstituicaoIdAssociada] = useState<string | null>(null);
  const [hasInstituicaoVinculada, setHasInstituicaoVinculada] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [isLoadingFuncionarios, setIsLoadingFuncionarios] = useState(false);
  const [isCreatingFuncionario, setIsCreatingFuncionario] = useState(false);
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cpfCnpj: ""
  });

  const formatDocumentForDisplay = (value?: string | null) => {
    if (!value) return "";
    const clean = sanitizeDocument(value);
    if (!clean) return "";
    if (clean.length <= 11) {
      return maskCPF(clean);
    }
    return maskCNPJ(clean.slice(0, 14));
  };

  const sanitizeCpfCnpj = (value?: string | null): string | null => {
    if (!value) return null;
    const clean = sanitizeDocument(value);
    return clean.length ? clean : null;
  };

  const validateCpfCnpj = (value: string): boolean => {
    if (!value) {
      setCpfCnpjError(null);
      return true;
    }
    const clean = sanitizeDocument(value);
    if (!clean) {
      setCpfCnpjError(null);
      return true;
    }
    const tipo = detectDocumentType(clean);
    if (tipo === "CPF") {
      if (!isValidCpfRegex(clean)) {
        setCpfCnpjError("CPF inválido");
        return false;
      }
      setCpfCnpjError(null);
      return true;
    }
    if (tipo === "CNPJ") {
      if (!isValidCnpjRegex(clean) || !validateCNPJ(clean)) {
        setCpfCnpjError("CNPJ inválido");
        return false;
      }
      setCpfCnpjError(null);
      return true;
    }
    setCpfCnpjError("Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos");
    return false;
  };

  const handleCpfCnpjChange = (rawValue: string) => {
    const clean = sanitizeDocument(rawValue);
    let formatted = rawValue;
    if (!clean) {
      formatted = "";
    } else if (clean.length <= 11) {
      formatted = maskCPF(clean);
    } else {
      formatted = maskCNPJ(clean.slice(0, 14));
    }
    setEditUserData(prev => ({
      ...prev,
      cpfCnpj: formatted
    }));
    validateCpfCnpj(formatted);
  };

  const shouldMostrarEmpresa = (tipo: string | null) =>
    tipo === "EMPRESA" || tipo === "ADMINISTRADOR_EMPRESA" || tipo === "FUNCIONARIO";

  const mapEmpresaToState = (empresa?: Partial<Empresa>, usuarioRef?: typeof userData) => ({
    id: empresa?.id || "",
    userId: empresa?.userId || usuarioRef?.id || "",
    nomeFantasia: empresa?.nomeFantasia || "",
    cnpjEmpresa: empresa?.cnpjEmpresa || "",
    email: empresa?.email || usuarioRef?.email || "",
    telefone: empresa?.telefone || usuarioRef?.phone || "",
    enderecoEmpresa: empresa?.enderecoEmpresa || usuarioRef?.address || "",
    cidadeEmpresa: empresa?.cidadeEmpresa || "",
    estadoEmpresa: empresa?.estadoEmpresa || "",
    descricaoEmpresa: empresa?.descricaoEmpresa || ""
  });

  const mapInstituicaoToState = (instituicao?: Partial<Instituicao>, usuarioRef?: typeof userData) => ({
    id: instituicao?.id || "",
    userId: instituicao?.userId || usuarioRef?.id || "",
    nomeInstituicao: instituicao?.nomeInstituicao || "",
    cnpjInstituicao: instituicao?.cnpjInstituicao || "",
    email: instituicao?.email || usuarioRef?.email || "",
    telefone: instituicao?.telefone || usuarioRef?.phone || "",
    enderecoInstituicao: instituicao?.enderecoInstituicao || usuarioRef?.address || "",
    cidadeInstituicao: instituicao?.cidadeInstituicao || "",
    estadoInstituicao: instituicao?.estadoInstituicao || "",
    descricaoInstituicao: instituicao?.descricaoInstituicao || "",
    chavePix: instituicao?.chavePix || ""
  });

  const carregarFuncionarios = async (empresaId: string) => {
    setIsLoadingFuncionarios(true);
    try {
      const lista = await apiService.listarFuncionarios(empresaId);
      setFuncionarios(lista.filter(func => func.tipoUsuario === "FUNCIONARIO"));
    } catch (error: any) {
      console.error("Erro ao listar funcionários:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os funcionários.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFuncionarios(false);
    }
  };

  const handleFuncionarioFieldChange = (field: keyof typeof novoFuncionario, value: string) => {
    if (field === "cpfCnpj") {
      const clean = sanitizeDocument(value);
      const formatted = clean
        ? clean.length <= 11
          ? maskCPF(clean)
          : maskCNPJ(clean.slice(0, 14))
        : "";
      setNovoFuncionario(prev => ({ ...prev, cpfCnpj: formatted }));
      return;
    }
    setNovoFuncionario(prev => ({ ...prev, [field]: value }));
  };

  const carregarDadosEmpresa = async (
    empresaIdToken: string | null,
    ownerUserId: string,
    usuarioBase: typeof userData,
    tipo: string | null
  ) => {
    try {
      let empresa: Empresa | null = null;
      if (empresaIdToken) {
        empresa = await apiService.buscarEmpresaPorId(empresaIdToken);
      } else if (ownerUserId) {
        empresa = await apiService.getEmpresaData(ownerUserId);
      }

      if (!empresa) {
        return;
      }

      const mapped = mapEmpresaToState(empresa, usuarioBase);
      setCompanyData(mapped);
      setEditCompanyData(mapped);
      setEmpresaIdAssociada(empresa.id || empresaIdToken || mapped.id || null);
      setHasEmpresaVinculada(true);

      if (tipo === "ADMINISTRADOR_EMPRESA" && (empresa.id || empresaIdToken)) {
        await carregarFuncionarios(empresa.id || empresaIdToken!);
      } else if (tipo !== "ADMINISTRADOR_EMPRESA") {
        setFuncionarios([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados da empresa:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar as informações da empresa.",
        variant: "destructive"
      });
    }
  };

  const carregarDadosInstituicao = async (
    instituicaoIdToken: string | null,
    ownerUserId: string,
    usuarioBase: typeof userData
  ) => {
    try {
      let instituicao: Instituicao | null = null;
      if (instituicaoIdToken) {
        instituicao = await apiService.buscarInstituicaoPorId(instituicaoIdToken);
      } else if (ownerUserId) {
        instituicao = await apiService.getInstituicaoData(ownerUserId);
      }

      if (!instituicao) {
        return;
      }

      const mapped = mapInstituicaoToState(instituicao, usuarioBase);
      setInstitutionData(mapped);
      setEditInstitutionData(mapped);
      setInstituicaoIdAssociada(instituicao.id || instituicaoIdToken || mapped.id || null);
      setHasInstituicaoVinculada(true);
    } catch (error: any) {
      console.error("Erro ao carregar dados da instituição:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar as informações da ONG.",
        variant: "destructive"
      });
    }
  };

  const handleCreateFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaIdAssociada) {
      toast({
        title: "Empresa não encontrada",
        description: "Associe uma empresa antes de criar funcionários.",
        variant: "destructive"
      });
      return;
    }

    if (!novoFuncionario.nome.trim() || !novoFuncionario.email.trim() || !novoFuncionario.senha.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, email e senha são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (novoFuncionario.senha.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    const documentoLimpo = sanitizeDocument(novoFuncionario.cpfCnpj);
    if (documentoLimpo) {
      const tipo = detectDocumentType(documentoLimpo);
      if (!tipo) {
        toast({
          title: "Documento inválido",
          description: "Informe um CPF ou CNPJ válido.",
          variant: "destructive"
        });
        return;
      }
      if (tipo === "CPF" && !isValidCpfRegex(documentoLimpo)) {
        toast({
          title: "CPF inválido",
          description: "Verifique o CPF informado.",
          variant: "destructive"
        });
        return;
      }
      if (tipo === "CNPJ" && (!isValidCnpjRegex(documentoLimpo) || !validateCNPJ(documentoLimpo))) {
        toast({
          title: "CNPJ inválido",
          description: "Verifique o CNPJ informado.",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setIsCreatingFuncionario(true);
      await apiService.criarFuncionario(empresaIdAssociada, {
        nome: novoFuncionario.nome.trim(),
        email: novoFuncionario.email.trim(),
        senha: novoFuncionario.senha,
        telefone: novoFuncionario.telefone || undefined,
        cpfCnpj: documentoLimpo || undefined,
      });

      toast({
        title: "Funcionário criado",
        description: "Novo usuário criado com sucesso."
      });

      setNovoFuncionario({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        cpfCnpj: ""
      });

      await carregarFuncionarios(empresaIdAssociada);
    } catch (error: any) {
      console.error("Erro ao criar funcionário:", error);
      toast({
        title: "Erro ao criar funcionário",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingFuncionario(false);
    }
  };

  // Carregar dados do usuário do backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        
        // Obter token do localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Validar token e obter dados do usuário
        const response = await apiService.validateToken(token);
        
        if (response.data) {
          const usuarioData = response.data;
          const formattedDate = new Date().toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
          });

          setTipoUsuario(usuarioData.tipoUsuario);

          const newUserData = {
            id: usuarioData.userId,
            name: usuarioData.nome,
            email: usuarioData.email,
            phone: usuarioData.telefone || "",
            address: usuarioData.endereco || "",
            cpfCnpj: formatDocumentForDisplay(usuarioData.cpfCnpj),
            joinDate: formattedDate,
            avatar: ""
          };

          setUserData(newUserData);
          setEditUserData(newUserData);

          const empresaIdToken = usuarioData.empresaId || null;
          setEmpresaIdAssociada(empresaIdToken);
          const usuarioTemPerfilCorporativo = Boolean(
            empresaIdToken ||
            usuarioData.nomeFantasia ||
            usuarioData.cnpjEmpresa ||
            usuarioData.tipoUsuario === "ADMINISTRADOR_EMPRESA" ||
            usuarioData.tipoUsuario === "FUNCIONARIO"
          );
          setHasEmpresaVinculada(usuarioTemPerfilCorporativo);

          if (shouldMostrarEmpresa(usuarioData.tipoUsuario)) {
            await carregarDadosEmpresa(empresaIdToken, usuarioData.userId, newUserData, usuarioData.tipoUsuario);
          } else {
            const emptyCompany = mapEmpresaToState(undefined, newUserData);
            setCompanyData(emptyCompany);
            setEditCompanyData(emptyCompany);
            setFuncionarios([]);
            if (!usuarioTemPerfilCorporativo) {
              setHasEmpresaVinculada(false);
            }
          }

          const instituicaoIdToken = usuarioData.instituicaoId || null;
          setInstituicaoIdAssociada(instituicaoIdToken);
          const usuarioTemOng = Boolean(
            instituicaoIdToken ||
            usuarioData.nomeInstituicao ||
            usuarioData.cnpjInstituicao ||
            usuarioData.tipoUsuario === "INSTITUICAO"
          );
          setHasInstituicaoVinculada(usuarioTemOng);

          if (usuarioData.tipoUsuario === "INSTITUICAO" || instituicaoIdToken) {
            await carregarDadosInstituicao(instituicaoIdToken, usuarioData.userId, newUserData);
          } else {
            const emptyInstitution = mapInstituicaoToState(undefined, newUserData);
            setInstitutionData(emptyInstitution);
            setEditInstitutionData(emptyInstitution);
            if (!usuarioTemOng) {
              setHasInstituicaoVinculada(false);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados.",
          variant: "destructive"
        });
        navigate("/login");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [navigate, toast]);

  // Handlers para Usuário
  const handleEditUser = () => {
    setEditingUser(true);
    setEditUserData({ ...userData });
    setCpfCnpjError(null);
  };

  const handleCancelUser = () => {
    setEditingUser(false);
    setEditUserData({ ...userData });
    setCpfCnpjError(null);
  };

  const handleSaveUser = async () => {
    try {
      const isDocumentoValido = validateCpfCnpj(editUserData.cpfCnpj || "");
      if (!isDocumentoValido) {
        toast({
          title: "Documento inválido",
          description: cpfCnpjError || "Verifique o CPF/CNPJ informado.",
          variant: "destructive"
        });
        return;
      }

      const documentoSanitizado = sanitizeCpfCnpj(editUserData.cpfCnpj);

      const updatedUser = await apiService.atualizarUsuario(userData.id, {
        nome: editUserData.name,
        email: editUserData.email,
        telefone: editUserData.phone,
        cpfCnpj: documentoSanitizado || undefined,
        endereco: editUserData.address,
        empresaId: empresaIdAssociada || undefined,
        instituicaoId: instituicaoIdAssociada || undefined,
      });

      const newUserData = {
        ...userData,
        name: updatedUser.nome,
        email: updatedUser.email,
        phone: updatedUser.telefone || "",
        address: updatedUser.endereco || "",
        cpfCnpj: formatDocumentForDisplay(updatedUser.cpfCnpj),
      };
      
      setUserData(newUserData);
      setEditUserData(newUserData);
      setEditingUser(false);
      setCpfCnpjError(null);
      if (updatedUser.empresaId) {
        setEmpresaIdAssociada(updatedUser.empresaId);
      }
      if (updatedUser.instituicaoId) {
        setInstituicaoIdAssociada(updatedUser.instituicaoId);
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar suas informações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Handlers para Empresa
  const handleEditCompany = () => {
    if (!canEditCompany) return;
    setEditingCompany(true);
    setEditCompanyData({ ...companyData });
  };

  const handleCancelCompany = () => {
    setEditingCompany(false);
    setEditCompanyData({ ...companyData });
  };

  const handleSaveCompany = async () => {
    try {
      const ownerId = companyData.userId || userData.id;
      const updatedCompany = await apiService.updateEmpresaData(ownerId, {
        nomeFantasia: editCompanyData.nomeFantasia,
        email: editCompanyData.email,
        telefone: editCompanyData.telefone,
        enderecoEmpresa: editCompanyData.enderecoEmpresa,
        cidadeEmpresa: editCompanyData.cidadeEmpresa,
        estadoEmpresa: editCompanyData.estadoEmpresa,
        descricaoEmpresa: editCompanyData.descricaoEmpresa,
      });

      const mappedCompany = mapEmpresaToState(updatedCompany, userData);
      setCompanyData(mappedCompany);
      setEditCompanyData(mappedCompany);
      setEditingCompany(false);
      if (mappedCompany.id) {
        setEmpresaIdAssociada(mappedCompany.id);
        setHasEmpresaVinculada(true);
      }
      if (tipoUsuario === "ADMINISTRADOR_EMPRESA" && mappedCompany.id) {
        await carregarFuncionarios(mappedCompany.id);
      }

      toast({
        title: "Perfil atualizado",
        description: "Os dados da empresa foram salvos com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar os dados da empresa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditInstitution = () => {
    setEditingInstitution(true);
    setEditInstitutionData({ ...institutionData });
  };

  const handleCancelInstitution = () => {
    setEditingInstitution(false);
    setEditInstitutionData({ ...institutionData });
  };

  const handleSaveInstitution = async () => {
    try {
      const ownerId = institutionData.userId || userData.id;
      const updatedInstitution = await apiService.updateInstituicaoData(ownerId, {
        nomeInstituicao: editInstitutionData.nomeInstituicao,
        email: editInstitutionData.email,
        telefone: editInstitutionData.telefone,
        enderecoInstituicao: editInstitutionData.enderecoInstituicao,
        cidadeInstituicao: editInstitutionData.cidadeInstituicao,
        estadoInstituicao: editInstitutionData.estadoInstituicao,
        descricaoInstituicao: editInstitutionData.descricaoInstituicao,
        chavePix: editInstitutionData.chavePix,
        statusInstituicao: true
      });

      const mappedInstitution = mapInstituicaoToState(updatedInstitution, userData);
      setInstitutionData(mappedInstitution);
      setEditInstitutionData(mappedInstitution);
      setEditingInstitution(false);
      if (mappedInstitution.id) {
        setInstituicaoIdAssociada(mappedInstitution.id);
        setHasInstituicaoVinculada(true);
      }

      toast({
        title: "Perfil atualizado",
        description: "Os dados da ONG foram salvos com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao atualizar instituição:", error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível salvar os dados da ONG. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const hasCompany = hasEmpresaVinculada || Boolean(companyData.id || empresaIdAssociada);
  const hasInstitution = hasInstituicaoVinculada || Boolean(institutionData.id || instituicaoIdAssociada);
  const showCompanySection = hasCompany && shouldMostrarEmpresa(tipoUsuario);
  const showInstitutionSection = hasInstitution && tipoUsuario === "INSTITUICAO";
  const canEditCompany = hasCompany && (tipoUsuario === "EMPRESA" || tipoUsuario === "ADMINISTRADOR_EMPRESA");
  const canEditInstitution = hasInstitution && tipoUsuario === "INSTITUICAO";
  const showEmployeeManagement = hasCompany && tipoUsuario === "ADMINISTRADOR_EMPRESA";
  const canCreateOrganization = !hasCompany && !hasInstitution && tipoUsuario === "CLIENTE";

  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header do Perfil */}
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{userData.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Membro desde {userData.joinDate}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                </div>
                {!editingUser ? <Button onClick={handleEditUser} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button> : <div className="flex gap-2">
                    <Button onClick={handleSaveUser} variant="default" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancelUser} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                {editingUser ? <Input id="name" value={editUserData.name} onChange={e => setEditUserData({
                  ...editUserData,
                  name: e.target.value
                })} /> : <p className="text-muted-foreground">{userData.name}</p>}
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                {editingUser ? <Input id="email" type="email" value={editUserData.email} onChange={e => setEditUserData({
                  ...editUserData,
                  email: e.target.value
                })} /> : <p className="text-muted-foreground">{userData.email}</p>}
              </div>

              <Separator />

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                {editingUser ? (
                  <InputMask
                    mask="(99) 99999-9999"
                    value={editUserData.phone}
                    onChange={e => setEditUserData({
                      ...editUserData,
                      phone: e.target.value
                    })}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="phone"
                        placeholder="(00) 00000-0000"
                      />
                    )}
                  </InputMask>
                ) : (
                  <p className="text-muted-foreground">{userData.phone || "Não informado"}</p>
                )}
              </div>

              <Separator />

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localização
                </Label>
                {editingUser ? <Input id="address" value={editUserData.address} onChange={e => setEditUserData({
                  ...editUserData,
                  address: e.target.value
                })} /> : <p className="text-muted-foreground">{userData.address}</p>}
              </div>

              <Separator />

              {/* CPF/CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  CPF/CNPJ
                </Label>
                {editingUser ? (
                  <div className="space-y-2">
                    <Input
                      id="cpfCnpj"
                      value={editUserData.cpfCnpj}
                      onChange={e => handleCpfCnpjChange(e.target.value)}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    />
                    {cpfCnpjError && <p className="text-sm text-red-500">{cpfCnpjError}</p>}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{formatDocumentForDisplay(userData.cpfCnpj) || "Não informado"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {canCreateOrganization && (
            <Card>
              <CardHeader>
                <CardTitle>Cadastre sua organização</CardTitle>
                <CardDescription>
                  Escolha se deseja operar como empresa ou ONG para liberar os painéis corporativos do Qexiback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Depois do cadastro você assumirá o papel de responsável pela organização e poderá convidar outras pessoas.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 md:flex-row">
                <Button className="w-full" onClick={() => navigate("/company/create")}>
                  Cadastrar empresa
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/institution/create")}>
                  Cadastrar ONG
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Informações da Empresa */}
          {showCompanySection && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informações da Empresa</CardTitle>
                    <CardDescription>Dados provenientes do cadastro corporativo</CardDescription>
                  </div>
                  {canEditCompany && (
                    !editingCompany ? (
                      <Button onClick={handleEditCompany} variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveCompany} variant="default" size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                        <Button onClick={handleCancelCompany} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {companyData.id ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nomeFantasia" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Nome Fantasia
                      </Label>
                      {editingCompany && canEditCompany ? (
                        <Input
                          id="nomeFantasia"
                          value={editCompanyData.nomeFantasia}
                          onChange={e => setEditCompanyData({
                            ...editCompanyData,
                            nomeFantasia: e.target.value
                          })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{companyData.nomeFantasia || "Não informado"}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-mail
                        </Label>
                        {editingCompany && canEditCompany ? (
                          <Input
                            id="companyEmail"
                            type="email"
                            value={editCompanyData.email}
                            onChange={e => setEditCompanyData({
                              ...editCompanyData,
                              email: e.target.value
                            })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{companyData.email || "Não informado"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyPhone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </Label>
                        {editingCompany && canEditCompany ? (
                          <InputMask
                            mask="(99) 99999-9999"
                            value={editCompanyData.telefone}
                            onChange={e => setEditCompanyData({
                              ...editCompanyData,
                              telefone: e.target.value
                            })}
                          >
                            {(inputProps: any) => (
                              <Input
                                {...inputProps}
                                id="companyPhone"
                                placeholder="(00) 00000-0000"
                              />
                            )}
                          </InputMask>
                        ) : (
                          <p className="text-muted-foreground">{companyData.telefone || "Não informado"}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="companyAddress" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </Label>
                      {editingCompany && canEditCompany ? (
                        <Input
                          id="companyAddress"
                          value={editCompanyData.enderecoEmpresa}
                          onChange={e => setEditCompanyData({
                            ...editCompanyData,
                            enderecoEmpresa: e.target.value
                          })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{companyData.enderecoEmpresa || "Não informado"}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cidadeEmpresa">Cidade</Label>
                        {editingCompany && canEditCompany ? (
                          <Input
                            id="cidadeEmpresa"
                            value={editCompanyData.cidadeEmpresa}
                            onChange={e => setEditCompanyData({
                              ...editCompanyData,
                              cidadeEmpresa: e.target.value
                            })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{companyData.cidadeEmpresa || "Não informado"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estadoEmpresa">Estado</Label>
                        {editingCompany && canEditCompany ? (
                          <Input
                            id="estadoEmpresa"
                            value={editCompanyData.estadoEmpresa}
                            maxLength={2}
                            onChange={e => setEditCompanyData({
                              ...editCompanyData,
                              estadoEmpresa: e.target.value.toUpperCase()
                            })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{companyData.estadoEmpresa || "Não informado"}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="descricaoEmpresa">Descrição</Label>
                      {editingCompany && canEditCompany ? (
                        <Textarea
                          id="descricaoEmpresa"
                          value={editCompanyData.descricaoEmpresa}
                          onChange={e => setEditCompanyData({
                            ...editCompanyData,
                            descricaoEmpresa: e.target.value
                          })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{companyData.descricaoEmpresa || "Não informado"}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        CNPJ
                      </Label>
                      <p className="text-muted-foreground">
                        {formatDocumentForDisplay(companyData.cnpjEmpresa) || "Não informado"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Nenhuma empresa vinculada ao seu usuário.</p>
                )}
              </CardContent>
            </Card>
          )}

          {showInstitutionSection && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informações da ONG</CardTitle>
                    <CardDescription>Dados provenientes do cadastro social</CardDescription>
                  </div>
                  {canEditInstitution && (
                    !editingInstitution ? (
                      <Button onClick={handleEditInstitution} variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveInstitution} variant="default" size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                        <Button onClick={handleCancelInstitution} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {institutionData.id ? (
                  <>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Nome da instituição
                      </Label>
                      {editingInstitution ? (
                        <Input
                          value={editInstitutionData.nomeInstituicao}
                          onChange={e => setEditInstitutionData({
                            ...editInstitutionData,
                            nomeInstituicao: e.target.value
                          })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{institutionData.nomeInstituicao || "Não informado"}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        {editingInstitution ? (
                          <Input
                            type="email"
                            value={editInstitutionData.email}
                            onChange={e => setEditInstitutionData({
                              ...editInstitutionData,
                              email: e.target.value
                            })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{institutionData.email || "Não informado"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        {editingInstitution ? (
                          <InputMask
                            mask="(99) 99999-9999"
                            value={editInstitutionData.telefone}
                            onChange={e => setEditInstitutionData({
                              ...editInstitutionData,
                              telefone: e.target.value
                            })}
                          >
                            {(inputProps: any) => (
                              <Input
                                {...inputProps}
                                placeholder="(00) 00000-0000"
                              />
                            )}
                          </InputMask>
                        ) : (
                          <p className="text-muted-foreground">{institutionData.telefone || "Não informado"}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      {editingInstitution ? (
                        <Input
                          value={editInstitutionData.enderecoInstituicao}
                          onChange={e => setEditInstitutionData({
                            ...editInstitutionData,
                            enderecoInstituicao: e.target.value
                          })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{institutionData.enderecoInstituicao || "Não informado"}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        {editingInstitution ? (
                          <Input
                            value={editInstitutionData.cidadeInstituicao}
                            onChange={e => setEditInstitutionData({
                              ...editInstitutionData,
                              cidadeInstituicao: e.target.value
                            })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{institutionData.cidadeInstituicao || "Não informado"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        {editingInstitution ? (
                          <Input
                            value={editInstitutionData.estadoInstituicao}
                            maxLength={2}
                            onChange={e => setEditInstitutionData({
                              ...editInstitutionData,
                              estadoInstituicao: e.target.value.toUpperCase()
                            })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{institutionData.estadoInstituicao || "Não informado"}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      {editingInstitution ? (
                        <Textarea
                          value={editInstitutionData.descricaoInstituicao}
                          onChange={e => setEditInstitutionData({
                            ...editInstitutionData,
                            descricaoInstituicao: e.target.value
                          })}
                        />
                      ) : (
                        <p className="text-muted-foreground">{institutionData.descricaoInstituicao || "Não informado"}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CNPJ</Label>
                        <p className="text-muted-foreground">
                          {formatDocumentForDisplay(institutionData.cnpjInstituicao) || "Não informado"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Chave PIX</Label>
                        {editingInstitution ? (
                          <Input
                            value={editInstitutionData.chavePix}
                            onChange={e => setEditInstitutionData({
                              ...editInstitutionData,
                              chavePix: e.target.value
                            })}
                            placeholder="Chave PIX da instituição"
                          />
                        ) : (
                          <p className="text-muted-foreground">{institutionData.chavePix || "Não informado"}</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Nenhuma ONG vinculada ao seu usuário.</p>
                )}
              </CardContent>
            </Card>
          )}


          {showEmployeeManagement && empresaIdAssociada && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Usuários da Empresa</CardTitle>
                    <CardDescription>Cadastre e visualize colaboradores com acesso ao painel corporativo.</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/company/users")}>
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Funcionários cadastrados</h4>
                  {isLoadingFuncionarios ? (
                    <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
                  ) : funcionarios.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum funcionário cadastrado até o momento.</p>
                  ) : (
                    <div className="space-y-3">
                      {funcionarios.slice(0, 3).map(funcionario => (
                        <div key={funcionario.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{funcionario.nome}</p>
                            <span className="text-xs text-muted-foreground">{funcionario.email}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            CPF/CNPJ: {formatDocumentForDisplay(funcionario.cpfCnpj) || "Não informado"}
                          </p>
                        </div>
                      ))}
                      {funcionarios.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{funcionarios.length - 3} funcionário(s) adicional(is)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-md bg-muted/50 p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Gerenciamento completo</h4>
                  <p className="text-sm text-muted-foreground">
                    Para editar permissões, convidar novos usuários ou remover acessos utilize a tela dedicada.
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => navigate("/company/users")}>
                    Abrir gestão de usuários
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>;
};
export default Profile;