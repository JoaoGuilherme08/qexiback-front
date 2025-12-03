import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { clearStoredAuth, isStoredTokenExpired, storeTokenExpiry } from "@/utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Verificar se usuário já está logado ao carregar a página
  useEffect(() => {
    const checkExistingLogin = () => {
      const authToken = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (authToken && userData) {
        if (isStoredTokenExpired()) {
          clearStoredAuth();
          return;
        }
        navigate("/home");
      }
    };

    checkExistingLogin();
  }, [navigate]);


  // Login unificado - detecta automaticamente o tipo de usuário
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error("Por favor, preencha todos os campos");
        return;
      }

      console.log("Iniciando login unificado...");

      // Tentar login tradicional primeiro
      const response = await apiService.login({
        email: formData.email,
        senha: formData.password
      });
      console.log("Resposta do login:", response);

      if (response.success && response.data) {
        // Limpar qualquer dados de Auth0 existentes
        localStorage.removeItem("auth0.is.authenticated");

        // Limpar tokens expirados
        clearStoredAuth();

        // Salvar token e dados no localStorage
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data));
        storeTokenExpiry(response.data.expiresIn);

        // Determinar tipo de usuário e redirecionar automaticamente
        const tipoUsuario = response.data.tipoUsuario;

        if (tipoUsuario === "EMPRESA" || tipoUsuario === "ADMINISTRADOR_EMPRESA") {
          localStorage.setItem("userType", "store");
          toast.success(`Bem-vindo, ${response.data.nomeFantasia || response.data.nome}!`);
          window.location.href = "/store/dashboard";
        } else if (tipoUsuario === "INSTITUICAO") {
          localStorage.setItem("userType", "institution");
          toast.success(`Bem-vindo, ${response.data.nomeInstituicao || response.data.nome}!`);
          window.location.href = "/institution/dashboard";
        } else {
          localStorage.setItem("userType", "user");
          toast.success(`Bem-vindo, ${response.data.nome}!`);
          window.location.href = "/home";
        }

        console.log(`Login realizado - Tipo: ${tipoUsuario}, redirecionando...`);

      } else {
        toast.error(response.message || "Erro ao fazer login");
      }

    } catch (error: any) {
      console.error("Erro no login:", error);
      
      // Se o erro for sobre login social, mostrar mensagem específica
      if (error.message?.includes("login social")) {
        toast.error("Esta conta utiliza login social. Use o botão 'Continuar com Google'");
      } else {
        toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text mb-2">Qexiback</h1>
          </Link>
          <p className="text-muted-foreground">Faça login em sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <LogIn className="w-5 h-5" />
              Entrar
            </CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : null}
                Entrar
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
