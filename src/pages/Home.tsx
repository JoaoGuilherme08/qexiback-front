import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, MapPin, TrendingUp, ShoppingBag, Coffee, Utensils, Laptop, Copy, MessageCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  // Mock data - ofertas
  const offers = [{
    id: 1,
    title: "Cafeteria Central",
    description: "Café especial e doces artesanais",
    cashback: 15,
    category: "Alimentação",
    location: "Centro, São Paulo",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",
    icon: Coffee
  }, {
    id: 2,
    title: "Tech Store Premium",
    description: "Eletrônicos e acessórios",
    cashback: 10,
    category: "Tecnologia",
    location: "Shopping Center",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    icon: Laptop
  }, {
    id: 3,
    title: "Restaurante Sabor",
    description: "Culinária brasileira autêntica",
    cashback: 12,
    category: "Restaurante",
    location: "Jardins, São Paulo",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    icon: Utensils
  }, {
    id: 4,
    title: "Moda & Estilo",
    description: "Roupas e acessórios de moda",
    cashback: 20,
    category: "Moda",
    location: "Av. Paulista",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    icon: ShoppingBag
  }];
  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handlePurchaseClick = (offer: any) => {
    setSelectedOffer(offer);
    setPurchaseDialogOpen(true);
  };

  const generatePickupCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const pickupCode = selectedOffer ? generatePickupCode() : "";
  const productPrice = selectedOffer ? 150.00 : 0;
  const cashbackAmount = selectedOffer ? (productPrice * selectedOffer.cashback / 100) : 0;
  const pixCode = selectedOffer ? `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 38)}52040000530398654${productPrice.toFixed(2)}5802BR5925LOJA ${selectedOffer.title.toUpperCase()}6009SAO PAULO62070503***6304` : "";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  const contactWhatsApp = () => {
    if (selectedOffer) {
      const message = `Olá! Gostaria de mais informações sobre a oferta: ${selectedOffer.title}. Código de retirada: ${pickupCode}`;
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
    }
  };
  return <div className="min-h-screen flex flex-col">
      <Navbar userType="user" onLogout={handleLogout} />

      <main className="flex-1">
        {/* Hero Search Section */}
        <section className="bg-secondary py-12 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Descubra Ofertas com Cashback
              </h1>
              <p className="text-white/90 mb-6">
                Milhares de produtos e serviços com os melhores percentuais de retorno
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Buscar por produto, loja ou categoria..." className="pl-10 h-12 bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        

        {/* Offers Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ofertas em Destaque</h2>
                <p className="text-muted-foreground">
                  {offers.length} ofertas disponíveis
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Maior Cashback
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {offers.map(offer => <Card key={offer.id} className="overflow-hidden hover:shadow-medium transition-base cursor-pointer group">
                  <div className="relative h-48 overflow-hidden" onClick={() => navigate(`/offers/${offer.id}`)}>
                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3">
                      <Badge className="font-bold text-base px-3 py-1 text-[#f4efea] bg-[#281f56]">
                        {offer.cashback}% Cashback
                      </Badge>
                    </div>
                  </div>
                  <CardHeader onClick={() => navigate(`/offers/${offer.id}`)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{offer.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {offer.location}
                        </CardDescription>
                      </div>
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <offer.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => navigate(`/offers/${offer.id}`)}>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full bg-[#00ea7c] text-[#281f56]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchaseClick(offer);
                      }}
                    >
                      Comprar
                    </Button>
                  </CardFooter>
                </Card>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        
      </main>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Compra</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code para pagar via Pix
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedOffer.title}</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Valor do Produto:</span>
                  <span className="font-bold">R$ {productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Cashback ({selectedOffer.cashback}%):</span>
                  <span className="font-bold">R$ {cashbackAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border">
                <QRCodeSVG value={pixCode} size={200} />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => copyToClipboard(pixCode, "Código Pix")}
                >
                  <Copy className="w-4 h-4" />
                  Copiar Código Pix
                </Button>
              </div>

              {/* Cashback Info */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Importante:</strong> O cashback de R$ {cashbackAmount.toFixed(2)} será creditado na sua conta após o período de 1 mês da compra.
                </p>
              </div>

              {/* Pickup Code */}
              <div className="border border-border p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Código de Retirada na Loja:</p>
                <div className="flex items-center justify-between bg-muted p-3 rounded">
                  <span className="text-2xl font-bold tracking-wider">{pickupCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(pickupCode, "Código de retirada")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Apresente este código na loja física para retirar seu produto
                </p>
              </div>

              {/* WhatsApp Contact */}
              <Button
                variant="outline"
                className="w-full gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                onClick={contactWhatsApp}
              >
                <MessageCircle className="w-4 h-4" />
                Contatar Loja via WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>;
};
export default Home;