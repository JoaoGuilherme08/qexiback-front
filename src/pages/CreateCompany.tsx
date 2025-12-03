import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { maskCNPJ, sanitizeDocument, isValidCnpjRegex, validateCNPJ } from "@/utils/validators";
import InputMask from "react-input-mask";

const defaultFormState = {
  nomeFantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  descricao: ""
};

const CreateCompany = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await apiService.validateToken(token);
        if (!response.data) {
          throw new Error("Não foi possível carregar os dados do usuário.");
        }

        const { userId, email, telefone, tipoUsuario, empresaId: empresaDoUsuario, instituicaoId } = response.data;
        setCurrentUserId(userId);
        setEmpresaId(empresaDoUsuario || null);

        // Se usuário já é administrador ou já possui empresa vinculada, bloquear o formulário
        if (empresaDoUsuario) {
          setBlockedMessage("Você já possui uma empresa cadastrada. Gerencie-a através do seu perfil.");
        } else if (instituicaoId) {
          setBlockedMessage("Seu usuário já possui uma ONG cadastrada. Não é possível ter empresa e ONG ao mesmo tempo.");
        } else if (tipoUsuario === "ADMINISTRADOR_EMPRESA" || tipoUsuario === "EMPRESA" || tipoUsuario === "FUNCIONARIO") {
          setBlockedMessage("Seu usuário já está vinculado a uma empresa.");
        } else {
          setFormData(prev => ({
            ...prev,
            email: email || "",
            telefone: telefone || ""
          }));
        }
      } catch (error: any) {
        console.error("Erro ao carregar usuário:", error);
        toast.error(error.message || "Não foi possível carregar seus dados.");
        navigate("/profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    if (field === "cnpj") {
      const masked = maskCNPJ(value);
      setFormData(prev => ({ ...prev, cnpj: masked }));
      setCnpjError(null);
      return;
    }

    if (field === "estado") {
      setFormData(prev => ({ ...prev, estado: value.toUpperCase().slice(0, 2) }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nomeFantasia.trim()) {
      toast.error("Informe o nome fantasia da empresa.");
      return false;
    }

    if (!formData.cnpj.trim()) {
      toast.error("Informe o CNPJ.");
      return false;
    }

    const cleanCnpj = sanitizeDocument(formData.cnpj);
    if (!isValidCnpjRegex(cleanCnpj) || !validateCNPJ(cleanCnpj)) {
      setCnpjError("CNPJ inválido. Verifique os dígitos.");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Informe o e-mail comercial.");
      return false;
    }

    if (!formData.endereco.trim()) {
      toast.error("Informe o endereço completo.");
      return false;
    }

    if (!formData.cidade.trim()) {
      toast.error("Informe a cidade.");
      return false;
    }

    if (formData.estado.length !== 2) {
      toast.error("Informe o estado com 2 letras.");
      return false;
    }

    return true;
  };

  const atualizarCacheUsuario = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const refresh = await apiService.validateToken(token);
      if (refresh.data) {
        localStorage.setItem("userData", JSON.stringify(refresh.data));
      }
    } catch (error) {
      console.warn("Não foi possível atualizar os dados do usuário localmente.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    if (!currentUserId) return;

    setIsSubmitting(true);

    try {
      const cleanCnpj = sanitizeDocument(formData.cnpj);
      await apiService.criarEmpresa({
        userId: currentUserId,
        nomeFantasia: formData.nomeFantasia.trim(),
        cnpjEmpresa: cleanCnpj,
        descricaoEmpresa: formData.descricao,
        enderecoEmpresa: formData.endereco,
        cidadeEmpresa: formData.cidade,
        estadoEmpresa: formData.estado,
        email: formData.email,
        telefone: formData.telefone
      });

      await atualizarCacheUsuario();
      localStorage.setItem("userType", "store");

      toast.success("Empresa cadastrada com sucesso! Você agora é administrador.");
      navigate("/profile");
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      toast.error(error.message || "Erro ao cadastrar empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="store" />
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando informações...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (blockedMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="store" />
        <div className="flex-1 flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Cadastro indisponível</CardTitle>
              <CardDescription>{blockedMessage}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigate("/profile")}>Ir para o perfil</Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="store" />
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle>Cadastrar empresa</CardTitle>
          <CardDescription>
            Informe os dados da sua empresa. Assim que o cadastro for concluído você será definido como administrador.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome fantasia</Label>
              <Input
                id="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={e => handleChange("nomeFantasia", e.target.value)}
                placeholder="Minha Empresa LTDA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={e => handleChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                required
              />
              {cnpjError && <p className="text-sm text-red-500">{cnpjError}</p>}
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail comercial</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="contato@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.telefone}
                  onChange={e => handleChange("telefone", e.target.value)}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      id="telefone"
                      placeholder="(11) 99999-9999"
                    />
                  )}
                </InputMask>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço completo</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={e => handleChange("endereco", e.target.value)}
                placeholder="Rua, número, bairro, complemento"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={e => handleChange("cidade", e.target.value)}
                  placeholder="São Paulo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado (UF)</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={e => handleChange("estado", e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={e => handleChange("descricao", e.target.value)}
                placeholder="Conte um pouco sobre sua empresa..."
              />
            </div>

            <CardFooter className="px-0">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Cadastrar empresa"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
    <Footer />
    </div>
  );
};

export default CreateCompany;

