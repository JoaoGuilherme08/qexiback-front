import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, TrendingUp, Users, Award, DollarSign } from "lucide-react";
const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userType");
    navigate("/");
  };

  // Mock data
  const stats = {
    totalDonations: 45680.50,
    totalDonors: 234,
    monthlyDonations: 8920.00,
    averageDonation: 195.22
  };
  const topDonors = [{
    name: "João Silva",
    amount: 850.00,
    donations: 15
  }, {
    name: "Maria Santos",
    amount: 720.00,
    donations: 12
  }, {
    name: "Pedro Costa",
    amount: 650.00,
    donations: 10
  }, {
    name: "Ana Oliveira",
    amount: 520.00,
    donations: 8
  }];
  const recentDonations = [{
    id: 1,
    donor: "João Silva",
    amount: 50.00,
    date: "2025-01-10"
  }, {
    id: 2,
    donor: "Maria Santos",
    amount: 100.00,
    date: "2025-01-09"
  }, {
    id: 3,
    donor: "Pedro Costa",
    amount: 75.00,
    date: "2025-01-09"
  }];
  return <div className="min-h-screen flex flex-col">
      <Navbar userType="institution" onLogout={handleLogout} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard - Casa do Idoso</h1>
            <p className="text-muted-foreground">
              Acompanhe as doações e o impacto da sua instituição
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft gradient-primary text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-white/80">Total Arrecadado</CardDescription>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[#281f56]">R$ {stats.totalDonations.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Desde o início
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between text-[#281f56]">
                  <CardDescription>Este Mês</CardDescription>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-green-600">
                  R$ {stats.monthlyDonations.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +18% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Total de Doadores</CardDescription>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl">{stats.totalDonors}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pessoas que contribuíram
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Doação Média</CardDescription>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl">R$ {stats.averageDonation.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Por doador
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Donors */}
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Doadores</CardTitle>
                    <CardDescription>Pessoas que mais contribuíram</CardDescription>
                  </div>
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDonors.map((donor, index) => <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                              {donor.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-xs">🏆</span>
                            </div>}
                        </div>
                        <div>
                          <p className="font-medium">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {donor.donations} doações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-green-600">
                          R$ {donor.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Doações Recentes</CardTitle>
                <CardDescription>Últimas contribuições recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDonations.map(donation => <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{donation.donor}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-green-600">
                          R$ {donation.amount.toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Cashback
                        </Badge>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default InstitutionDashboard;