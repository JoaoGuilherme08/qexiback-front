import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Copy, MessageCircle, CheckCircle2, Loader2, AlertTriangle, AlertCircle, CheckCircle, XCircle, Package } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { produtoService, Produto, apiService, transacaoService, Transacao } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      carregarProduto(id);
      carregarUsuarioId();
    }
  }, [id]);

  const carregarUsuarioId = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await apiService.validateToken(token);
      if (response.data && response.data.userId) {
        setUsuarioId(response.data.userId);
      }
    } catch (error: any) {
      console.error("Erro ao carregar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  const carregarProduto = async (produtoId: string) => {
    try {
      setIsLoading(true);
      const produtoData = await produtoService.buscarProdutoPorId(produtoId);
      setProduto(produtoData);
    } catch (error: any) {
      console.error("Erro ao carregar produto:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produto",
        variant: "destructive",
      });
      navigate("/home");
    } finally {
      setIsLoading(false);
    }
  };

  const productPrice = produto ? Number(produto.precoProduto) : 0;
  const cashbackAmount = produto 
    ? productPrice * (Number(produto.prcntCashback) || 0) / 100 
    : 0;
  
  const pixCode = transacao?.pixCode || "";
  const pixQrcode = transacao?.pixQrcode || "";
  // Código de retirada já vem formatado como 8 caracteres alfanuméricos
  const pickupCode = transacao?.codigoRetirada?.toUpperCase() || "";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`
    });
  };

  const contactWhatsApp = () => {
    if (produto && produto.nomeFantasiaEmpresa && transacao) {
      const codigoCompleto = transacao.codigoRetirada;
      const message = `Olá! Gostaria de mais informações sobre o produto: ${produto.nomeProduto}. Código de retirada: ${codigoCompleto}`;
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleFinalizarCompra = async () => {
    if (!produto || !usuarioId) {
      toast({
        title: "Erro",
        description: "Dados incompletos para finalizar a compra",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingTransaction(true);
      
      // Criar transação
      const transacaoCriada = await transacaoService.criarTransacao({
        produtoId: produto.id,
        usuarioId: usuarioId
      });
      
      setTransacao(transacaoCriada);
      
      toast({
        title: "Transação criada",
        description: "Agora você pode pagar via PIX",
      });
      
    } catch (error: any) {
      console.error("Erro ao criar transação:", error);
      toast({
        title: "Erro ao finalizar compra",
        description: error.message || "Não foi possível criar a transação",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!transacao) {
      toast({
        title: "Erro",
        description: "Transação não encontrada",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConfirmingPayment(true);
      
      // Confirmar pagamento
      const transacaoConfirmada = await transacaoService.confirmarPagamento(transacao.id);
      setTransacao(transacaoConfirmada);
      
      toast({
        title: "Pagamento confirmado!",
        description: `Cashback de R$ ${Number(transacaoConfirmada.valorCashback).toFixed(2)} será creditado em 30 dias`,
      });
      
      setSuccessDialogOpen(true);
      
    } catch (error: any) {
      console.error("Erro ao confirmar pagamento:", error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: error.message || "Não foi possível confirmar o pagamento",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Carregando checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Produto não encontrado</CardTitle>
              <CardDescription>O produto que você está procurando não existe.</CardDescription>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="user" />

      <main className="flex-1 bg-muted/30">
        {/* Breadcrumb */}
        <div className="bg-background py-4 border-b">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/offers/${produto.id}`)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Produto
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Resumo do Pedido */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informações do Produto */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      {produto.fotoUrl ? (
                        <img
                          src={produto.fotoUrl}
                          alt={produto.nomeProduto}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{produto.nomeProduto}</h3>
                        {produto.descricaoProduto && (
                          <p className="text-sm text-muted-foreground">{produto.descricaoProduto}</p>
                        )}
                        {produto.categoria && (
                          <Badge variant="outline" className="mt-2">
                            {produto.categoria}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor do Produto:</span>
                        <span className="font-bold">R$ {productPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#00ea7c]">
                        <span>Cashback ({produto.prcntCashback?.toFixed(0) || 0}%):</span>
                        <span className="font-bold">R$ {cashbackAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Alerta de Estoque */}
                    <Card className={
                      produto.quantidadeEstoque === 0 ? "border-2 border-red-500 bg-gradient-to-br from-red-50 to-red-100" :
                      produto.quantidadeEstoque <= 5 ? "border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100" :
                      produto.quantidadeEstoque <= 10 ? "border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100" :
                      "border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100"
                    }>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-4">
                          {produto.quantidadeEstoque === 0 ? (
                            <>
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-red-900 text-base mb-1">Produto Indisponível</h4>
                                <p className="text-sm text-red-700 leading-relaxed">
                                  Este produto está temporariamente esgotado. Entre em contato com a loja para mais informações sobre disponibilidade.
                                </p>
                              </div>
                            </>
                          ) : produto.quantidadeEstoque <= 5 ? (
                            <>
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                                <AlertTriangle className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-orange-900 text-base mb-1">Estoque Crítico</h4>
                                <p className="text-sm text-orange-700 leading-relaxed">
                                  Restam apenas <span className="font-bold text-base px-2 py-0.5 bg-orange-200 rounded">{produto.quantidadeEstoque}</span> {produto.quantidadeEstoque === 1 ? 'unidade disponível' : 'unidades disponíveis'}. Finalize sua compra rapidamente para garantir o produto.
                                </p>
                              </div>
                            </>
                          ) : produto.quantidadeEstoque <= 10 ? (
                            <>
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-amber-900 text-base mb-1">Estoque Limitado</h4>
                                <p className="text-sm text-amber-700 leading-relaxed">
                                  Disponível em quantidade limitada. Atualmente temos <span className="font-bold text-base px-2 py-0.5 bg-amber-200 rounded">{produto.quantidadeEstoque}</span> unidades em estoque.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-green-900 text-base mb-1">Disponível para Entrega</h4>
                                <p className="text-sm text-green-700 leading-relaxed">
                                  Produto em estoque. <span className="font-semibold">{produto.quantidadeEstoque}</span> unidades disponíveis para compra imediata.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* Informações da Loja */}
                {produto.nomeFantasiaEmpresa && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações da Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">{produto.nomeFantasiaEmpresa}</p>
                      {produto.cnpjEmpresa && (
                        <p className="text-sm text-muted-foreground">CNPJ: {produto.cnpjEmpresa}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Pagamento */}
              <div className="space-y-6">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Pagamento</CardTitle>
                    <CardDescription>Escaneie o QR Code para pagar via Pix</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!transacao ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          Clique em "Finalizar Compra" para gerar o código PIX
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* QR Code */}
                        {pixQrcode && (
                          <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border">
                            <QRCodeSVG value={pixQrcode} size={200} />
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
                        )}
                        
                        {transacao.statusTransacao === "AGUARDANDO_PAGAMENTO" && (
                          <Button
                            onClick={handleConfirmarPagamento}
                            disabled={isConfirmingPayment}
                            className="w-full bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all duration-200 font-semibold shadow-medium hover:shadow-strong h-12"
                          >
                            {isConfirmingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Confirmando...
                              </>
                            ) : (
                              "Confirmar Pagamento"
                            )}
                          </Button>
                        )}

                        {/* Código de Retirada - após pagamento confirmado */}
                        {transacao.statusTransacao === "PAGO" && pickupCode && (
                          <div className="border-2 border-[#00ea7c] p-6 rounded-lg bg-gradient-to-br from-[#00ea7c]/10 to-[#00ea7c]/5">
                            <div className="text-center space-y-4">
                              <div className="flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[#00ea7c]" />
                                <p className="font-semibold text-lg">Código de Retirada</p>
                              </div>
                              
                              {/* QR Code do Código de Retirada */}
                              <div className="bg-white p-4 rounded-lg inline-block">
                                <QRCodeSVG value={transacao.codigoRetirada} size={180} />
                              </div>
                              
                              {/* Código em texto */}
                              <div className="bg-white p-4 rounded-lg border-2 border-[#00ea7c]">
                                <p className="text-4xl font-bold tracking-widest text-[#281F56] font-mono">
                                  {pickupCode}
                                </p>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-[#00EA7C] text-white hover:bg-[#00EA7C]/90 border-none active:scale-95 transition-all duration-200 font-semibold w-full"
                                onClick={() => copyToClipboard(pickupCode, "Código de retirada")}
                              >
                                <Copy className="w-4 h-4" />
                                Copiar Código
                              </Button>
                              
                              <p className="text-xs text-muted-foreground">
                                📦 Apresente este código na loja para retirar seu produto
                              </p>
                              
                              {produto.nomeFantasiaEmpresa && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 w-full border-green-500 text-green-700 hover:bg-green-50"
                                  onClick={contactWhatsApp}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Contatar {produto.nomeFantasiaEmpresa}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Resumo de Valores */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>R$ {productPrice.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">R$ {productPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#00ea7c]">
                        <span>Você recebe de volta:</span>
                        <span className="font-bold">R$ {cashbackAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Botão Finalizar */}
                    {!transacao ? (
                      <Button
                        onClick={handleFinalizarCompra}
                        disabled={isCreatingTransaction || !usuarioId || produto.quantidadeEstoque === 0}
                        className="w-full bg-[#00ea7c] text-[#f4efea] hover:bg-[#00ea7c]/90 active:scale-95 transition-all duration-200 font-semibold shadow-medium hover:shadow-strong h-12"
                      >
                        {isCreatingTransaction ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : produto.quantidadeEstoque === 0 ? (
                          "Produto Indisponível"
                        ) : (
                          "Finalizar Compra"
                        )}
                      </Button>
                    ) : (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-sm text-green-800 text-center">
                          <CheckCircle2 className="w-4 h-4 inline mr-2" />
                          {transacao.statusTransacao === "AGUARDANDO_PAGAMENTO" 
                            ? "Aguardando confirmação de pagamento"
                            : transacao.statusTransacao === "PAGO"
                            ? "Pagamento confirmado! Cashback será creditado em 30 dias."
                            : "Transação processada"}
                        </p>
                      </div>
                    )}

                    {/* Aviso Cashback */}
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Importante:</strong> O cashback será creditado após 1 mês da compra.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog de Sucesso */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#00ea7c] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center">Compra Realizada com Sucesso!</DialogTitle>
            <DialogDescription className="text-center">
              Seu pedido foi processado. Apresente o código de retirada na loja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Código de Retirada */}
            {transacao && transacao.codigoRetirada && (
              <div className="border border-border p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-2 text-center">Código de Retirada na Loja:</p>
                <div className="flex items-center justify-between bg-background p-3 rounded">
                  <span className="text-3xl font-bold tracking-wider text-center flex-1">{pickupCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transacao.codigoRetirada, "Código de retirada")}
                    className="active:scale-95 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Apresente este código na loja física para retirar seu produto
                </p>
              </div>
            )}

            {/* Informações do Produto */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{produto.nomeProduto}</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor do Produto:</span>
                <span className="font-bold">R$ {productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#00ea7c]">
                <span>Cashback ({produto.prcntCashback?.toFixed(0) || 0}%):</span>
                <span className="font-bold">
                  R$ {transacao ? Number(transacao.valorCashback).toFixed(2) : cashbackAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2">
              {produto.nomeFantasiaEmpresa && (
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 active:scale-95 transition-all duration-200"
                  onClick={contactWhatsApp}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contatar Loja via WhatsApp
                </Button>
              )}
              <Button
                onClick={() => {
                  setSuccessDialogOpen(false);
                  navigate("/home");
                }}
                className="w-full bg-primary hover:bg-primary/90 active:scale-95 transition-all duration-200"
              >
                Voltar para Ofertas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Checkout;

