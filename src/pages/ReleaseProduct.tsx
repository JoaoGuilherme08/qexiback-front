import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Package, User, DollarSign, ArrowLeft, AlertCircle } from "lucide-react";
import { transacaoService, Transacao } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const ReleaseProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [codigoRetirada, setCodigoRetirada] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleBuscarTransacao = async () => {
    if (!codigoRetirada.trim()) {
      toast({
        title: "Atenção",
        description: "Digite o código de retirada",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      
      // Remover espaços e traços, converter para maiúsculas
      const codigo = codigoRetirada.trim().replace(/[-\s]/g, '').toUpperCase();
      
      // Buscar transação
      const transacaoEncontrada = await transacaoService.buscarPorCodigoRetirada(codigo);
      
      setTransacao(transacaoEncontrada);
      
      toast({
        title: "Transação encontrada",
        description: "Verifique os dados antes de liberar o produto",
      });
      
    } catch (error: any) {
      console.error("Erro ao buscar transação:", error);
      toast({
        title: "Código não encontrado",
        description: error.message || "Verifique o código e tente novamente",
        variant: "destructive",
      });
      setTransacao(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLiberarProduto = async () => {
    if (!transacao) {
      toast({
        title: "Erro",
        description: "Nenhuma transação selecionada",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReleasing(true);
      
      // Remover espaços e traços, converter para maiúsculas
      const codigo = codigoRetirada.trim().replace(/[-\s]/g, '').toUpperCase();
      
      await transacaoService.liberarProduto(codigo);
      
      setSuccessDialogOpen(true);
      
      toast({
        title: "Produto liberado!",
        description: "O cashback foi creditado ao cliente",
      });
      
    } catch (error: any) {
      console.error("Erro ao liberar produto:", error);
      toast({
        title: "Erro ao liberar produto",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  const handleNovaLiberacao = () => {
    setSuccessDialogOpen(false);
    setTransacao(null);
    setCodigoRetirada("");
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", variant: "secondary" },
      PAGO: { label: "Pago", variant: "default" },
      LIBERADO: { label: "Liberado", variant: "outline" },
      CANCELADO: { label: "Cancelado", variant: "destructive" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
  };

  const canRelease = transacao?.statusTransacao === "PAGO";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userType="store" />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-background py-4 border-b">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/store/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Dashboard
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Liberar Produto</h1>
              <p className="text-muted-foreground">
                Digite o código de retirada para validar e liberar o produto ao cliente
              </p>
            </div>

            {/* Formulário de Busca */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Código de Retirada</CardTitle>
                <CardDescription>
                  Solicite o código de 8 dígitos ao cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de Retirada</Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      type="text"
                      placeholder="Digite o código (ex: ABC12345)"
                      value={codigoRetirada}
                      onChange={(e) => setCodigoRetirada(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleBuscarTransacao();
                        }
                      }}
                      className="text-lg font-mono tracking-wider"
                      maxLength={8}
                    />
                    <Button
                      onClick={handleBuscarTransacao}
                      disabled={isSearching || !codigoRetirada.trim()}
                      className="bg-[#00ea7c] text-white hover:bg-[#00ea7c]/90"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O código possui 8 caracteres alfanuméricos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Transação */}
            {transacao && (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Detalhes da Compra</CardTitle>
                    <Badge variant={formatStatus(transacao.statusTransacao).variant}>
                      {formatStatus(transacao.statusTransacao).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informações do Produto */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-semibold">Produto</span>
                    </div>
                    <div className="pl-6">
                      <p className="font-semibold text-lg">{transacao.nomeProduto || "Produto"}</p>
                      <p className="text-sm text-muted-foreground">ID: {transacao.produtoId}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Informações do Cliente */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">Cliente</span>
                    </div>
                    <div className="pl-6">
                      <p className="font-semibold">{transacao.nomeUsuario || "Cliente"}</p>
                      <p className="text-sm text-muted-foreground">ID: {transacao.usuarioId}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Valores */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-semibold">Valores</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor da Compra:</span>
                        <span className="font-bold">R$ {Number(transacao.valorCompra).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#00ea7c]">
                        <span>Cashback:</span>
                        <span className="font-bold">R$ {Number(transacao.valorCashback).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Datas */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data da Compra:</span>
                      <span>{new Date(transacao.dtCompra).toLocaleString('pt-BR')}</span>
                    </div>
                    {transacao.dtLiberacao && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Liberação Prevista:</span>
                        <span>{new Date(transacao.dtLiberacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Mensagem de Status */}
                  {!canRelease && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-800 mb-1">
                          Produto não pode ser liberado
                        </p>
                        <p className="text-sm text-yellow-700">
                          {transacao.statusTransacao === "AGUARDANDO_PAGAMENTO"
                            ? "O pagamento ainda não foi confirmado."
                            : transacao.statusTransacao === "LIBERADO"
                            ? "Este produto já foi liberado anteriormente."
                            : "Esta transação está cancelada."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botão de Liberação */}
                  {canRelease && (
                    <Button
                      onClick={handleLiberarProduto}
                      disabled={isReleasing}
                      className="w-full bg-green-600 text-white hover:bg-green-700 h-12 text-lg"
                    >
                      {isReleasing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Liberando Produto...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Liberar Produto
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Dialog de Sucesso */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center">Produto Liberado com Sucesso!</DialogTitle>
            <DialogDescription className="text-center">
              O cliente pode retirar o produto. O cashback foi creditado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Produto:</span>
                <span className="font-semibold">{transacao?.nomeProduto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold">{transacao?.nomeUsuario}</span>
              </div>
              <div className="flex justify-between text-sm text-[#00ea7c]">
                <span>Cashback Liberado:</span>
                <span className="font-bold">
                  R$ {transacao ? Number(transacao.valorCashback).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleNovaLiberacao}
                className="w-full bg-[#00ea7c] hover:bg-[#00ea7c]/90"
              >
                Nova Liberação
              </Button>
              <Button
                onClick={() => navigate("/store/dashboard")}
                variant="outline"
                className="w-full"
              >
                Voltar para Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ReleaseProduct;
