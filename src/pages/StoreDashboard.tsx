import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Wallet, TrendingUp, Package, Tag } from "lucide-react";
const StoreDashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

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
      <Navbar userType="store" onLogout={handleLogout} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard da Loja</h1>
            <p className="text-muted-foreground">
              Cafeteria Central - Visão geral do seu negócio
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Vendas Totais</CardDescription>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
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
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl">{stats.activeCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>

            <Card className="shadow-soft gradient-primary text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-white/80">Cashback Distribuído</CardDescription>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl">R$ {stats.totalCashback.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Média de 15% por venda
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Produtos Ativos</CardDescription>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
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
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cupons</CardTitle>
                    <CardDescription>Criar promoções</CardDescription>
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