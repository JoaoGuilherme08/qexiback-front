import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, ShoppingBag, TrendingUp, Package, Calendar, Store } from "lucide-react";
import { produtoService, Produto } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIAS_PRODUTOS } from "@/constants/categorias";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      carregarProduto(id);
    }
  }, [id]);

  const carregarProduto = async (produtoId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const produtoData = await produtoService.buscarProdutoPorId(produtoId);
      setProduto(produtoData);
    } catch (error: any) {
      console.error("Erro ao carregar produto:", error);
      setError(error.message || "Erro ao carregar produto");
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComprar = () => {
    if (produto) {
      navigate(`/checkout/${produto.id}`);
    }
  };

  const getCategoriaIcon = (categoria?: string) => {
    const icons: Record<string, any> = {
      "Alimentação": Package,
      "Bebidas": Package,
      "Tecnologia": ShoppingBag,
      "Eletrônicos": ShoppingBag,
      "Moda": ShoppingBag,
      "Restaurante": Package,
      "Outros": Package,
    };
    return icons[categoria || ""] || Package;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Carregando produto...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Produto não encontrado</CardTitle>
              <CardDescription>{error || "O produto que você está procurando não existe."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/home")} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Ofertas
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = getCategoriaIcon(produto.categoria);
  const cashbackAmount = Number(produto.precoProduto) * (Number(produto.prcntCashback) || 0) / 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="user" />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted py-4">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/home")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Ofertas
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Imagem do Produto */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                {produto.fotoUrl ? (
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    <img
                      src={produto.fotoUrl}
                      alt={produto.nomeProduto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Icon className="w-32 h-32 text-primary/50" />
                  </div>
                )}
              </Card>
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              <div>
                {produto.categoria && (
                  <Badge variant="outline" className="mb-3">
                    {produto.categoria}
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{produto.nomeProduto}</h1>
                {produto.descricaoProduto && (
                  <p className="text-lg text-muted-foreground mb-6">{produto.descricaoProduto}</p>
                )}
              </div>

              {/* Informações da Loja */}
              {produto.nomeFantasiaEmpresa && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Loja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{produto.nomeFantasiaEmpresa}</p>
                    {produto.cnpjEmpresa && (
                      <p className="text-sm text-muted-foreground">CNPJ: {produto.cnpjEmpresa}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Preço e Cashback */}
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Preço e Cashback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm text-muted-foreground">Preço:</span>
                    <span className="text-4xl font-bold text-primary">
                      R$ {Number(produto.precoProduto).toFixed(2)}
                    </span>
                  </div>
                  
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cashback:</span>
                      <Badge className="bg-[#00ea7c] text-white text-lg px-3 py-1">
                        {produto.prcntCashback?.toFixed(0) || 0}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Você recebe de volta:</span>
                      <span className="text-xl font-bold text-[#00ea7c]">
                        R$ {cashbackAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validade */}
              {(produto.dtInicio || produto.dtFim) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Validade da Oferta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {produto.dtInicio && produto.dtFim && (
                      <p className="text-sm">
                        Válido de{" "}
                        <span className="font-semibold">
                          {new Date(produto.dtInicio).toLocaleDateString("pt-BR")}
                        </span>{" "}
                        até{" "}
                        <span className="font-semibold">
                          {new Date(produto.dtFim).toLocaleDateString("pt-BR")}
                        </span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botão de Compra */}
              <Button
                onClick={handleComprar}
                size="lg"
                className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-medium hover:shadow-strong text-lg h-14"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Comprar Agora
              </Button>

              {/* Informações Adicionais */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Importante:</strong> O cashback será creditado na sua conta após o período de 1 mês da compra.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

