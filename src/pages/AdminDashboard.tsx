import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, Users, Percent, Search } from "lucide-react";
import { toast } from "sonner";

interface StoreConfig {
  id: number;
  name: string;
  fantasyName: string;
  category: string;
  cnpj: string;
  responsible: string;
  contact: string;
  address: string;
  totalCashback: number;
  status: "active" | "inactive";
}

const PLATFORM_PERCENTAGE = 3; // Taxa fixa da plataforma

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<StoreConfig[]>([
    { 
      id: 1, 
      name: "Café da Praça", 
      fantasyName: "Café da Praça Ltda",
      category: "Alimentação", 
      cnpj: "12.345.678/0001-90",
      responsible: "João Silva",
      contact: "(11) 98765-4321",
      address: "Rua das Flores, 123 - Centro",
      totalCashback: 1250.50, 
      status: "active" 
    },
    { 
      id: 2, 
      name: "Restaurante Sabor", 
      fantasyName: "Sabor Gastronomia ME",
      category: "Alimentação", 
      cnpj: "23.456.789/0001-01",
      responsible: "Maria Santos",
      contact: "(11) 97654-3210",
      address: "Av. Principal, 456 - Jardim",
      totalCashback: 3420.80, 
      status: "active" 
    },
    { 
      id: 3, 
      name: "Farmácia Central", 
      fantasyName: "Farmácia Central Ltda",
      category: "Saúde", 
      cnpj: "34.567.890/0001-12",
      responsible: "Pedro Costa",
      contact: "(11) 96543-2109",
      address: "Praça da Saúde, 789",
      totalCashback: 980.30, 
      status: "active" 
    },
    { 
      id: 4, 
      name: "Pet Shop Amigo", 
      fantasyName: "Pet Shop Amigo EIRELI",
      category: "Pet", 
      cnpj: "45.678.901/0001-23",
      responsible: "Ana Lima",
      contact: "(11) 95432-1098",
      address: "Rua dos Animais, 321 - Vila Pet",
      totalCashback: 560.00, 
      status: "inactive" 
    },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleToggleStatus = (storeId: number) => {
    setStores(stores.map(store => {
      if (store.id === storeId) {
        const newStatus = store.status === "active" ? "inactive" : "active";
        toast.success(`Estabelecimento ${newStatus === "active" ? "ativado" : "desativado"} com sucesso!`);
        return { ...store, status: newStatus };
      }
      return store;
    }));
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === "active").length;
  const totalCashbackGenerated = stores.reduce((sum, s) => sum + s.totalCashback, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="user" onLogout={handleLogout} />

      <main className="flex-1 py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Painel do Administrador</h1>
            <p className="text-muted-foreground">
              Gerencie as taxas da plataforma por estabelecimento
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
                <Store className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStores}</div>
                <p className="text-xs text-muted-foreground">
                  {activeStores} ativas
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStores}</div>
                <p className="text-xs text-muted-foreground">
                  {((activeStores/totalStores) * 100).toFixed(0)}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cashback Total</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalCashbackGenerated.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Gerado por todas as lojas
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa da Plataforma</CardTitle>
                <Percent className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{PLATFORM_PERCENTAGE}%</div>
                <p className="text-xs text-muted-foreground">
                  Taxa fixa para todos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="shadow-soft mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar estabelecimento..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stores List */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Estabelecimentos</CardTitle>
              <CardDescription>
                Gerencie o acesso dos estabelecimentos à plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStores.map((store) => (
                  <Card key={store.id} className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                            <Store className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{store.name}</h3>
                              <Badge variant={store.status === "active" ? "default" : "secondary"}>
                                {store.status === "active" ? "Ativa" : "Inativa"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{store.category}</p>
                          </div>
                        </div>
                        <Button
                          variant={store.status === "active" ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(store.id)}
                        >
                          {store.status === "active" ? "Desativar" : "Ativar"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                          <p className="font-medium">{store.fantasyName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CNPJ</p>
                          <p className="font-medium">{store.cnpj}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Responsável</p>
                          <p className="font-medium">{store.responsible}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Contato</p>
                          <p className="font-medium">{store.contact}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Endereço</p>
                          <p className="font-medium">{store.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">Taxa da Plataforma</p>
                          <p className="text-xl font-bold text-primary">{PLATFORM_PERCENTAGE}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Cashback Gerado</p>
                          <p className="text-xl font-bold">R$ {store.totalCashback.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
