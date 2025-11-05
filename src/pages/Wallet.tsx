import { useState } from "react";
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
import { Wallet as WalletIcon, TrendingUp, Heart, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";
const Wallet = () => {
  const navigate = useNavigate();
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [donationPercentage, setDonationPercentage] = useState([50]);
  const [selectedInstitution, setSelectedInstitution] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

  // Mock data
  const balance = {
    total: 450.00,
    available: 320.00,
    pending: 130.00
  };

  const institutions = [
    {
      id: "1",
      name: "Casa do Idoso",
      logo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=100&fit=crop"
    },
    {
      id: "2",
      name: "Lar dos Animais",
      logo: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=100&h=100&fit=crop"
    },
    {
      id: "3",
      name: "Creche Esperança",
      logo: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=100&fit=crop"
    },
    {
      id: "4",
      name: "Instituto Educação",
      logo: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100&h=100&fit=crop"
    }
  ];

  const donationAmount = (balance.available * donationPercentage[0]) / 100;
  const transactions = [{
    id: 1,
    type: "cashback",
    store: "Cafeteria Central",
    amount: 15.50,
    status: "confirmed",
    date: "2025-01-10"
  }, {
    id: 2,
    type: "donation",
    institution: "Casa do Idoso",
    amount: -50.00,
    status: "confirmed",
    date: "2025-01-09"
  }, {
    id: 3,
    type: "cashback",
    store: "Tech Store Premium",
    amount: 32.00,
    status: "pending",
    date: "2025-01-08"
  }, {
    id: 4,
    type: "cashback",
    store: "Restaurante Sabor",
    amount: 24.50,
    status: "confirmed",
    date: "2025-01-07"
  }, {
    id: 5,
    type: "withdrawal",
    amount: -100.00,
    status: "confirmed",
    date: "2025-01-05"
  }];
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
  return <div className="min-h-screen flex flex-col">
      <Navbar userType="user" onLogout={handleLogout} />

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
                <CardDescription className="text-white/80">Saldo Total</CardDescription>
                <CardTitle className="text-4xl font-bold text-[#281f56]">
                  R$ {balance.total.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="hero-light" className="w-full bg-[#00ea7c] text-base text-[#f4efea]">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Sacar Saldo
                </Button>
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
                  R$ {balance.available.toFixed(2)}
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
                  R$ {balance.pending.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aguardando confirmação das lojas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-soft hover:shadow-medium transition-base cursor-pointer border-2 border-accent/20 hover:border-accent">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-secondary rounded-xl flex items-center justify-center">
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
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setDonationDialogOpen(true)}
                >
                  Ver Instituições
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-base cursor-pointer border-2 border-primary/20 hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center">
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
                <Button variant="default" className="w-full">
                  Solicitar Saque
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="shadow-soft">
            
            
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
              <Slider
                value={donationPercentage}
                onValueChange={setDonationPercentage}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
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
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      <div className="flex items-center gap-3">
                        <img 
                          src={institution.logo} 
                          alt={institution.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{institution.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo disponível:</span>
                <span className="font-medium">R$ {balance.available.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Valor da doação:</span>
                <span className="text-primary">R$ {donationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo após doação:</span>
                <span className="font-medium">R$ {(balance.available - donationAmount).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!selectedInstitution}
              onClick={() => {
                // TODO: Implement donation logic
                setDonationDialogOpen(false);
              }}
            >
              Confirmar Doação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Wallet;