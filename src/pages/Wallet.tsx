import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, TrendingUp, Heart, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";

const Wallet = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

  // Mock data
  const balance = {
    total: 450.00,
    available: 320.00,
    pending: 130.00,
  };

  const transactions = [
    {
      id: 1,
      type: "cashback",
      store: "Cafeteria Central",
      amount: 15.50,
      status: "confirmed",
      date: "2025-01-10",
    },
    {
      id: 2,
      type: "donation",
      institution: "Casa do Idoso",
      amount: -50.00,
      status: "confirmed",
      date: "2025-01-09",
    },
    {
      id: 3,
      type: "cashback",
      store: "Tech Store Premium",
      amount: 32.00,
      status: "pending",
      date: "2025-01-08",
    },
    {
      id: 4,
      type: "cashback",
      store: "Restaurante Sabor",
      amount: 24.50,
      status: "confirmed",
      date: "2025-01-07",
    },
    {
      id: 5,
      type: "withdrawal",
      amount: -100.00,
      status: "confirmed",
      date: "2025-01-05",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode; label: string }> = {
      confirmed: { variant: "secondary", icon: <CheckCircle className="w-3 h-3" />, label: "Confirmado" },
      pending: { variant: "default", icon: <Clock className="w-3 h-3" />, label: "Pendente" },
      cancelled: { variant: "destructive", icon: <XCircle className="w-3 h-3" />, label: "Cancelado" },
    };
    const config = variants[status] || variants.pending;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                <CardTitle className="text-4xl font-bold">
                  R$ {balance.total.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="hero-light" className="w-full">
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
                <CardTitle className="text-3xl text-green-600">
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
                <CardTitle className="text-3xl text-yellow-600">
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
                <Button variant="secondary" className="w-full">
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
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Acompanhe todas as suas movimentações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="cashback">Cashback</TabsTrigger>
                  <TabsTrigger value="donation">Doações</TabsTrigger>
                  <TabsTrigger value="withdrawal">Saques</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.amount > 0 ? (
                            <ArrowDownRight className="w-6 h-6 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === "cashback"
                              ? transaction.store
                              : transaction.type === "donation"
                              ? transaction.institution
                              : "Saque"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(transaction.status)}
                        <p
                          className={`font-semibold text-lg ${
                            transaction.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}R$ {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wallet;
