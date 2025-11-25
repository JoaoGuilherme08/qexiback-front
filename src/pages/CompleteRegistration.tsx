import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Store, Heart } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { validateCNPJ, maskCNPJ, isValidCnpjRegex, isValidCpfRegex, detectDocumentType, maskCPF, sanitizeDocument } from "@/utils/validators";

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const userId = searchParams.get("user_id");
  const userType = (searchParams.get("type") || "user") as "user" | "store" | "institution";
  const userEmail = searchParams.get("email") || "";
  const userName = searchParams.get("name") || "";
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    phone: "",
    // Store specific
    storeName: "",
    cnpj: "",
    storeAddress: "",
    storePix: "",
    // Institution specific
    institutionName: "",
    cnpjCpf: "",
    institutionAddress: "",
    institutionPix: "",
    description: ""
  });

  const storeCnpjRegexValid = formData.cnpj ? isValidCnpjRegex(formData.cnpj) : false;
  const storeCnpjDigitsValid = formData.cnpj ? validateCNPJ(formData.cnpj) : false;
  const institutionDocumentType = detectDocumentType(formData.cnpjCpf);
  const institutionCpfValid = institutionDocumentType === "CPF" ? isValidCpfRegex(formData.cnpjCpf) : false;
  const institutionCnpjRegexValid = institutionDocumentType === "CNPJ" ? isValidCnpjRegex(formData.cnpjCpf) : false;
  const institutionCnpjDigitsValid = institutionDocumentType === "CNPJ" ? validateCNPJ(formData.cnpjCpf) : false;

  // Carregar dados do usuário
  useEffect(() => {
    if (!userId) {
      toast.error("Acesso inválido. Faça login novamente.");
      navigate("/login");
      return;
    }

    // Buscar dados do usuário no Auth0 usando o user_id
    const fetchUserData = async () => {
      try {
        // Se temos email e nome na URL, usar direto
        if (userEmail) {
          setFormData(prev => ({
            ...prev,
            email: userEmail,
            name: userName || prev.name
          }));
          setIsLoading(false);
          return;
        }

        // Caso contrário, tentar buscar do Auth0 (pode não funcionar sem token)
        console.log("User ID:", userId);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, userEmail, userName, navigate]);

  const handleSubmit = async (e: React.FormEvent, type: "user" | "store" | "institution") => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validações básicas
      if (!formData.name || !formData.email) {
        toast.error("Nome e email são obrigatórios");
        setIsProcessing(false);
        return;
      }

      if (type === "store") {
        if (!formData.storeName || !formData.cnpj) {
          toast.error("Nome da loja e CNPJ são obrigatórios");
          setIsProcessing(false);
          return;
        }
      if (!storeCnpjRegexValid || !storeCnpjDigitsValid) {
        toast.error("CNPJ inválido");
          setIsProcessing(false);
          return;
        }
      }

      if (type === "institution") {
        if (!formData.institutionName || !formData.cnpjCpf) {
          toast.error("Nome da instituição e CNPJ/CPF são obrigatórios");
          setIsProcessing(false);
          return;
        }
      if (!institutionDocumentType) {
        toast.error("Informe um CPF ou CNPJ válido");
        setIsProcessing(false);
        return;
      }
      if (institutionDocumentType === "CPF" && !institutionCpfValid) {
        toast.error("CPF inválido");
        setIsProcessing(false);
        return;
      }
      if (institutionDocumentType === "CNPJ" && (!institutionCnpjRegexValid || !institutionCnpjDigitsValid)) {
        toast.error("CNPJ inválido");
        setIsProcessing(false);
        return;
      }
      }

    // Garantir disponibilidade do documento antes de persistir
    if (type === "store" && documentoSanitizado) {
      const disponibilidade = await apiService.verificarCnpj(documentoSanitizado);
      if (!disponibilidade.disponivel) {
        toast.error(disponibilidade.message || "CNPJ já cadastrado");
        setIsProcessing(false);
        return;
      }
    }

    if (type === "institution" && documentoSanitizado) {
      if (institutionDocumentType === "CPF") {
        const disponibilidade = await apiService.verificarCpf(documentoSanitizado);
        if (!disponibilidade.disponivel) {
          toast.error(disponibilidade.message || "CPF já cadastrado");
          setIsProcessing(false);
          return;
        }
      } else if (institutionDocumentType === "CNPJ") {
        const disponibilidade = await apiService.verificarCnpj(documentoSanitizado);
        if (!disponibilidade.disponivel) {
          toast.error(disponibilidade.message || "CNPJ já cadastrado");
          setIsProcessing(false);
          return;
        }
      }
    }

    // Registrar usuário no backend
      const tipoUsuario = type === "user" ? "CLIENTE" : type === "store" ? "EMPRESA" : "INSTITUICAO";
    const documentoSanitizado = type === "store"
      ? sanitizeDocument(formData.cnpj)
      : type === "institution"
        ? sanitizeDocument(formData.cnpjCpf)
        : undefined;
      
      const usuarioResponse = await apiService.registrarUsuarioComAuth0({
        auth0UserId: userId!,
        nome: formData.name,
        email: formData.email,
        tipoUsuario: tipoUsuario as any,
        telefone: formData.phone,
      cpfCnpj: documentoSanitizado,
      });

      // Se tem CPF/CNPJ, atualizar no usuário
    if (type === "store" && documentoSanitizado) {
      await apiService.atualizarCpfCnpj(usuarioResponse.id, documentoSanitizado);
    } else if (type === "institution" && documentoSanitizado) {
      await apiService.atualizarCpfCnpj(usuarioResponse.id, documentoSanitizado);
      }

      // Marcar como registrado no Auth0
      await apiService.marcarComoCadastradoAuth0(userId!);

      toast.success("Cadastro completo! Redirecionando para login...");
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        // Redirecionar para a página de login da aplicação com flag de retorno
        window.location.href = "/login?from_registration=true";
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao completar cadastro:", error);
      toast.error(error.message || "Erro ao completar cadastro");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Complete seu Cadastro</h1>
          <p className="text-muted-foreground">Preencha os dados para começar a usar o Qexiback</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados necessários para criar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={userType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="store" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Loja
                </TabsTrigger>
                <TabsTrigger value="institution" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  ONG
                </TabsTrigger>
              </TabsList>

              {/* Cliente */}
              <TabsContent value="user">
                <form onSubmit={(e) => handleSubmit(e, "user")} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email do Google (não pode ser alterado)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? "Salvando..." : "Completar Cadastro"}
                  </Button>
                </form>
              </TabsContent>

              {/* Loja */}
              <TabsContent value="store">
                <form onSubmit={(e) => handleSubmit(e, "store")} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-store">Email</Label>
                    <Input
                      id="email-store"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email do Google (não pode ser alterado)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome da Loja</Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                      placeholder="00.000.000/0000-00"
                      required
                      className={
                        formData.cnpj && (!storeCnpjRegexValid || !storeCnpjDigitsValid) ? "border-red-500" : ""
                      }
                    />
                    {formData.cnpj && !storeCnpjRegexValid && (
                      <p className="text-sm text-red-500">Informe um CNPJ com 14 dígitos.</p>
                    )}
                    {formData.cnpj && storeCnpjRegexValid && !storeCnpjDigitsValid && (
                      <p className="text-sm text-red-500">CNPJ inválido. Verifique os dígitos.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">Endereço</Label>
                    <Input
                      id="storeAddress"
                      value={formData.storeAddress}
                      onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePix">Chave PIX</Label>
                    <Input
                      id="storePix"
                      value={formData.storePix}
                      onChange={(e) => setFormData({ ...formData, storePix: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? "Salvando..." : "Completar Cadastro"}
                  </Button>
                </form>
              </TabsContent>

              {/* ONG */}
              <TabsContent value="institution">
                <form onSubmit={(e) => handleSubmit(e, "institution")} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-institution">Email</Label>
                    <Input
                      id="email-institution"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email do Google (não pode ser alterado)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Nome da Instituição</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpjCpf">CNPJ/CPF</Label>
                    <Input
                      id="cnpjCpf"
                      value={formData.cnpjCpf}
                      onChange={(e) => {
                        const clean = sanitizeDocument(e.target.value);
                        const maskedValue = clean.length <= 11 ? maskCPF(e.target.value) : maskCNPJ(e.target.value);
                        setFormData({ ...formData, cnpjCpf: maskedValue });
                      }}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      required
                      className={
                        formData.cnpjCpf && !institutionDocumentType ? "border-red-500" :
                        institutionDocumentType === "CPF" && !institutionCpfValid ? "border-red-500" :
                        institutionDocumentType === "CNPJ" && (!institutionCnpjRegexValid || !institutionCnpjDigitsValid) ? "border-red-500" :
                        ""
                      }
                    />
                    {formData.cnpjCpf && !institutionDocumentType && (
                      <p className="text-sm text-red-500">Informe um CPF ou CNPJ válido.</p>
                    )}
                    {institutionDocumentType === "CPF" && !institutionCpfValid && (
                      <p className="text-sm text-red-500">CPF inválido.</p>
                    )}
                    {institutionDocumentType === "CNPJ" && (!institutionCnpjRegexValid || !institutionCnpjDigitsValid) && (
                      <p className="text-sm text-red-500">CNPJ inválido.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionAddress">Endereço</Label>
                    <Input
                      id="institutionAddress"
                      value={formData.institutionAddress}
                      onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva sua instituição"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionPix">Chave PIX</Label>
                    <Input
                      id="institutionPix"
                      value={formData.institutionPix}
                      onChange={(e) => setFormData({ ...formData, institutionPix: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? "Salvando..." : "Completar Cadastro"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteRegistration;
