import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiService, Usuario } from "@/services/api";
import { maskCPF, maskCNPJ, sanitizeDocument, detectDocumentType, isValidCpfRegex, validateCNPJ, isValidCnpjRegex } from "@/utils/validators";
import { Mail, Phone, Users, Search, Pencil, Trash2, Save, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const formatDocumentForDisplay = (value?: string | null) => {
  if (!value) return "";
  const clean = sanitizeDocument(value);
  if (!clean) return "";
  if (clean.length <= 11) {
    return maskCPF(clean);
  }
  return maskCNPJ(clean.slice(0, 14));
};

const CompanyUsers = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpfCnpj: "",
    senha: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsuario, setEditUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpfCnpj: "",
    senha: ""
  });
  const [editDocumentError, setEditDocumentError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await apiService.validateToken(token);
        if (!response.data || response.data.tipoUsuario !== "ADMINISTRADOR_EMPRESA" || !response.data.empresaId) {
          toast.error("Você não tem permissão para acessar esta página.");
          navigate("/profile");
          return;
        }

        setEmpresaId(response.data.empresaId);
        await carregarFuncionarios(response.data.empresaId);
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        toast.error(error.message || "Não foi possível carregar os usuários.");
        navigate("/profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  const carregarFuncionarios = async (empresaId: string) => {
    try {
      const lista = await apiService.listarFuncionarios(empresaId);
      setFuncionarios(lista);
    } catch (error: any) {
      console.error("Erro ao listar funcionários:", error);
      toast.error(error.message || "Não foi possível carregar os colaboradores.");
    }
  };

  const handleNovoUsuarioChange = (field: keyof typeof novoUsuario, value: string) => {
    if (field === "cpfCnpj") {
      const clean = sanitizeDocument(value);
      const formatted = clean
        ? clean.length <= 11
          ? maskCPF(clean)
          : maskCNPJ(clean.slice(0, 14))
        : "";
      setNovoUsuario(prev => ({ ...prev, cpfCnpj: formatted }));
      setDocumentError(null);
      return;
    }
    setNovoUsuario(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUsuarioChange = (field: keyof typeof editUsuario, value: string) => {
    if (field === "cpfCnpj") {
      const clean = sanitizeDocument(value);
      const formatted = clean
        ? clean.length <= 11
          ? maskCPF(clean)
          : maskCNPJ(clean.slice(0, 14))
        : "";
      setEditUsuario(prev => ({ ...prev, cpfCnpj: formatted }));
      setEditDocumentError(null);
      return;
    }
    setEditUsuario(prev => ({ ...prev, [field]: value }));
  };

  const validarDocumento = () => {
    const clean = sanitizeDocument(novoUsuario.cpfCnpj);
    if (!clean) return true;
    const tipo = detectDocumentType(clean);
    if (!tipo) {
      setDocumentError("Documento inválido. Informe um CPF ou CNPJ.");
      return false;
    }
    if (tipo === "CPF" && !isValidCpfRegex(clean)) {
      setDocumentError("CPF inválido.");
      return false;
    }
    if (tipo === "CNPJ" && (!isValidCnpjRegex(clean) || !validateCNPJ(clean))) {
      setDocumentError("CNPJ inválido.");
      return false;
    }
    setDocumentError(null);
    return true;
  };

  const validarDocumentoEdicao = () => {
    const clean = sanitizeDocument(editUsuario.cpfCnpj);
    if (!clean) {
      setEditDocumentError(null);
      return true;
    }
    const tipo = detectDocumentType(clean);
    if (!tipo) {
      setEditDocumentError("Documento inválido.");
      return false;
    }
    if (tipo === "CPF" && !isValidCpfRegex(clean)) {
      setEditDocumentError("CPF inválido.");
      return false;
    }
    if (tipo === "CNPJ" && (!isValidCnpjRegex(clean) || !validateCNPJ(clean))) {
      setEditDocumentError("CNPJ inválido.");
      return false;
    }
    setEditDocumentError(null);
    return true;
  };

  const iniciarEdicao = (funcionario: Usuario) => {
    setEditingId(funcionario.id);
    setEditUsuario({
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone || "",
      cpfCnpj: formatDocumentForDisplay(funcionario.cpfCnpj),
      senha: ""
    });
    setEditDocumentError(null);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setEditUsuario({
      nome: "",
      email: "",
      telefone: "",
      cpfCnpj: "",
      senha: ""
    });
    setEditDocumentError(null);
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!empresaId) return;

    if (!novoUsuario.nome.trim() || !novoUsuario.email.trim() || !novoUsuario.senha.trim()) {
      toast.error("Nome, e-mail e senha são obrigatórios.");
      return;
    }

    if (novoUsuario.senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (!validarDocumento()) {
      return;
    }

    try {
      setIsSaving(true);
      await apiService.criarFuncionario(empresaId, {
        nome: novoUsuario.nome.trim(),
        email: novoUsuario.email.trim(),
        senha: novoUsuario.senha,
        telefone: novoUsuario.telefone || undefined,
        cpfCnpj: sanitizeDocument(novoUsuario.cpfCnpj) || undefined
      });

      toast.success("Colaborador criado com sucesso!");
      setNovoUsuario({
        nome: "",
        email: "",
        telefone: "",
        cpfCnpj: "",
        senha: ""
      });

      await carregarFuncionarios(empresaId);
    } catch (error: any) {
      console.error("Erro ao criar colaborador:", error);
      toast.error(error.message || "Não foi possível criar o usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFuncionario = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!empresaId || !editingId) return;

    if (!editUsuario.nome.trim() || !editUsuario.email.trim()) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }

    if (editUsuario.senha && editUsuario.senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (!validarDocumentoEdicao()) {
      return;
    }

    try {
      setIsUpdating(true);
      await apiService.atualizarFuncionario(empresaId, editingId, {
        nome: editUsuario.nome.trim(),
        email: editUsuario.email.trim(),
        telefone: editUsuario.telefone || undefined,
        cpfCnpj: sanitizeDocument(editUsuario.cpfCnpj) || undefined,
        senha: editUsuario.senha || undefined,
      });

      toast.success("Colaborador atualizado com sucesso!");
      cancelarEdicao();
      await carregarFuncionarios(empresaId);
    } catch (error: any) {
      console.error("Erro ao atualizar colaborador:", error);
      toast.error(error.message || "Não foi possível atualizar o usuário.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFuncionario = async (funcionarioId: string) => {
    if (!empresaId) return;

    try {
      setDeletingId(funcionarioId);
      await apiService.removerFuncionario(empresaId, funcionarioId);
      toast.success("Colaborador removido com sucesso.");
      if (editingId === funcionarioId) {
        cancelarEdicao();
      }
      await carregarFuncionarios(empresaId);
    } catch (error: any) {
      console.error("Erro ao remover colaborador:", error);
      toast.error(error.message || "Não foi possível remover o usuário.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFuncionarios = useMemo(() => {
    if (!search.trim()) return funcionarios;
    return funcionarios.filter(func =>
      func.nome.toLowerCase().includes(search.toLowerCase()) ||
      func.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [funcionarios, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dados da empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários da Empresa
            </CardTitle>
            <CardDescription>
              Convide e gerencie colaboradores que terão acesso ao painel corporativo do Qexiback.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Voltar ao perfil
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Colaboradores ativos</CardTitle>
              <CardDescription>Lista de usuários com acesso à sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Buscar por nome ou e-mail"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <Separator />

              {filteredFuncionarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum colaborador encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {filteredFuncionarios.map(funcionario => {
                    const isEditing = editingId === funcionario.id;
                    const canManage = funcionario.tipoUsuario === "FUNCIONARIO";
                    return (
                      <div key={funcionario.id} className="border rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{funcionario.nome}</p>
                            <p className="text-sm text-muted-foreground">{funcionario.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={funcionario.tipoUsuario === "ADMINISTRADOR_EMPRESA" ? "default" : "secondary"}>
                              {funcionario.tipoUsuario === "ADMINISTRADOR_EMPRESA" ? "Administrador" : "Funcionário"}
                            </Badge>
                            {canManage && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => (isEditing ? cancelarEdicao() : iniciarEdicao(funcionario))}
                                >
                                  {isEditing ? <X className="w-4 h-4 mr-1" /> : <Pencil className="w-4 h-4 mr-1" />}
                                  {isEditing ? "Cancelar" : "Editar"}
                                </Button>
                                <ConfirmDialog
                                  title="Remover colaborador"
                                  description={`Deseja remover ${funcionario.nome} do acesso corporativo?`}
                                  trigger={
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      disabled={deletingId === funcionario.id}
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Excluir
                                    </Button>
                                  }
                                  confirmLabel={deletingId === funcionario.id ? "Removendo..." : "Remover"}
                                  confirmVariant="destructive"
                                  isLoading={deletingId === funcionario.id}
                                  onConfirm={() => handleDeleteFuncionario(funcionario.id)}
                                >
                                  Essa ação é irreversível e o usuário precisará ser convidado novamente para recuperar o acesso.
                                </ConfirmDialog>
                              </>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <form className="space-y-3 pt-2" onSubmit={handleUpdateFuncionario}>
                            <div className="space-y-2">
                              <Label>Nome completo</Label>
                              <Input
                                value={editUsuario.nome}
                                onChange={e => handleEditUsuarioChange("nome", e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>E-mail</Label>
                              <Input
                                type="email"
                                value={editUsuario.email}
                                onChange={e => handleEditUsuarioChange("email", e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Telefone</Label>
                              <InputMask
                                mask="(99) 99999-9999"
                                value={editUsuario.telefone}
                                onChange={e => handleEditUsuarioChange("telefone", e.target.value)}
                              >
                                {(inputProps: any) => (
                                  <Input
                                    {...inputProps}
                                    placeholder="(00) 00000-0000"
                                  />
                                )}
                              </InputMask>
                            </div>

                            <div className="space-y-2">
                              <Label>CPF ou CNPJ (opcional)</Label>
                              <Input
                                value={editUsuario.cpfCnpj}
                                onChange={e => handleEditUsuarioChange("cpfCnpj", e.target.value)}
                                placeholder="000.000.000-00"
                              />
                              {editDocumentError && <p className="text-sm text-red-500">{editDocumentError}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label>Nova senha (opcional)</Label>
                              <Input
                                type="password"
                                value={editUsuario.senha}
                                onChange={e => handleEditUsuarioChange("senha", e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button type="submit" size="sm" disabled={isUpdating}>
                                <Save className="w-4 h-4 mr-1" />
                                {isUpdating ? "Salvando..." : "Salvar alterações"}
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={cancelarEdicao}>
                                <X className="w-4 h-4 mr-1" />
                                Descartar
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {funcionario.telefone || "Telefone não informado"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {formatDocumentForDisplay(funcionario.cpfCnpj) || "Sem documento"}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Adicionar novo usuário</CardTitle>
              <CardDescription>Informe os dados do colaborador que receberá acesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novoNome">Nome completo</Label>
                <Input
                  id="novoNome"
                  value={novoUsuario.nome}
                  onChange={e => handleNovoUsuarioChange("nome", e.target.value)}
                  placeholder="Nome do colaborador"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="novoEmail">E-mail</Label>
                <Input
                  id="novoEmail"
                  type="email"
                  value={novoUsuario.email}
                  onChange={e => handleNovoUsuarioChange("email", e.target.value)}
                  placeholder="email@empresa.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="novoTelefone">Telefone</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={novoUsuario.telefone}
                  onChange={e => handleNovoUsuarioChange("telefone", e.target.value)}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      id="novoTelefone"
                      placeholder="(00) 00000-0000"
                    />
                  )}
                </InputMask>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novoDocumento">CPF ou CNPJ (opcional)</Label>
                <Input
                  id="novoDocumento"
                  value={novoUsuario.cpfCnpj}
                  onChange={e => handleNovoUsuarioChange("cpfCnpj", e.target.value)}
                  placeholder="000.000.000-00"
                />
                {documentError && <p className="text-sm text-red-500">{documentError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="novoSenha">Senha provisória</Label>
                <Input
                  id="novoSenha"
                  type="password"
                  value={novoUsuario.senha}
                  onChange={e => handleNovoUsuarioChange("senha", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <Button className="w-full" disabled={isSaving} onClick={handleCreateUser}>
                {isSaving ? "Salvando..." : "Adicionar colaborador"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompanyUsers;

