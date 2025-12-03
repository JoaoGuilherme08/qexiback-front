import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, TrendingUp, Users, Award, DollarSign, Loader2 } from "lucide-react";
import { apiService, doacaoService, Doacao, Instituicao } from "@/services/api";
import { toast } from "sonner";

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalDonors: 0,
    monthlyDonations: 0,
    averageDonation: 0,
    previousMonthDonations: 0
  });
  const [topDonors, setTopDonors] = useState<Array<{ name: string; amount: number; donations: number }>>([]);
  const [recentDonations, setRecentDonations] = useState<Doacao[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      // Obter dados do usuário logado
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
      const instituicaoId = userData.instituicaoId;

      if (!instituicaoId) {
        toast.error("Usuário não possui instituição vinculada");
        navigate("/profile");
        return;
      }

      // Buscar dados da instituição
      const instituicaoData = await apiService.buscarInstituicaoPorId(instituicaoId);
      setInstituicao(instituicaoData);

      // Buscar doações da instituição
      const doacoesData = await doacaoService.listarDoacoesPorInstituicao(instituicaoId);
      setDoacoes(doacoesData);

      // Calcular estatísticas
      calcularEstatisticas(doacoesData);

      // Calcular top doadores
      calcularTopDoadores(doacoesData);

      // Ordenar doações recentes (últimas 10)
      const doacoesRecentes = [...doacoesData]
        .sort((a, b) => new Date(b.dtDoacao).getTime() - new Date(a.dtDoacao).getTime())
        .slice(0, 10);
      setRecentDonations(doacoesRecentes);

    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error(error.message || "Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEstatisticas = (doacoes: Doacao[]) => {
    const totalDonations = doacoes.reduce((sum, d) => sum + Number(d.valorDoado), 0);
    
    // Doadores únicos
    const doadoresUnicos = new Set(doacoes.map(d => d.usuarioId));
    const totalDonors = doadoresUnicos.size;
    
    // Doação média
    const averageDonation = totalDonors > 0 ? totalDonations / totalDonors : 0;
    
    // Doações deste mês
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const monthlyDonations = doacoes
      .filter(d => new Date(d.dtDoacao) >= inicioMes)
      .reduce((sum, d) => sum + Number(d.valorDoado), 0);
    
    // Doações do mês anterior
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    const previousMonthDonations = doacoes
      .filter(d => {
        const dataDoacao = new Date(d.dtDoacao);
        return dataDoacao >= inicioMesAnterior && dataDoacao <= fimMesAnterior;
      })
      .reduce((sum, d) => sum + Number(d.valorDoado), 0);

    setStats({
      totalDonations,
      totalDonors,
      monthlyDonations,
      averageDonation,
      previousMonthDonations
    });
  };

  const calcularTopDoadores = (doacoes: Doacao[]) => {
    // Agrupar por usuário
    const doacoesPorUsuario = new Map<string, { nome: string; total: number; count: number }>();
    
    doacoes.forEach(doacao => {
      const usuarioId = doacao.usuarioId;
      const nome = doacao.nomeUsuario || "Doador Anônimo";
      
      if (!doacoesPorUsuario.has(usuarioId)) {
        doacoesPorUsuario.set(usuarioId, { nome, total: 0, count: 0 });
      }
      
      const dados = doacoesPorUsuario.get(usuarioId)!;
      dados.total += Number(doacao.valorDoado);
      dados.count += 1;
    });

    // Converter para array e ordenar por total
    const topDoadores = Array.from(doacoesPorUsuario.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(d => ({
        name: d.nome,
        amount: d.total,
        donations: d.count
      }));

    setTopDonors(topDoadores);
  };

  const calcularVariacaoMensal = () => {
    if (stats.previousMonthDonations === 0) {
      return stats.monthlyDonations > 0 ? 100 : 0;
    }
    const variacao = ((stats.monthlyDonations - stats.previousMonthDonations) / stats.previousMonthDonations) * 100;
    return variacao;
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar userType="institution" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const variacaoMensal = calcularVariacaoMensal();

  return <div className="min-h-screen flex flex-col">
      <Navbar userType="institution" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Dashboard - {instituicao?.nomeInstituicao || "Instituição"}
            </h1>
            <p className="text-muted-foreground">
              Acompanhe as doações e o impacto da sua instituição
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft gradient-primary text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[#281f56]">Total Arrecadado</CardDescription>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[#281f56]">R$ {stats.totalDonations.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#281f56]">
                  Desde o início
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="bg-transparent">
                <div className="flex items-center justify-between text-[#281f56]">
                  <CardDescription>Este Mês</CardDescription>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00ea7c]">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-[#281f56]">
                  R$ {stats.monthlyDonations.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {variacaoMensal !== 0 && (
                  <p className={`text-sm flex items-center gap-1 ${variacaoMensal >= 0 ? 'text-[#00ea7c]' : 'text-red-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${variacaoMensal < 0 ? 'rotate-180' : ''}`} />
                    {variacaoMensal >= 0 ? '+' : ''}{variacaoMensal.toFixed(1)}% vs mês anterior
                  </p>
                )}
                {variacaoMensal === 0 && stats.monthlyDonations === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma doação este mês
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Total de Doadores</CardDescription>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00ea7c]">
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00ea7c]">
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
                {topDonors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Ainda não há doadores</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topDonors.map((donor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                {donor.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">🏆</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{donor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {donor.donations} {donor.donations === 1 ? 'doação' : 'doações'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-[#00ea7c]">
                            R$ {donor.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Doações Recentes</CardTitle>
                <CardDescription>Últimas contribuições recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Ainda não há doações recebidas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDonations.map(donation => (
                      <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center bg-[#00ea7c]">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{donation.nomeUsuario || "Doador Anônimo"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.dtDoacao).toLocaleDateString("pt-BR", {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-[#00ea7c]">
                            R$ {Number(donation.valorDoado).toFixed(2)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            Cashback
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default InstitutionDashboard;