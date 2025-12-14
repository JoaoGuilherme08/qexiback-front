import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet as WalletIcon, TrendingUp, Heart, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiService, carteiraService, transacaoService, doacaoService, Carteira, Transacao, Doacao, Instituicao } from "@/services/api";

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [carteira, setCarteira] = useState<Carteira | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [donationPercentage, setDonationPercentage] = useState([50]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await apiService.validateToken(token);
      if (!response.data) {
        throw new Error("Não foi possível carregar os dados do usuário");
      }

      const userData = response.data;
      const userId = userData.userId;
      setUsuarioId(userId);

      // Carregar carteira
      const carteiraData = await carteiraService.consultarCarteira(userId);
      setCarteira(carteiraData);

      // Carregar transações
      const transacoesData = await transacaoService.listarTransacoesPorUsuario(userId);
      setTransacoes(transacoesData);

      // Carregar doações
      const doacoesData = await doacaoService.listarDoacoesPorUsuario(userId);
      setDoacoes(doacoesData);

      // Carregar instituições ativas
      const instituicoesData = await apiService.listarTodasInstituicoesAtivas();
      // Filtrar apenas instituições aprovadas
      const instituicoesAprovadas = instituicoesData.filter(
        inst => inst.statusAprovacao === 'APROVADA' || !inst.statusAprovacao // retrocompatibilidade
      );
      setInstituicoes(instituicoesAprovadas);

    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados da carteira",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const donationAmount = carteira ? carteira.saldoDisponivel * donationPercentage[0] / 100 : 0;

  // Check if user has made at least one donation
  const hasMadeDonation = () => {
    return doacoes.length > 0;
  };

  const handleWithdrawalClick = () => {
    if (!carteira) return;
    
    if (carteira.saldoDisponivel < 50) {
      toast({
        title: "Saldo insuficiente",
        description: "Você precisa ter pelo menos R$ 50,00 disponível para sacar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!carteira.podeSacar) {
      toast({
        title: "Doação necessária",
        description: carteira.mensagemValidacao || "Você precisa fazer pelo menos uma doação antes de sacar.",
        variant: "destructive"
      });
      return;
    }
    
    setWithdrawalDialogOpen(true);
  };

  const handleWithdrawalConfirm = async () => {
    if (!pixKey.trim() || !usuarioId || !carteira) {
      toast({
        title: "Chave PIX necessária",
        description: "Por favor, informe sua chave PIX.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessingWithdrawal(true);
      await carteiraService.solicitarSaque(usuarioId, {
        valorSaque: carteira.saldoDisponivel,
        chavePix: pixKey
      });
      
      toast({
        title: "Saque solicitado",
        description: `Solicitação de saque de R$ ${carteira.saldoDisponivel.toFixed(2)} enviada com sucesso!`
      });
      
      setWithdrawalDialogOpen(false);
      setPixKey("");
      await carregarDados(); // Recarregar dados
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar saque",
        description: error.message || "Não foi possível processar o saque",
        variant: "destructive"
      });
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const handleDonationConfirm = async () => {
    if (!selectedInstitution || !usuarioId || !carteira) {
      toast({
        title: "Instituição necessária",
        description: "Por favor, selecione uma instituição.",
        variant: "destructive"
      });
      return;
    }

    if (donationAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor da doação deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessingDonation(true);
      await doacaoService.realizarDoacao(usuarioId, {
        instituicaoId: selectedInstitution,
        valorDoado: donationAmount
      });
      
      toast({
        title: "Doação realizada",
        description: `Doação de R$ ${donationAmount.toFixed(2)} realizada com sucesso!`
      });
      
      setDonationDialogOpen(false);
      setSelectedInstitution("");
      setDonationPercentage([50]);
      await carregarDados(); // Recarregar dados
    } catch (error: any) {
      toast({
        title: "Erro ao realizar doação",
        description: error.message || "Não foi possível processar a doação",
        variant: "destructive"
      });
    } finally {
      setIsProcessingDonation(false);
    }
  };

  // Combinar transações e doações para histórico
  const historicoCompleto = [
    ...transacoes.map(t => ({
      id: t.id,
      type: "cashback" as const,
      store: t.nomeFantasiaEmpresa || "Loja",
      amount: t.valorCashback,
      status: t.statusTransacao === "LIBERADO" ? "confirmed" : t.statusTransacao === "CANCELADO" ? "cancelled" : "pending",
      date: t.dtCompra
    })),
    ...doacoes.map(d => ({
      id: d.id,
      type: "donation" as const,
      institution: d.nomeInstituicao || "Instituição",
      amount: -d.valorDoado,
      status: "confirmed" as const,
      date: d.dtDoacao
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusBadge = (status: string) => {
    const variants: Record<string, {
      variant: "default" | "secondary" | "destructive";
      icon: React.ReactNode;
      label: string;
    }> = {
      confirmed: {
        variant: "secondary",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Confirmado"
      },
      pending: {
        variant: "default",
        icon: <Clock className="w-3 h-3" />,
        label: "Pendente"
      },
      cancelled: {
        variant: "destructive",
        icon: <XCircle className="w-3 h-3" />,
        label: "Cancelado"
      }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando dados da carteira...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!carteira) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Erro ao carregar dados da carteira</p>
            <Button onClick={carregarDados}>Tentar novamente</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <div className="min-h-screen flex flex-col">
      <Navbar userType="user" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minha Carteira</h1>
            <p className="text-muted-foreground">
              Gerencie seu saldo, histórico e doações
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="gradient-primary text-white shadow-medium">
              <CardHeader>
                <CardDescription className="text-[#281f56]">Saldo Total</CardDescription>
                <CardTitle className="text-4xl font-bold text-[#281f56]">
                  R$ {carteira.saldoTotal.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Saldo Disponível</CardDescription>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[#281f56]">
                  R$ {carteira.saldoDisponivel.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Disponível para saque ou doação
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Saldo Pendente</CardDescription>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[#281f56]">
                  R$ {carteira.saldoBloqueado.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aguardando liberação (30 dias)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-soft hover:shadow-medium transition-base cursor-pointer border-2 border-accent/20 hover:border-accent">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-secondary rounded-xl flex items-center justify-center bg-[#00ea7c]">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle>Doe seu Cashback</CardTitle>
                    <CardDescription>
                      Transforme seu saldo em impacto social
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" onClick={() => setDonationDialogOpen(true)}>
                  Ver Instituições
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-base cursor-pointer border-2 border-primary/20 hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center bg-[#00ea7c]">
                    <WalletIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle>Sacar Valor</CardTitle>
                    <CardDescription>
                      Transfira para sua conta bancária
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full" onClick={handleWithdrawalClick}>
                  Solicitar Saque
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Todas as suas transações, doações e cashbacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicoCompleto.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historicoCompleto.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === "cashback" ? "bg-green-100 text-green-600" :
                          transaction.type === "donation" ? "bg-red-100 text-red-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          {transaction.type === "cashback" ? (
                            <TrendingUp className="w-6 h-6" />
                          ) : transaction.type === "donation" ? (
                            <Heart className="w-6 h-6" />
                          ) : (
                            <ArrowDownRight className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === "cashback" ? `Cashback - ${transaction.store}` :
                             transaction.type === "donation" ? `Doação - ${transaction.institution}` :
                             "Saque"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("pt-BR", {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(transaction.status)}
                        <p className={`font-semibold text-lg ${transaction.amount >= 0 ? 'text-[#00ea7c]' : 'text-red-500'}`}>
                          {transaction.amount >= 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Doar Cashback</DialogTitle>
            <DialogDescription>
              Escolha quanto do seu saldo disponível deseja doar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Porcentagem da doação</span>
                <span className="text-2xl font-bold text-primary">{donationPercentage[0]}%</span>
              </div>
              <Slider value={donationPercentage} onValueChange={setDonationPercentage} min={10} max={100} step={5} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione a Instituição</label>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha uma instituição" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {instituicoes.map(institution => (
                    <SelectItem key={institution.id} value={institution.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-primary" />
                        </div>
                        <span>{institution.nomeInstituicao}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo disponível:</span>
                <span className="font-medium">R$ {carteira.saldoDisponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Valor da doação:</span>
                <span className="text-primary">R$ {donationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo após doação:</span>
                <span className="font-medium">R$ {(carteira.saldoDisponivel - donationAmount).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!selectedInstitution || isProcessingDonation || donationAmount <= 0}
              onClick={handleDonationConfirm}
            >
              {isProcessingDonation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Doação"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sacar Saldo</DialogTitle>
            <DialogDescription>
              Transfira seu saldo disponível para sua conta via PIX
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo disponível:</span>
                <span className="font-bold text-lg">R$ {carteira.saldoDisponivel.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input 
                id="pixKey" 
                placeholder="Digite sua chave PIX (CPF, e-mail, telefone ou chave aleatória)" 
                value={pixKey} 
                onChange={e => setPixKey(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground">
                O valor será transferido para esta chave PIX
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Requisitos para saque:</strong>
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                <li>Saldo mínimo de R$ 50,00 {carteira.saldoDisponivel >= 50 ? '✓' : '✗'}</li>
                <li>Ter realizado pelo menos uma doação {hasMadeDonation() ? '✓' : '✗'}</li>
              </ul>
            </div>

            <Button 
              className="w-full" 
              onClick={handleWithdrawalConfirm} 
              disabled={!pixKey.trim() || isProcessingWithdrawal || !carteira.podeSacar}
            >
              {isProcessingWithdrawal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                `Confirmar Saque de R$ ${carteira.saldoDisponivel.toFixed(2)}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Wallet;
