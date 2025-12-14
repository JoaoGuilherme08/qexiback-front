import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, TrendingUp, ShoppingBag, Coffee, Utensils, Laptop, Copy, MessageCircle, Package, Store } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { produtoService, Produto, apiService, Empresa } from "@/services/api";
import { CATEGORIAS_PRODUTOS } from "@/constants/categorias";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Produto | null>(null);
  
  // Estados para produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosMaiorCashback, setProdutosMaiorCashback] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [produtosPorCategoria, setProdutosPorCategoria] = useState<Record<string, Produto[]>>({});
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasEncontradas, setEmpresasEncontradas] = useState<Empresa[]>([]);
  const [isSearchingEmpresas, setIsSearchingEmpresas] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("destaques");
  const [empresaFiltro, setEmpresaFiltro] = useState<string | null>(null);

  // Ícones por categoria
  const categoriaIcons: Record<string, any> = {
    "Alimentação": Coffee,
    "Bebidas": Coffee,
    "Tecnologia": Laptop,
    "Eletrônicos": Laptop,
    "Moda": ShoppingBag,
    "Roupas": ShoppingBag,
    "Calçados": ShoppingBag,
    "Acessórios": ShoppingBag,
    "Casa e Decoração": Package,
    "Móveis": Package,
    "Beleza e Cuidados Pessoais": Package,
    "Saúde e Bem-estar": Package,
    "Esportes e Lazer": Package,
    "Livros e Mídia": Package,
    "Brinquedos e Games": Package,
    "Automotivo": Package,
    "Pet Shop": Package,
    "Restaurante": Utensils,
    "Fast Food": Utensils,
    "Padaria e Confeitaria": Utensils,
    "Farmácia": Package,
    "Supermercado": ShoppingBag,
    "Serviços": Package,
    "Educação": Package,
    "Entretenimento": Package,
    "Viagens e Turismo": Package,
    "Outros": Package,
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      // Carregar produtos ativos
      const produtosAtivos = await produtoService.listarProdutosAtivos();
      setProdutos(produtosAtivos);
      
      // Carregar produtos com maior cashback (top 8)
      const produtosCashback = await produtoService.listarProdutosComMaiorCashback(8);
      setProdutosMaiorCashback(produtosCashback);
      
      // Carregar categorias
      const categoriasList = await produtoService.listarCategorias();
      setCategorias(categoriasList);
      
      // Carregar produtos por categoria
      const produtosPorCat: Record<string, Produto[]> = {};
      for (const categoria of categoriasList) {
        const produtos = await produtoService.listarProdutosPorCategoria(categoria);
        produtosPorCat[categoria] = produtos;
      }
      setProdutosPorCategoria(produtosPorCat);
      
      // Carregar empresas ativas
      try {
        const empresasAtivas = await apiService.listarTodasEmpresasAtivas();
        setEmpresas(empresasAtivas);
      } catch (error: any) {
        console.error("Erro ao carregar empresas:", error);
        // Não bloquear a página se houver erro ao carregar empresas
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = (produto: Produto) => {
    setSelectedOffer(produto);
    setPurchaseDialogOpen(true);
  };

  const generatePickupCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const pickupCode = selectedOffer ? generatePickupCode() : "";
  const productPrice = selectedOffer ? Number(selectedOffer.precoProduto) : 0;
  const cashbackAmount = selectedOffer 
    ? productPrice * (Number(selectedOffer.prcntCashback) || 0) / 100 
    : 0;
  const pixCode = selectedOffer 
    ? `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 38)}52040000530398654${productPrice.toFixed(2)}5802BR5925LOJA ${selectedOffer.nomeProduto.toUpperCase()}6009SAO PAULO62070503***6304` 
    : "";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`
    });
  };

  const contactWhatsApp = () => {
    if (selectedOffer && selectedOffer.nomeFantasiaEmpresa) {
      const message = `Olá! Gostaria de mais informações sobre o produto: ${selectedOffer.nomeProduto}. Código de retirada: ${pickupCode}`;
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const getCategoriaIcon = (categoria?: string) => {
    if (!categoria) return Package;
    return categoriaIcons[categoria] || Package;
  };

  // Buscar empresas quando houver query de busca
  useEffect(() => {
    const buscarEmpresas = async () => {
      if (searchQuery && searchQuery.length >= 2) {
        try {
          setIsSearchingEmpresas(true);
          const empresasEncontradas = await apiService.buscarEmpresasPorNome(searchQuery);
          setEmpresasEncontradas(empresasEncontradas);
          
          // Se encontrar exatamente uma empresa e não houver filtro ativo, aplicar filtro automaticamente
          if (empresasEncontradas.length === 1 && !empresaFiltro) {
            // Verificar se a busca corresponde exatamente ao nome da empresa
            const empresaEncontrada = empresasEncontradas[0];
            const queryLower = searchQuery.toLowerCase().trim();
            const nomeEmpresaLower = empresaEncontrada.nomeFantasia.toLowerCase();
            
            // Se a busca corresponder exatamente ou começar com o nome da empresa
            if (nomeEmpresaLower === queryLower || nomeEmpresaLower.startsWith(queryLower)) {
              setEmpresaFiltro(empresaEncontrada.id);
              setAbaAtiva("destaques");
              toast({
                title: "Empresa encontrada",
                description: `Mostrando produtos de ${empresaEncontrada.nomeFantasia}`,
              });
            }
          }
        } catch (error: any) {
          console.error("Erro ao buscar empresas:", error);
          setEmpresasEncontradas([]);
        } finally {
          setIsSearchingEmpresas(false);
        }
      } else {
        setEmpresasEncontradas([]);
        // Se a busca for limpa e houver filtro de empresa, manter o filtro
        // (não limpar automaticamente)
      }
    };

    const timeoutId = setTimeout(buscarEmpresas, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Função helper para aplicar filtros
  const aplicarFiltros = (listaProdutos: Produto[]) => {
    let produtosFiltrados = [...listaProdutos];
    
    // Filtrar por empresa se houver filtro de empresa
    if (empresaFiltro) {
      produtosFiltrados = produtosFiltrados.filter(p => p.empresaId === empresaFiltro);
    }
    
    // Filtrar por query de busca
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      produtosFiltrados = produtosFiltrados.filter(p => {
        // Buscar no nome do produto
        if (p.nomeProduto.toLowerCase().includes(queryLower)) return true;
        // Buscar na descrição do produto
        if (p.descricaoProduto?.toLowerCase().includes(queryLower)) return true;
        // Buscar na categoria
        if (p.categoria?.toLowerCase().includes(queryLower)) return true;
        // Buscar no nome da empresa
        if (p.nomeFantasiaEmpresa?.toLowerCase().includes(queryLower)) return true;
        
        // Se houver filtro de empresa ativo, também buscar empresas encontradas
        if (empresaFiltro) {
          const empresaSelecionada = empresas.find(e => e.id === empresaFiltro) || 
                                     empresasEncontradas.find(e => e.id === empresaFiltro);
          if (empresaSelecionada) {
            // Se a busca corresponder ao nome da empresa, incluir todos os produtos
            if (empresaSelecionada.nomeFantasia.toLowerCase().includes(queryLower)) {
              return true;
            }
          }
        }
        
        return false;
      });
    }
    
    return produtosFiltrados;
  };

  const produtosFiltrados = aplicarFiltros(produtos);
  
  // Produtos por categoria filtrados
  const produtosPorCategoriaFiltrados = (() => {
    const filtrados: Record<string, Produto[]> = {};
    Object.keys(produtosPorCategoria).forEach(categoria => {
      const produtosCategoria = aplicarFiltros(produtosPorCategoria[categoria]);
      if (produtosCategoria.length > 0) {
        filtrados[categoria] = produtosCategoria;
      }
    });
    return filtrados;
  })();
  
  // Produtos com maior cashback filtrados
  const produtosMaiorCashbackFiltrados = aplicarFiltros(produtosMaiorCashback);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="user" />

      <main className="flex-1">
        {/* Hero Search Section */}
        <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 py-16 text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-8 animate-in fade-in slide-in-from-bottom duration-700">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Descubra Ofertas com Cashback
              </h1>
              <p className="text-white/90 mb-6 text-lg">
                Milhares de produtos e serviços com os melhores percentuais de retorno
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Input 
                    placeholder="Buscar por produto, loja ou categoria..." 
                    className="pl-10 h-12 bg-white text-foreground border-2 border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-base shadow-medium" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                  />
                </div>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-medium hover:shadow-strong font-semibold"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : (
              <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
                <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 mb-8 bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger 
                    value="destaques"
                    className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
                  >
                    Ofertas em Destaque
                  </TabsTrigger>
                  <TabsTrigger 
                    value="categorias"
                    className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
                  >
                    Por Categoria
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cashback"
                    className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
                  >
                    Maior Cashback
                  </TabsTrigger>
                  <TabsTrigger 
                    value="empresas"
                    className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
                  >
                    Empresas
                  </TabsTrigger>
                </TabsList>

                {/* Seção de Categorias em Destaque */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Explore por Categoria</h2>
                  <div className="flex flex-wrap gap-3">
                          {CATEGORIAS_PRODUTOS.slice(0, 12).map((categoria) => {
                            const Icon = getCategoriaIcon(categoria);
                            const produtosCategoria = empresaFiltro 
                              ? (produtosPorCategoriaFiltrados[categoria] || [])
                              : (produtosPorCategoria[categoria] || []);
                            const hasProducts = produtosCategoria.length > 0;
                      
                      return (
                        <Button
                          key={categoria}
                          variant={hasProducts ? "default" : "outline"}
                          className={`gap-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                            hasProducts 
                              ? "bg-primary hover:bg-primary/90 shadow-soft hover:shadow-medium" 
                              : "opacity-60"
                          }`}
                          onClick={() => {
                            if (hasProducts) {
                              // Scroll para a seção de categorias e filtra
                              document.getElementById('categorias-tab')?.click();
                              setTimeout(() => {
                                const element = document.getElementById(`categoria-${categoria}`);
                                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{categoria}</span>
                          {hasProducts && (
                            <Badge variant="secondary" className="ml-1">
                              {produtosCategoria.length}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  {CATEGORIAS_PRODUTOS.length > 12 && (
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={() => {
                        document.getElementById('categorias-tab')?.click();
                      }}
                    >
                      Ver todas as categorias ({CATEGORIAS_PRODUTOS.length})
                    </Button>
                  )}
                </div>

                {/* Ofertas em Destaque */}
                <TabsContent value="destaques" className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold">Ofertas em Destaque</h2>
                      {empresaFiltro && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEmpresaFiltro(null);
                            setSearchQuery("");
                          }}
                          className="gap-2"
                        >
                          Limpar Filtro
                        </Button>
                      )}
                    </div>
                    {empresaFiltro && (() => {
                      const empresaSelecionada = empresas.find(e => e.id === empresaFiltro) || empresasEncontradas.find(e => e.id === empresaFiltro);
                      return empresaSelecionada ? (
                        <div className="mb-4 p-4 bg-[#281f56]/10 border border-[#281f56]/30 rounded-lg flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#281f56]/20">
                            <Store className="w-5 h-5 text-[#281f56]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#281f56]">
                              Visualizando produtos da empresa: <span className="font-bold">{empresaSelecionada.nomeFantasia}</span>
                            </p>
                            {empresaSelecionada.cidadeEmpresa && empresaSelecionada.estadoEmpresa && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {empresaSelecionada.cidadeEmpresa}, {empresaSelecionada.estadoEmpresa}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    <p className="text-muted-foreground mb-6">
                      {produtosFiltrados.length} oferta(s) disponível(is)
                      {empresaFiltro && " para esta empresa"}
                    </p>

                    {produtosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum produto encontrado</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {produtosFiltrados.map((produto, index) => {
                          const Icon = getCategoriaIcon(produto.categoria);
                          return (
                            <Card 
                              key={produto.id} 
                              className="overflow-hidden hover:shadow-strong transition-all duration-300 cursor-pointer group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="relative h-48 overflow-hidden" onClick={() => navigate(`/checkout/${produto.id}`)}>
                                {produto.fotoUrl ? (
                                  <img 
                                    src={produto.fotoUrl} 
                                    alt={produto.nomeProduto} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <Icon className="w-16 h-16 text-primary/50" />
                                  </div>
                                )}
                                <div className="absolute top-3 right-3 animate-in fade-in zoom-in duration-300">
                                  <Badge className="font-bold text-base px-3 py-1 text-[#f4efea] bg-[#281f56] shadow-medium">
                                    {produto.prcntCashback?.toFixed(0) || 0}% Cashback
                                  </Badge>
                                </div>
                              </div>
                              <CardHeader onClick={() => navigate(`/checkout/${produto.id}`)}>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    {produto.fotoUrl ? (
                                      <img 
                                        src={produto.fotoUrl} 
                                        alt={produto.nomeProduto} 
                                        className="w-12 h-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110" 
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                        <Icon className="w-6 h-6 text-primary" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">{produto.nomeProduto}</CardTitle>
                                      {produto.categoria && (
                                        <Badge variant="outline" className="mt-1 text-xs">
                                          {produto.categoria}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {produto.nomeFantasiaEmpresa && (
                                    <CardDescription className="flex items-start gap-1 text-sm">
                                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span>{produto.nomeFantasiaEmpresa}</span>
                                    </CardDescription>
                                  )}
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Valor</p>
                                      <p className="text-lg font-bold">R$ {Number(produto.precoProduto).toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Cashback</p>
                                      <p className="text-lg font-bold text-[#00ea7c]">
                                        {produto.prcntCashback?.toFixed(0) || 0}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent onClick={() => navigate(`/checkout/${produto.id}`)}>
                                {produto.descricaoProduto && (
                                  <p className="text-sm text-muted-foreground">{produto.descricaoProduto}</p>
                                )}
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/checkout/${produto.id}`);
                                  }} 
                                  className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium"
                                >
                                  Comprar
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Por Categoria */}
                <TabsContent value="categorias" id="categorias-tab" className="space-y-8">
                  {empresaFiltro && (() => {
                    const empresaSelecionada = empresas.find(e => e.id === empresaFiltro) || empresasEncontradas.find(e => e.id === empresaFiltro);
                    return empresaSelecionada ? (
                      <div className="mb-6 p-4 bg-[#281f56]/10 border border-[#281f56]/30 rounded-lg flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#281f56]/20">
                          <Store className="w-5 h-5 text-[#281f56]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#281f56]">
                            Visualizando produtos da empresa: <span className="font-bold">{empresaSelecionada.nomeFantasia}</span>
                          </p>
                          {empresaSelecionada.cidadeEmpresa && empresaSelecionada.estadoEmpresa && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {empresaSelecionada.cidadeEmpresa}, {empresaSelecionada.estadoEmpresa}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEmpresaFiltro(null);
                            setSearchQuery("");
                          }}
                          className="gap-2"
                        >
                          Limpar Filtro
                        </Button>
                      </div>
                    ) : null;
                  })()}
                  {Object.keys(produtosPorCategoriaFiltrados).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {empresaFiltro ? "Nenhuma categoria com produtos disponível para esta empresa" : "Nenhuma categoria com produtos disponível"}
                      </p>
                    </div>
                  ) : (
                    CATEGORIAS_PRODUTOS.filter(categoria => {
                      const produtosCategoria = produtosPorCategoriaFiltrados[categoria] || [];
                      return produtosCategoria.length > 0;
                    }).map(categoria => {
                      const produtosCategoria = produtosPorCategoriaFiltrados[categoria] || [];
                      const Icon = getCategoriaIcon(categoria);
                      
                      return (
                        <div key={categoria} id={`categoria-${categoria}`} className="space-y-4 scroll-mt-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">{categoria}</h2>
                            <Badge variant="secondary" className="ml-auto">{produtosCategoria.length} produtos</Badge>
                          </div>
                          
                          {produtosCategoria.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                              Nenhum produto disponível nesta categoria
                            </p>
                          ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {produtosCategoria.map((produto, index) => (
                                <Card 
                                  key={produto.id} 
                                  className="overflow-hidden hover:shadow-strong transition-all duration-300 cursor-pointer group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom"
                                  style={{ animationDelay: `${index * 50}ms` }}
                                >
                                  <div className="relative h-48 overflow-hidden" onClick={() => navigate(`/checkout/${produto.id}`)}>
                                    {produto.fotoUrl ? (
                                      <img 
                                        src={produto.fotoUrl} 
                                        alt={produto.nomeProduto} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        <Icon className="w-16 h-16 text-primary/50" />
                                      </div>
                                    )}
                                    <div className="absolute top-3 right-3 animate-in fade-in zoom-in duration-300">
                                      <Badge className="font-bold text-base px-3 py-1 text-[#f4efea] bg-[#281f56] shadow-medium">
                                        {produto.prcntCashback?.toFixed(0) || 0}% Cashback
                                      </Badge>
                                    </div>
                                  </div>
                                  <CardHeader onClick={() => navigate(`/checkout/${produto.id}`)}>
                                    <CardTitle className="text-lg">{produto.nomeProduto}</CardTitle>
                                    {produto.descricaoProduto && (
                                      <CardDescription>{produto.descricaoProduto}</CardDescription>
                                    )}
                                  </CardHeader>
                                  <CardContent onClick={() => navigate(`/checkout/${produto.id}`)}>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Valor</p>
                                        <p className="text-lg font-bold">R$ {Number(produto.precoProduto).toFixed(2)}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Cashback</p>
                                        <p className="text-lg font-bold text-[#00ea7c]">
                                          {produto.prcntCashback?.toFixed(0) || 0}%
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                  <CardFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={e => {
                                        e.stopPropagation();
                                        navigate(`/checkout/${produto.id}`);
                                      }} 
                                      className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium"
                                    >
                                      Comprar
                                    </Button>
                                  </CardFooter>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </TabsContent>

                {/* Maior Cashback */}
                <TabsContent value="cashback" className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold">Ofertas com Maior Cashback</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Os produtos com os melhores percentuais de retorno
                    </p>

                    {produtosMaiorCashbackFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Nenhum produto encontrado</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {produtosMaiorCashbackFiltrados.map((produto, index) => {
                          const Icon = getCategoriaIcon(produto.categoria);
                          return (
                            <Card 
                              key={produto.id} 
                              className="overflow-hidden hover:shadow-strong transition-all duration-300 cursor-pointer group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="relative h-48 overflow-hidden" onClick={() => navigate(`/checkout/${produto.id}`)}>
                                {produto.fotoUrl ? (
                                  <img 
                                    src={produto.fotoUrl} 
                                    alt={produto.nomeProduto} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <Icon className="w-16 h-16 text-primary/50" />
                                  </div>
                                )}
                                <div className="absolute top-3 right-3 animate-in fade-in zoom-in duration-300">
                                  <Badge className="font-bold text-base px-3 py-1 text-[#f4efea] bg-[#281f56] shadow-medium">
                                    {produto.prcntCashback?.toFixed(0) || 0}% Cashback
                                  </Badge>
                                </div>
                              </div>
                              <CardHeader onClick={() => navigate(`/checkout/${produto.id}`)}>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    {produto.fotoUrl ? (
                                      <img 
                                        src={produto.fotoUrl} 
                                        alt={produto.nomeProduto} 
                                        className="w-12 h-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110" 
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                        <Icon className="w-6 h-6 text-primary" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">{produto.nomeProduto}</CardTitle>
                                      {produto.categoria && (
                                        <Badge variant="outline" className="mt-1 text-xs">
                                          {produto.categoria}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {produto.nomeFantasiaEmpresa && (
                                    <CardDescription className="flex items-start gap-1 text-sm">
                                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span>{produto.nomeFantasiaEmpresa}</span>
                                    </CardDescription>
                                  )}
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Valor</p>
                                      <p className="text-lg font-bold">R$ {Number(produto.precoProduto).toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Cashback</p>
                                      <p className="text-lg font-bold text-[#00ea7c]">
                                        {produto.prcntCashback?.toFixed(0) || 0}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent onClick={() => navigate(`/checkout/${produto.id}`)}>
                                {produto.descricaoProduto && (
                                  <p className="text-sm text-muted-foreground">{produto.descricaoProduto}</p>
                                )}
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/checkout/${produto.id}`);
                                  }} 
                                  className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium"
                                >
                                  Comprar
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Empresas */}
                <TabsContent value="empresas" className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Store className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold">Empresas Parceiras</h2>
                    </div>
                    
                    {searchQuery && (
                      <div className="mb-6">
                        <p className="text-muted-foreground mb-4">
                          {isSearchingEmpresas 
                            ? "Buscando empresas..." 
                            : empresasEncontradas.length > 0
                            ? `${empresasEncontradas.length} empresa(s) encontrada(s) para "${searchQuery}"`
                            : `Nenhuma empresa encontrada para "${searchQuery}"`}
                        </p>
                      </div>
                    )}

                    {searchQuery ? (
                      // Mostrar empresas encontradas na busca
                      empresasEncontradas.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {empresasEncontradas.map((empresa) => (
                            <Card 
                              key={empresa.id} 
                              className="overflow-hidden hover:shadow-strong transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                            >
                              <CardHeader>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <Store className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                                      {empresa.nomeFantasia}
                                    </CardTitle>
                                    {empresa.cidadeEmpresa && empresa.estadoEmpresa && (
                                      <CardDescription className="flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{empresa.cidadeEmpresa}, {empresa.estadoEmpresa}</span>
                                      </CardDescription>
                                    )}
                                  </div>
                                </div>
                                {empresa.descricaoEmpresa && (
                                  <CardDescription className="line-clamp-2">
                                    {empresa.descricaoEmpresa}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {empresa.enderecoEmpresa && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {empresa.enderecoEmpresa}
                                    </p>
                                  )}
                                  {empresa.telefone && (
                                    <p className="text-sm text-muted-foreground">📞 {empresa.telefone}</p>
                                  )}
                                  {empresa.email && (
                                    <p className="text-sm text-muted-foreground">✉️ {empresa.email}</p>
                                  )}
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button
                                  onClick={() => {
                                    // Verificar se a empresa tem produtos
                                    const produtosEmpresa = produtos.filter(p => p.empresaId === empresa.id);
                                    if (produtosEmpresa.length > 0) {
                                      // Definir filtro de empresa e mudar para aba de ofertas
                                      setEmpresaFiltro(empresa.id);
                                      setSearchQuery(""); // Limpar busca para mostrar todos os produtos da empresa
                                      setAbaAtiva("destaques");
                                      // Scroll para o topo da página após a mudança de aba
                                      setTimeout(() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }, 200);
                                    } else {
                                      toast({
                                        title: "Sem produtos",
                                        description: "Esta empresa ainda não possui produtos cadastrados.",
                                      });
                                    }
                                  }}
                                  className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium"
                                >
                                  Ver Produtos
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      // Mostrar todas as empresas ativas
                      empresas.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Carregando empresas...</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {empresas.map((empresa) => (
                            <Card 
                              key={empresa.id} 
                              className="overflow-hidden hover:shadow-strong transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                            >
                              <CardHeader>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <Store className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                                      {empresa.nomeFantasia}
                                    </CardTitle>
                                    {empresa.cidadeEmpresa && empresa.estadoEmpresa && (
                                      <CardDescription className="flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{empresa.cidadeEmpresa}, {empresa.estadoEmpresa}</span>
                                      </CardDescription>
                                    )}
                                  </div>
                                </div>
                                {empresa.descricaoEmpresa && (
                                  <CardDescription className="line-clamp-2">
                                    {empresa.descricaoEmpresa}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {empresa.enderecoEmpresa && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {empresa.enderecoEmpresa}
                                    </p>
                                  )}
                                  {empresa.telefone && (
                                    <p className="text-sm text-muted-foreground">📞 {empresa.telefone}</p>
                                  )}
                                  {empresa.email && (
                                    <p className="text-sm text-muted-foreground">✉️ {empresa.email}</p>
                                  )}
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button
                                  onClick={() => {
                                    // Verificar se a empresa tem produtos
                                    const produtosEmpresa = produtos.filter(p => p.empresaId === empresa.id);
                                    if (produtosEmpresa.length > 0) {
                                      // Definir filtro de empresa e mudar para aba de ofertas
                                      setEmpresaFiltro(empresa.id);
                                      setSearchQuery(""); // Limpar busca para mostrar todos os produtos da empresa
                                      setAbaAtiva("destaques");
                                      // Scroll para o topo da página após a mudança de aba
                                      setTimeout(() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }, 200);
                                    } else {
                                      toast({
                                        title: "Sem produtos",
                                        description: "Esta empresa ainda não possui produtos cadastrados.",
                                      });
                                    }
                                  }}
                                  className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium"
                                >
                                  Ver Produtos
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
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
                <h3 className="font-semibold mb-2">{selectedOffer.nomeProduto}</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Valor do Produto:</span>
                  <span className="font-bold">R$ {productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span className="text-[#00ea7c]">Cashback ({selectedOffer.prcntCashback?.toFixed(0) || 0}%):</span>
                  <span className="font-bold text-[#00ea7c]">R$ {cashbackAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border">
                <QRCodeSVG value={pixCode} size={200} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-[#00EA7C] text-[#F4EFEA] hover:bg-[#281F56] border-none active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium" 
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
                    className="active:scale-95 transition-all duration-200 hover:bg-muted"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Apresente este código na loja física para retirar seu produto
                </p>
              </div>

              {/* WhatsApp Contact */}
              {selectedOffer.nomeFantasiaEmpresa && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 active:scale-95 transition-all duration-200 font-semibold shadow-soft hover:shadow-medium" 
                  onClick={contactWhatsApp}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contatar Loja via WhatsApp
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Home;
