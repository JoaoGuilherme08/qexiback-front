import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Store, TrendingUp, Users, Percent, Edit, Search } from "lucide-react";
import { toast } from "sonner";

interface StoreConfig {
  id: number;
  name: string;
  category: string;
  platformPercentage: number;
  totalCashback: number;
  status: "active" | "inactive";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<StoreConfig[]>([
    { id: 1, name: "Café da Praça", category: "Alimentação", platformPercentage: 5, totalCashback: 1250.50, status: "active" },
    { id: 2, name: "Restaurante Sabor", category: "Alimentação", platformPercentage: 7, totalCashback: 3420.80, status: "active" },
    { id: 3, name: "Farmácia Central", category: "Saúde", platformPercentage: 4, totalCashback: 980.30, status: "active" },
    { id: 4, name: "Pet Shop Amigo", category: "Pet", platformPercentage: 6, totalCashback: 560.00, status: "inactive" },
  ]);

  const [editingStore, setEditingStore] = useState<StoreConfig | null>(null);
  const [newPercentage, setNewPercentage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleUpdatePercentage = () => {
    if (!editingStore) return;

    const percentage = parseFloat(newPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error("Porcentagem inválida! Digite um valor entre 0 e 100.");
      return;
    }

    setStores(stores.map(store => 
      store.id === editingStore.id 
        ? { ...store, platformPercentage: percentage }
        : store
    ));

    toast.success(`Taxa da plataforma atualizada para ${percentage}%`);
    setEditingStore(null);
    setNewPercentage("");
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === "active").length;
  const totalCashbackGenerated = stores.reduce((sum, s) => sum + s.totalCashback, 0);
  const averagePercentage = stores.reduce((sum, s) => sum + s.platformPercentage, 0) / stores.length;

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
                <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
                <Percent className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Média da plataforma
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
                Configure a taxa da plataforma para cada estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{store.name}</p>
                          <Badge variant={store.status === "active" ? "default" : "secondary"}>
                            {store.status === "active" ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{store.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Taxa da Plataforma</p>
                        <p className="text-2xl font-bold text-primary">{store.platformPercentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Cashback Gerado</p>
                        <p className="text-sm font-semibold">R$ {store.totalCashback.toFixed(2)}</p>
                      </div>
                      <Dialog 
                        open={editingStore?.id === store.id} 
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingStore(null);
                            setNewPercentage("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              setEditingStore(store);
                              setNewPercentage(store.platformPercentage.toString());
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Taxa da Plataforma</DialogTitle>
                            <DialogDescription>
                              Configure a porcentagem da plataforma para {store.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="percentage">Taxa da Plataforma (%)</Label>
                              <Input
                                id="percentage"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="Ex: 5"
                                value={newPercentage}
                                onChange={(e) => setNewPercentage(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Esta porcentagem será deduzida do cashback total oferecido pela loja
                              </p>
                            </div>

                            {newPercentage && !isNaN(parseFloat(newPercentage)) && (
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-2">Exemplo de cálculo:</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cashback total da loja:</span>
                                    <span className="font-medium">20%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxa da plataforma:</span>
                                    <span className="font-medium text-primary">{newPercentage}%</span>
                                  </div>
                                  <div className="border-t border-border pt-1 mt-1 flex justify-between">
                                    <span className="text-muted-foreground">Cliente recebe:</span>
                                    <span className="font-bold text-primary">
                                      {(20 - parseFloat(newPercentage)).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setEditingStore(null);
                                setNewPercentage("");
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdatePercentage}>
                              Salvar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
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
