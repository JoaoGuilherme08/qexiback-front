import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Store, Heart } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"user" | "store" | "institution">("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de login
    if (formData.email && formData.password) {
      localStorage.setItem("userType", userType);
      toast.success("Login realizado com sucesso!");
      
      // Redirecionar baseado no tipo de usuário
      if (userType === "user") {
        navigate("/home");
      } else if (userType === "store") {
        navigate("/store/dashboard");
      } else {
        navigate("/institution/dashboard");
      }
    } else {
      toast.error("Por favor, preencha todos os campos");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
            Qexiback
          </span>
        </Link>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-2xl">Entrar na plataforma</CardTitle>
            <CardDescription>Escolha seu tipo de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as typeof userType)}>
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

              <TabsContent value={userType}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Entrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
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
