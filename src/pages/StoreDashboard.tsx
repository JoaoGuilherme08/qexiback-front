import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Wallet, TrendingUp, Package, Tag } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  userId: string;
  nome: string;
  email: string;
  tipoUsuario: string;
  token: string;
  expiresIn: number;
  empresaId?: string;
  nomeFantasia?: string;
  cnpjEmpresa?: string;
}

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("authToken");
      const storedUserType = localStorage.getItem("userType");
      const storedUserData = localStorage.getItem("userData");

      if (!authToken || storedUserType !== "store" || !storedUserData) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/login");
        return;
      }

      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error("Erro ao parsear dados do usuário:", error);
        toast.error("Erro nos dados da sessão. Faça login novamente.");
        navigate("/login");
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Mock data
  const stats = {
    totalSales: 1250,
    activeCustomers: 340,
    totalCashback: 15680.50,
    activeProducts: 28
  };
  const recentTransactions = [{
    id: 1,
    customer: "João Silva",
    product: "Café Premium",
    value: 45.90,
    cashback: 6.89,
    date: "2025-01-10"
  }, {
    id: 2,
    customer: "Maria Santos",
    product: "Combo Breakfast",
    value: 32.50,
    cashback: 4.88,
    date: "2025-01-10"
  }, {
    id: 3,
    customer: "Pedro Costa",
    product: "Cappuccino",
    value: 18.00,
    cashback: 2.70,
    date: "2025-01-09"
  }];
  return <div className="min-h-screen flex flex-col">
      <Navbar userType="store" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard da Loja</h1>
                <p className="text-muted-foreground">
                  {userData.nomeFantasia || userData.nome} - Visão geral do seu negócio
                </p>
                {userData.cnpjEmpresa && (
                  <p className="text-sm text-muted-foreground">
                    CNPJ: {userData.cnpjEmpresa}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/store/products")} variant="default" className="gap-2">
                  <Package className="w-4 h-4" />
                  Visualizar Produtos
                </Button>
                <Button onClick={handleLogout} variant="outline">
                  Sair
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Vendas Totais</CardDescription>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl">{stats.totalSales}</CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Clientes Ativos</CardDescription>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl">{stats.activeCustomers}</CardTitle>
              </CardHeader>
              <CardContent className="bg-transparent">
                
              </CardContent>
            </Card>

            <Card className="shadow-soft gradient-primary text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[#281f56]">Cashback Distribuído</CardDescription>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[#281f56]">R$ {stats.totalCashback.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Produtos Ativos</CardDescription>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl">{stats.activeProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/store/products")}>
                  Gerenciar produtos →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-soft hover:shadow-medium transition-base cursor-pointer" onClick={() => navigate("/store/products")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Produtos</CardTitle>
                    <CardDescription>Gerenciar catálogo</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            

            <Card className="shadow-soft hover:shadow-medium transition-base cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Clientes</CardTitle>
                    <CardDescription>Ver estatísticas</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="shadow-soft">
            
            
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default StoreDashboard;