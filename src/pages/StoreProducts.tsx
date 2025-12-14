import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { produtoService, Produto, ProdutoRequest, uploadService, apiService } from "@/services/api";
import { Combobox } from "@/components/ui/combobox";
import { CATEGORIAS_PRODUTOS } from "@/constants/categorias";
import { AlertEmpresaNaoAprovada } from "@/components/AlertEmpresaNaoAprovada";

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

const StoreProducts = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [empresaAprovada, setEmpresaAprovada] = useState<boolean>(false);
  
  // Estados do formulário
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCashback, setProductCashback] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Estados de edição
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  
  // Estados de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  const platformPercentage = 5; // Porcentagem da plataforma

  const checkEmpresaStatus = async (empresaId: string) => {
    try {
      const empresaData = await apiService.buscarEmpresaPorId(empresaId);
      setEmpresaAprovada(empresaData.statusEmpresa);
    } catch (error) {
      console.error("Erro ao verificar status da empresa:", error);
      setEmpresaAprovada(false);
    }
  };

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
        
        if (!parsedUserData.empresaId) {
          toast.error("Você precisa ter uma empresa cadastrada para gerenciar produtos.");
          navigate("/store/dashboard");
          return;
        }
        
        // Verificar status da empresa
        checkEmpresaStatus(parsedUserData.empresaId);
        
        loadProducts(parsedUserData.empresaId);
      } catch (error) {
        console.error("Erro ao parsear dados do usuário:", error);
        toast.error("Erro nos dados da sessão. Faça login novamente.");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadProducts = async (empresaId: string) => {
    try {
      setIsLoading(true);
      const produtos = await produtoService.listarProdutosPorEmpresa(empresaId);
      setProducts(produtos);
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      toast.error(error.message || "Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar preview quando productImage mudar
  useEffect(() => {
    if (productImage) {
      const url = URL.createObjectURL(productImage);
      setImagePreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreview(null);
    }
  }, [productImage]);

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCashback("");
    setProductCategory("");
    setProductStock("");
    setProductImage(null);
    setImagePreview(null);
    setFotoUrl("");
    setStartDate("");
    setEndDate("");
    setUploadingImage(false);
  };

  const handleCreateProduct = async () => {
    if (!userData?.empresaId) {
      toast.error("Empresa não encontrada");
      return;
    }

    if (!productName.trim() || !productPrice.trim() || !productStock.trim()) {
      toast.error("Preencha pelo menos o nome, preço e quantidade em estoque");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Fazer upload da imagem se houver arquivo selecionado
      let imageUrl = fotoUrl;
      if (productImage) {
        try {
          imageUrl = await uploadService.uploadProdutoImagem(productImage);
          toast.success("Imagem enviada com sucesso!");
        } catch (uploadError: any) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          toast.error(uploadError.message || "Erro ao fazer upload da imagem");
          setUploadingImage(false);
          return;
        }
      }

      // O productPrice já é o valor final (o que o cliente paga)
      const valorFinal = parseFloat(productPrice.replace(",", "."));
      const cashbackPercent = productCashback ? parseFloat(productCashback.replace(",", ".")) : 0;
      const quantidadeEstoque = parseInt(productStock);

      const produtoData: ProdutoRequest = {
        empresaId: userData.empresaId,
        nomeProduto: productName.trim(),
        descricaoProduto: productDescription.trim() || undefined,
        precoProduto: valorFinal, // Valor final (o que o cliente paga)
        prcntCashback: cashbackPercent,
        categoria: productCategory.trim() || undefined,
        quantidadeEstoque: quantidadeEstoque,
        fotoUrl: imageUrl || undefined,
        status: true,
        dtInicio: startDate ? new Date(startDate).toISOString() : undefined,
        dtFim: endDate ? new Date(endDate).toISOString() : undefined,
      };

      await produtoService.criarProduto(produtoData);
      toast.success("Produto cadastrado com sucesso!");
      resetForm();
      setCreateDialogOpen(false);
      loadProducts(userData.empresaId);
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      toast.error(error.message || "Erro ao cadastrar produto");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditClick = (product: Produto) => {
    setEditingProduct(product);
    setProductName(product.nomeProduto);
    setProductDescription(product.descricaoProduto || "");
    
    // O precoProduto já é o valor final (o que o cliente paga)
    setProductPrice(product.precoProduto.toString());
    setProductCashback(product.prcntCashback?.toString() || "");
    setProductCategory(product.categoria || "");
    setProductStock(product.quantidadeEstoque?.toString() || "0");
    setFotoUrl(product.fotoUrl || "");
    setProductImage(null); // Limpar arquivo selecionado ao editar
    setImagePreview(null); // Limpar preview ao editar
    setStartDate(product.dtInicio ? new Date(product.dtInicio).toISOString().split('T')[0] : "");
    setEndDate(product.dtFim ? new Date(product.dtFim).toISOString().split('T')[0] : "");
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !userData?.empresaId) {
      toast.error("Dados inválidos");
      return;
    }

    if (!productName.trim() || !productPrice.trim() || !productStock.trim()) {
      toast.error("Preencha pelo menos o nome, preço e quantidade em estoque");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Fazer upload da imagem se houver arquivo selecionado
      let imageUrl = fotoUrl;
      if (productImage) {
        try {
          imageUrl = await uploadService.uploadProdutoImagem(productImage);
          toast.success("Imagem enviada com sucesso!");
        } catch (uploadError: any) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          toast.error(uploadError.message || "Erro ao fazer upload da imagem");
          setUploadingImage(false);
          return;
        }
      }

      // O productPrice já é o valor final (o que o cliente paga)
      const valorFinal = parseFloat(productPrice.replace(",", "."));
      const cashbackPercent = productCashback ? parseFloat(productCashback.replace(",", ".")) : 0;
      const quantidadeEstoque = parseInt(productStock);

      const produtoData: ProdutoRequest = {
        empresaId: userData.empresaId,
        nomeProduto: productName.trim(),
        descricaoProduto: productDescription.trim() || undefined,
        precoProduto: valorFinal, // Valor final (o que o cliente paga)
        prcntCashback: cashbackPercent,
        categoria: productCategory.trim() || undefined,
        quantidadeEstoque: quantidadeEstoque,
        fotoUrl: imageUrl || undefined,
        status: editingProduct.status,
        dtInicio: startDate ? new Date(startDate).toISOString() : undefined,
        dtFim: endDate ? new Date(endDate).toISOString() : undefined,
      };

      await produtoService.atualizarProduto(editingProduct.id, produtoData);
      toast.success("Produto atualizado com sucesso!");
      resetForm();
      setEditDialogOpen(false);
      setEditingProduct(null);
      loadProducts(userData.empresaId);
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error);
      toast.error(error.message || "Erro ao atualizar produto");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingProductId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProductId || !userData?.empresaId) return;

    try {
      await produtoService.deletarProduto(deletingProductId);
      toast.success("Produto removido com sucesso!");
      setDeleteDialogOpen(false);
      setDeletingProductId(null);
      loadProducts(userData.empresaId);
    } catch (error: any) {
      console.error("Erro ao deletar produto:", error);
      toast.error(error.message || "Erro ao remover produto");
    }
  };

  const handleToggleStatus = async (product: Produto) => {
    try {
      await produtoService.alterarStatusProduto(product.id, !product.status);
      toast.success(`Produto ${!product.status ? 'ativado' : 'desativado'} com sucesso!`);
      if (userData?.empresaId) {
        loadProducts(userData.empresaId);
      }
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      toast.error(error.message || "Erro ao alterar status do produto");
    }
  };

  // Calcula valores do cashback
  // productPrice é o valor final que o cliente paga
  // Cashback de 10% é INTEIRO para o cliente
  // Taxa da plataforma de 5% é COBRADA SEPARADAMENTE do cashback
  const calculateCashbackValues = () => {
    const valorFinal = parseFloat(productPrice.replace(",", ".")) || 0; // Valor que o cliente paga
    const cashback = parseFloat(productCashback.replace(",", ".")) || 0;
    const cashbackAmount = valorFinal * cashback / 100; // Cashback total (vai inteiro para o cliente)
    const platformAmount = valorFinal * platformPercentage / 100; // Taxa da plataforma (cobrada separadamente)
    const clientAmount = cashbackAmount; // Cliente recebe TODO o cashback
    return {
      cashbackAmount,
      platformAmount,
      clientAmount,
      finalPrice: valorFinal,
      isValid: valorFinal > 0 && cashback > 0
    };
  };

  const cashbackValues = calculateCashbackValues();
  const filteredProducts = products.filter(p => 
    p.nomeProduto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.descricaoProduto && p.descricaoProduto.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="store" />

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
            <div className="flex gap-2">
              <Button onClick={() => navigate("/store/dashboard")} variant="outline" className="gap-2">
                Voltar ao Dashboard
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="hero" 
                    className="gap-2" 
                    onClick={() => resetForm()}
                    disabled={!empresaAprovada}
                  >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Produto</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo produto ou serviço
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Nome do Produto *</Label>
                      <Input 
                        id="productName" 
                        placeholder="Ex: Café Especial" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Valor Final - Preço que o Cliente Paga (R$) *</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          step="0.01" 
                          placeholder="0,00" 
                          value={productPrice} 
                          onChange={(e) => setProductPrice(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cashback">Cashback (%)</Label>
                        <Input 
                          id="cashback" 
                          type="number" 
                          step="0.01"
                          placeholder="15" 
                          value={productCashback} 
                          onChange={(e) => setProductCashback(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantidade em Estoque *</Label>
                      <Input 
                        id="stock" 
                        type="number" 
                        min="0"
                        step="1"
                        placeholder="100" 
                        value={productStock} 
                        onChange={(e) => setProductStock(e.target.value)} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Quantidade de unidades disponíveis para venda
                      </p>
                    </div>
                    
                    {/* Cálculo do cashback */}
                    {cashbackValues.isValid && (
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Valor Final (Cliente paga):</span>
                          <span className="font-medium">R$ {parseFloat(productPrice.replace(",", ".")).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cashback para o Cliente ({productCashback}%):</span>
                          <span className="font-medium text-[#00ea7c]">R$ {cashbackValues.clientAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border pt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Taxa da Plataforma ({platformPercentage}% cobrada separadamente):</span>
                            <span>R$ {cashbackValues.platformAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input 
                        id="description" 
                        placeholder="Descrição do produto" 
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Combobox
                        options={CATEGORIAS_PRODUTOS}
                        value={productCategory}
                        onValueChange={(value) => setProductCategory(value)}
                        placeholder="Selecione uma categoria"
                        searchPlaceholder="Buscar categoria..."
                        emptyMessage="Nenhuma categoria encontrada."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productImage">Imagem do Produto</Label>
                      <Input 
                        id="productImage" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProductImage(file);
                          }
                        }}
                      />
                      {productImage && imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-lg" 
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {productImage.name} - A imagem será enviada ao salvar o produto
                          </p>
                        </div>
                      )}
                      {fotoUrl && !productImage && (
                        <div className="mt-2">
                          <img src={fotoUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                          <p className="text-xs text-muted-foreground mt-1">Imagem atual do produto</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Selecione uma imagem ou cole uma URL abaixo. A imagem será enviada ao salvar o produto.
                      </p>
                      <Input 
                        id="fotoUrl" 
                        placeholder="Ou cole aqui a URL da imagem" 
                        value={fotoUrl}
                        onChange={(e) => {
                          setFotoUrl(e.target.value);
                          setProductImage(null); // Limpar arquivo se usar URL
                        }}
                      />
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
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateProduct}>
                      Cadastrar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Alerta de empresa não aprovada */}
          {!empresaAprovada && (
            <AlertEmpresaNaoAprovada 
              title="Gerenciamento de Produtos Bloqueado"
              message="O cadastro e gerenciamento de produtos estará disponível após a aprovação da sua empresa. Aguarde a análise do nosso time ou entre em contato com o suporte."
              className="mb-6"
            />
          )}

          {/* Search */}
          <Card className={`shadow-soft mb-6 ${!empresaAprovada ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className={`shadow-soft ${!empresaAprovada ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
              <CardDescription>
                {filteredProducts.length} produto(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum produto encontrado</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center bg-[#00ea7c]">
                          {product.fotoUrl ? (
                            <img src={product.fotoUrl} alt={product.nomeProduto} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{product.nomeProduto}</p>
                            <Badge variant={product.status ? "default" : "secondary"}>
                              {product.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          {product.descricaoProduto && (
                            <p className="text-sm text-muted-foreground mb-1">{product.descricaoProduto}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {product.dtInicio && product.dtFim && (
                              <>
                                <span>Válido de {new Date(product.dtInicio).toLocaleDateString('pt-BR')} até {new Date(product.dtFim).toLocaleDateString('pt-BR')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-lg">R$ {product.precoProduto.toFixed(2)}</p>
                          <div className="flex flex-col gap-1 mt-1">
                            {product.prcntCashback && product.prcntCashback > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {product.prcntCashback}% cashback
                              </Badge>
                            )}
                            <Badge 
                              variant={
                                product.quantidadeEstoque === 0 ? "destructive" :
                                product.quantidadeEstoque <= 10 ? "secondary" :
                                "default"
                              }
                              className="text-xs"
                            >
                              {product.quantidadeEstoque === 0 ? "Sem estoque" : 
                               product.quantidadeEstoque === 1 ? "1 unidade" :
                               `${product.quantidadeEstoque} unidades`}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleToggleStatus(product)}
                            title={product.status ? "Desativar" : "Ativar"}
                            disabled={!empresaAprovada}
                          >
                            {product.status ? "✓" : "✗"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEditClick(product)}
                            disabled={!empresaAprovada}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDeleteClick(product.id)} 
                            className="text-neutral-900 font-light bg-[#f4efea]"
                            disabled={!empresaAprovada}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Product Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
                <DialogDescription>
                  Altere os dados do produto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editProductName">Nome do Produto *</Label>
                  <Input 
                    id="editProductName" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPrice">Valor Final - Preço que o Cliente Paga (R$) *</Label>
                    <Input 
                      id="editPrice" 
                      type="number" 
                      step="0.01" 
                      value={productPrice} 
                      onChange={(e) => setProductPrice(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCashback">Cashback (%)</Label>
                    <Input 
                      id="editCashback" 
                      type="number" 
                      step="0.01"
                      value={productCashback} 
                      onChange={(e) => setProductCashback(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editStock">Quantidade em Estoque *</Label>
                  <Input 
                    id="editStock" 
                    type="number" 
                    min="0"
                    step="1"
                    value={productStock} 
                    onChange={(e) => setProductStock(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade de unidades disponíveis para venda
                  </p>
                </div>
                
                {cashbackValues.isValid && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor Final (Cliente paga):</span>
                      <span className="font-medium">R$ {parseFloat(productPrice.replace(",", ".")).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cashback para o Cliente ({productCashback}%):</span>
                      <span className="font-medium text-[#00ea7c]">R$ {cashbackValues.clientAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Taxa da Plataforma ({platformPercentage}% cobrada separadamente):</span>
                        <span>R$ {cashbackValues.platformAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Descrição</Label>
                  <Input 
                    id="editDescription" 
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCategory">Categoria</Label>
                  <Combobox
                    options={CATEGORIAS_PRODUTOS}
                    value={productCategory}
                    onValueChange={(value) => setProductCategory(value)}
                    placeholder="Selecione uma categoria"
                    searchPlaceholder="Buscar categoria..."
                    emptyMessage="Nenhuma categoria encontrada."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editProductImage">Imagem do Produto</Label>
                  <Input 
                    id="editProductImage" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProductImage(file);
                        // Criar preview local sem fazer upload
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {productImage && imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {productImage.name} - A imagem será enviada ao salvar as alterações
                      </p>
                    </div>
                  )}
                  {fotoUrl && !productImage && (
                    <div className="mt-2">
                      <img src={fotoUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                      <p className="text-xs text-muted-foreground mt-1">Imagem atual do produto</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Selecione uma imagem ou cole uma URL abaixo. A imagem será enviada ao salvar as alterações.
                  </p>
                  <Input 
                    id="editFotoUrl" 
                    placeholder="Ou cole aqui a URL da imagem" 
                    value={fotoUrl}
                    onChange={(e) => {
                      setFotoUrl(e.target.value);
                      setProductImage(null); // Limpar arquivo se usar URL
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Período da Promoção</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStartDate" className="text-xs text-muted-foreground">Data Início</Label>
                      <Input 
                        id="editStartDate" 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEndDate" className="text-xs text-muted-foreground">Data Fim</Label>
                      <Input 
                        id="editEndDate" 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setEditDialogOpen(false);
                  resetForm();
                  setEditingProduct(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProduct}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O produto será permanentemente removido do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StoreProducts;
