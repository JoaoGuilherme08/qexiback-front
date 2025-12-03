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
import { Wallet as WalletIcon, TrendingUp, Heart, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Loader2, ShoppingBag, DollarSign, Package } from "lucide-react";
import { apiService, carteiraService, transacaoService, doacaoService, Carteira, CarteiraEmpresa, Transacao, Doacao, Instituicao } from "@/services/api";

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [carteira, setCarteira] = useState<Carteira | null>(null);
  const [carteiraEmpresa, setCarteiraEmpresa] = useState<CarteiraEmpresa | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  
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
      const userType = userData.tipoUsuario;
      setUsuarioId(userId);
      setTipoUsuario(userType);

      // Se for empresa, carregar dados da empresa
      if (userType === 'EMPRESA' || userType === 'ADMINISTRADOR_EMPRESA') {
        const empresaIdFromData = userData.empresaId;
        
        if (empresaIdFromData) {
          setEmpresaId(empresaIdFromData);
          
          // Carregar carteira da empresa
          const carteiraEmpresaData = await carteiraService.consultarCarteiraEmpresa(empresaIdFromData);
          setCarteiraEmpresa(carteiraEmpresaData);
          
          // Carregar transações da empresa
          const transacoesData = await transacaoService.listarTransacoesPorEmpresa(empresaIdFromData);
          setTransacoes(transacoesData);
        }
      } else {
        // Carregar carteira do cliente
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
        setInstituicoes(instituicoesData);
      }

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

  if (!carteira && !carteiraEmpresa) {
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

  // Renderizar carteira para EMPRESA
  if (carteiraEmpresa && (tipoUsuario === 'EMPRESA' || tipoUsuario === 'ADMINISTRADOR_EMPRESA')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="user" />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Financeiro da Empresa</h1>
              <p className="text-muted-foreground">
                {carteiraEmpresa.nomeFantasia} - Visão geral de vendas e transações
              </p>
            </div>

            {/* Balance Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="gradient-primary text-white shadow-medium">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-[#281f56]">Total de Vendas</CardDescription>
                    <DollarSign className="w-8 h-8 text-[#281f56]" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-[#281f56]">
                    R$ {carteiraEmpresa.totalVendas.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription>Cashback Concedido</CardDescription>
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl text-[#281f56]">
                    R$ {carteiraEmpresa.totalCashbackGerado.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-soft border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription>Receita Líquida</CardDescription>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-[#281f56]">
                    R$ {carteiraEmpresa.receitaLiquida.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription>Total de Transações</CardDescription>
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl text-[#281f56]">
                    {carteiraEmpresa.totalTransacoes}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Status Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardDescription className="text-yellow-600">Aguardando Pagamento</CardDescription>
                  <CardTitle className="text-2xl">{carteiraEmpresa.transacoesPendentes}</CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardDescription className="text-blue-600">Pagas</CardDescription>
                  <CardTitle className="text-2xl">{carteiraEmpresa.transacoesPagas}</CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardDescription className="text-green-600">Liberadas</CardDescription>
                  <CardTitle className="text-2xl">{carteiraEmpresa.transacoesLiberadas}</CardTitle>
                </CardHeader>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardDescription className="text-red-600">Canceladas</CardDescription>
                  <CardTitle className="text-2xl">{carteiraEmpresa.transacoesCanceladas}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Histórico de Transações */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Últimas transações da sua empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transacoes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada
                    </p>
                  ) : (
                    transacoes.slice(0, 10).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{t.nomeProduto || "Produto"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(t.dtCompra).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            + R$ {t.valorCompra.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            {getStatusBadge(
                              t.statusTransacao === "LIBERADO" ? "confirmed" :
                              t.statusTransacao === "CANCELADO" ? "cancelled" : "pending"
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Renderizar carteira para CLIENTE (original)
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

  return (
    <div className="min-h-screen flex flex-col">
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
                <Button className="w-full" onClick={handleWithdrawalClick} disabled={carteira.saldoDisponivel < 50}>
                  {carteira.saldoDisponivel < 50 ? "Saldo mínimo R$ 50" : "Solicitar Saque"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Donation Progress */}
          {carteira.totalDoado > 0 && (
            <Card className="shadow-soft mb-8">
              <CardHeader>
                <CardTitle>Meta de Doação</CardTitle>
                <CardDescription>
                  Você já doou {carteira.percentualDoado.toFixed(2)}% do seu saldo total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total doado</span>
                    <span className="font-medium">R$ {carteira.totalDoado.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00ea7c] to-[#01c064] transition-all" style={{
                width: `${Math.min(carteira.percentualDoado, 100)}%`
              }} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {carteira.podeSacar ? "✅ Você já pode sacar seu saldo!" : "Doe pelo menos 10% para desbloquear saques"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico */}
          <Tabs defaultValue="historico" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="historico">Histórico Completo</TabsTrigger>
              <TabsTrigger value="doacoes">Minhas Doações</TabsTrigger>
            </TabsList>

            <TabsContent value="historico" className="mt-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Histórico de Transações</CardTitle>
                  <CardDescription>Acompanhe seu cashback e doações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {historicoCompleto.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada
                      </p>
                    ) : (
                      historicoCompleto.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === "cashback" ? "gradient-secondary" : "bg-gradient-to-br from-pink-500 to-purple-600"}`}>
                              {item.type === "cashback" ? <TrendingUp className="w-5 h-5 text-white" /> : <Heart className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium">
                                {item.type === "cashback" ? item.store : item.institution}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(item.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${item.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                              {item.amount > 0 ? "+" : ""} R$ {Math.abs(item.amount).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 justify-end">
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doacoes" className="mt-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Minhas Doações</CardTitle>
                  <CardDescription>Histórico de contribuições para instituições</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doacoes.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Você ainda não fez nenhuma doação
                      </p>
                    ) : (
                      doacoes.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{d.nomeInstituicao}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(d.dtDoacao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-red-600">
                            - R$ {d.valorDoado.toFixed(2)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Donation Dialog */}
      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Fazer uma Doação</DialogTitle>
            <DialogDescription>
              Escolha uma instituição e o valor que deseja doar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Instituição</Label>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma instituição" />
                </SelectTrigger>
                <SelectContent>
                  {instituicoes.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.nomeInstituicao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Percentual do Saldo Disponível: {donationPercentage}%</Label>
              <Slider value={donationPercentage} onValueChange={setDonationPercentage} max={100} step={5} className="w-full" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo disponível</span>
                <span className="font-medium">R$ {carteira.saldoDisponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Valor da doação</span>
                <span className="text-primary">R$ {donationAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDonationDialogOpen(false)} disabled={isProcessingDonation}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleDonationConfirm} disabled={!selectedInstitution || donationAmount <= 0 || isProcessingDonation}>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Solicitar Saque</DialogTitle>
            <DialogDescription>
              Informe sua chave PIX para receber o valor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor do saque</span>
                <span className="font-bold text-lg">R$ {carteira.saldoDisponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total doado</span>
                <span className="font-medium">R$ {carteira.totalDoado.toFixed(2)} ({carteira.percentualDoado.toFixed(2)}%)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input id="pixKey" placeholder="Digite sua chave PIX" value={pixKey} onChange={(e) => setPixKey(e.target.value)} disabled={isProcessingWithdrawal} />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
          setWithdrawalDialogOpen(false);
          setPixKey("");
        }} disabled={isProcessingWithdrawal}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleWithdrawalConfirm} disabled={!pixKey.trim() || isProcessingWithdrawal}>
                {isProcessingWithdrawal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Saque"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Wallet;
