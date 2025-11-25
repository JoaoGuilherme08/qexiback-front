import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  nomeInstituicao: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  descricao: "",
  chavePix: ""
};

const CreateInstitution = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
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

        const { userId, email, telefone, tipoUsuario, empresaId, instituicaoId } = response.data;
        setCurrentUserId(userId);

        if (instituicaoId) {
          setBlockedMessage("Você já possui uma ONG cadastrada. Gerencie-a através do seu perfil.");
        } else if (empresaId) {
          setBlockedMessage("Seu usuário já está vinculado a uma empresa. Não é possível ter empresa e ONG ao mesmo tempo.");
        } else if (tipoUsuario === "ADMINISTRADOR_EMPRESA" || tipoUsuario === "EMPRESA" || tipoUsuario === "FUNCIONARIO") {
          setBlockedMessage("Seu usuário está associado a uma empresa. Remova o vínculo para cadastrar uma ONG.");
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
      setFormData(prev => ({ ...prev, cnpj: maskCNPJ(value) }));
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
    if (!formData.nomeInstituicao.trim()) {
      toast.error("Informe o nome da instituição.");
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
      toast.error("Informe o e-mail da instituição.");
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
    } catch {
      console.warn("Não foi possível atualizar os dados do usuário localmente.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const cleanCnpj = sanitizeDocument(formData.cnpj);
      await apiService.criarInstituicao({
        userId: currentUserId,
        nomeInstituicao: formData.nomeInstituicao.trim(),
        cnpjInstituicao: cleanCnpj,
        descricaoInstituicao: formData.descricao,
        enderecoInstituicao: formData.endereco,
        cidadeInstituicao: formData.cidade,
        estadoInstituicao: formData.estado,
        email: formData.email,
        telefone: formData.telefone,
        chavePix: formData.chavePix
      });

      await atualizarCacheUsuario();
      localStorage.setItem("userType", "institution");
      toast.success("ONG cadastrada com sucesso! Você agora é administradora da instituição.");
      navigate("/profile");
    } catch (error: any) {
      console.error("Erro ao cadastrar instituição:", error);
      toast.error(error.message || "Erro ao cadastrar instituição. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (blockedMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle>Cadastrar ONG</CardTitle>
          <CardDescription>
            Informe os dados da sua instituição. Após o cadastro você será definido como responsável pela ONG.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nomeInstituicao">Nome da instituição</Label>
              <Input
                id="nomeInstituicao"
                value={formData.nomeInstituicao}
                onChange={e => handleChange("nomeInstituicao", e.target.value)}
                placeholder="Associação Exemplo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpjInstituicao">CNPJ</Label>
              <Input
                id="cnpjInstituicao"
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
                <Label htmlFor="emailInstituicao">E-mail</Label>
                <Input
                  id="emailInstituicao"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="contato@instituicao.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneInstituicao">Telefone</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.telefone}
                  onChange={e => handleChange("telefone", e.target.value)}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      id="telefoneInstituicao"
                      placeholder="(11) 99999-9999"
                    />
                  )}
                </InputMask>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enderecoInstituicao">Endereço completo</Label>
              <Input
                id="enderecoInstituicao"
                value={formData.endereco}
                onChange={e => handleChange("endereco", e.target.value)}
                placeholder="Rua, número, bairro, complemento"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidadeInstituicao">Cidade</Label>
                <Input
                  id="cidadeInstituicao"
                  value={formData.cidade}
                  onChange={e => handleChange("cidade", e.target.value)}
                  placeholder="São Paulo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoInstituicao">Estado (UF)</Label>
                <Input
                  id="estadoInstituicao"
                  value={formData.estado}
                  onChange={e => handleChange("estado", e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoInstituicao">Descrição (opcional)</Label>
              <Textarea
                id="descricaoInstituicao"
                value={formData.descricao}
                onChange={e => handleChange("descricao", e.target.value)}
                placeholder="Conte um pouco sobre o trabalho da ONG..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chavePix">Chave PIX (opcional)</Label>
              <Input
                id="chavePix"
                value={formData.chavePix}
                onChange={e => handleChange("chavePix", e.target.value)}
                placeholder="Informe a chave PIX utilizada para doações"
              />
            </div>

            <CardFooter className="px-0">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Cadastrar ONG"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInstitution;

