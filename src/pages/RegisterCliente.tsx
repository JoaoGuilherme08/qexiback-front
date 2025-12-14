import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";

const RegisterCliente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmSenha: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handlePasswordValidation = useCallback((isValid: boolean, errors: string[]) => {
    setIsPasswordValid(isValid);
    setPasswordErrors(errors);
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (!isPasswordValid) {
      toast.error("A senha não atende aos requisitos de segurança: " + passwordErrors.join(", "));
      return;
    }

    try {
      setIsProcessing(true);
      
      // Registrar usuário no backend
      const response = await apiService.registrarUsuario({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        tipoUsuario: 'CLIENTE'
      });
      
      toast.success("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-[#00ea7c]">
            Qexiback
          </span>
        </Link>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-2xl">Criar conta - Usuário</CardTitle>
            <CardDescription>
              Cadastre-se como cliente e comece a usar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Email Sign Up Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Digite uma senha forte"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
                <PasswordStrengthMeter 
                  password={formData.senha} 
                  onValidationChange={handlePasswordValidation}
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmSenha">Confirmar senha</Label>
                <Input
                  id="confirmSenha"
                  name="confirmSenha"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Criar Conta
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </div>
            <Separator />
            <div className="text-sm text-center">
              <Link to="/register" className="text-muted-foreground hover:text-primary">
                Cadastrar como Empresa ou Instituição →
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterCliente;
