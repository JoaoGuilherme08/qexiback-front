import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Store, Heart } from "lucide-react";
import { toast } from "sonner";
const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"user" | "store" | "institution">("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Store specific
    storeName: "",
    cnpj: "",
    storeLogo: null as File | null,
    storePix: "",
    storeAddress: "",
    // Institution specific
    institutionName: "",
    cnpjCpf: "",
    institutionLogo: null as File | null,
    institutionPix: "",
    institutionAddress: "",
    description: ""
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Simulação de cadastro
    localStorage.setItem("userType", userType);
    toast.success("Cadastro realizado com sucesso!");

    // Redirecionar baseado no tipo de usuário
    if (userType === "user") {
      navigate("/home");
    } else if (userType === "store") {
      navigate("/store/dashboard");
    } else {
      navigate("/institution/dashboard");
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      [fieldName]: file
    });
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          
          <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-[#00ea7c]">
            Qexiback
          </span>
        </Link>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>Escolha seu tipo de cadastro</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={value => setUserType(value as typeof userType)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="user" className="gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Usuário</span>
                </TabsTrigger>
                <TabsTrigger value="store" className="gap-1.5">
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Loja</span>
                </TabsTrigger>
                <TabsTrigger value="institution" className="gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">ONG</span>
                </TabsTrigger>
              </TabsList>

              {/* User Registration */}
              <TabsContent value="user">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" name="name" placeholder="Seu nome" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Digite a senha novamente" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>

              {/* Store Registration */}
              <TabsContent value="store">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome da loja</Label>
                    <Input id="storeName" name="storeName" placeholder="Nome do estabelecimento" value={formData.storeName} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" value={formData.cnpj} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeLogo">Logo da loja</Label>
                    <Input id="storeLogo" name="storeLogo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'storeLogo')} required />
                    {formData.storeLogo && <p className="text-sm text-muted-foreground">Arquivo: {formData.storeLogo.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePix">Chave PIX</Label>
                    <Input id="storePix" name="storePix" placeholder="CPF, CNPJ, e-mail ou chave aleatória" value={formData.storePix} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">Endereço</Label>
                    <Input id="storeAddress" name="storeAddress" placeholder="Rua, número, bairro, cidade" value={formData.storeAddress} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="contato@loja.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Digite a senha novamente" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>

              {/* Institution Registration */}
              <TabsContent value="institution">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Nome da instituição</Label>
                    <Input id="institutionName" name="institutionName" placeholder="Nome da ONG/Asilo" value={formData.institutionName} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpjCpf">CNPJ/CPF</Label>
                    <Input id="cnpjCpf" name="cnpjCpf" placeholder="00.000.000/0000-00" value={formData.cnpjCpf} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionLogo">Logo da instituição</Label>
                    <Input id="institutionLogo" name="institutionLogo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'institutionLogo')} required />
                    {formData.institutionLogo && <p className="text-sm text-muted-foreground">Arquivo: {formData.institutionLogo.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionPix">Chave PIX</Label>
                    <Input id="institutionPix" name="institutionPix" placeholder="CPF, CNPJ, e-mail ou chave aleatória" value={formData.institutionPix} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionAddress">Endereço (opcional)</Label>
                    <Input id="institutionAddress" name="institutionAddress" placeholder="Rua, número, bairro, cidade" value={formData.institutionAddress} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="contato@instituicao.org" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Digite a senha novamente" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>;
};
export default Register;