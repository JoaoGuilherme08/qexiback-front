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
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
const StoreProducts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCashback, setProductCashback] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const platformPercentage = 5; // Porcentagem da plataforma (será parametrizável no admin)

  const [products, setProducts] = useState([{
    id: 1,
    name: "Café Premium",
    price: 45.90,
    cashback: 15,
    category: "Bebidas",
    active: true,
    code: "CAFE001"
  }, {
    id: 2,
    name: "Combo Breakfast",
    price: 32.50,
    cashback: 15,
    category: "Combos",
    active: true,
    code: "COMBO001"
  }, {
    id: 3,
    name: "Cappuccino",
    price: 18.00,
    cashback: 15,
    category: "Bebidas",
    active: true,
    code: "CAP001"
  }, {
    id: 4,
    name: "Croissant",
    price: 12.00,
    cashback: 10,
    category: "Doces",
    active: false,
    code: "CROIS001"
  }]);

  // Calcula valores do cashback
  const calculateCashbackValues = () => {
    const price = parseFloat(productPrice) || 0;
    const cashback = parseFloat(productCashback) || 0;
    const cashbackAmount = price * cashback / 100;
    const platformAmount = price * platformPercentage / 100;
    const clientAmount = cashbackAmount - platformAmount;
    const finalPrice = price + cashbackAmount;
    return {
      cashbackAmount,
      platformAmount,
      clientAmount: clientAmount > 0 ? clientAmount : 0,
      finalPrice,
      isValid: price > 0 && cashback > 0
    };
  };
  const cashbackValues = calculateCashbackValues();
  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };
  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success("Produto removido com sucesso!");
  };
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen flex flex-col">
      <Navbar userType="store" onLogout={handleLogout} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestão de Produtos</h1>
              <p className="text-muted-foreground">
                Cadastre e gerencie seus produtos e serviços
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Produto</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo produto ou serviço
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nome do Produto</Label>
                    <Input id="productName" placeholder="Ex: Café Especial" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Código do Produto</Label>
                    <Input id="productCode" placeholder="Ex: CAFE001" />
                    <p className="text-xs text-muted-foreground">
                      Código para retirada do produto no estabelecimento
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input id="price" type="number" step="0.01" placeholder="0,00" value={productPrice} onChange={e => setProductPrice(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cashback">Cashback (%)</Label>
                      <Input id="cashback" type="number" placeholder="15" value={productCashback} onChange={e => setProductCashback(e.target.value)} />
                    </div>
                  </div>
                  
                  {/* Cálculo do valor final */}
                  {cashbackValues.isValid && <div className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Valor do Produto:</span>
                        <span className="font-medium">R$ {parseFloat(productPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cashback Total ({productCashback}%):</span>
                        <span className="font-medium">R$ {cashbackValues.cashbackAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">• Cliente recebe:</span>
                          <span className="text-primary font-medium">R$ {cashbackValues.clientAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">• Plataforma ({platformPercentage}%):</span>
                          <span className="text-muted-foreground">R$ {cashbackValues.platformAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Valor Final:</span>
                          <span className="font-bold text-lg text-primary">R$ {cashbackValues.finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" placeholder="Descrição do produto" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productImage">Imagem do Produto</Label>
                    <Input 
                      id="productImage" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                    />
                    {productImage && (
                      <p className="text-xs text-muted-foreground">
                        Arquivo selecionado: {productImage.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Período da Promoção</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-xs text-muted-foreground">Data Início</Label>
                        <Input 
                          id="startDate" 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-xs text-muted-foreground">Data Fim</Label>
                        <Input 
                          id="endDate" 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Período de validade para este cashback
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={() => toast.success("Produto cadastrado!")}>
                    Cadastrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card className="shadow-soft mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Buscar produtos..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
              <CardDescription>
                {filteredProducts.length} produto(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredProducts.length === 0 ? <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum produto encontrado</p>
                  </div> : filteredProducts.map(product => <div key={product.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center bg-[#00ea7c]">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{product.name}</p>
                            <Badge variant={product.active ? "default" : "secondary"}>
                              {product.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                              {product.code}
                            </code>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-lg">R$ {product.price.toFixed(2)}</p>
                          <Badge variant="secondary" className="text-xs">
                            {product.cashback}% cashback
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default StoreProducts;