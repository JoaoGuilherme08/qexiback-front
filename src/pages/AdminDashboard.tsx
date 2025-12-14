import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Users, Store, Building2, CheckCircle, XCircle, Clock, Heart } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface DashboardStats {
  totalUsuarios: number;
  totalEmpresas: number;
  totalProdutos: number;
  empresasPendentes: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalEmpresas: 0,
    totalProdutos: 0,
    empresasPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamadas às APIs de estatísticas
      // Por enquanto, dados mockados
      setStats({
        totalUsuarios: 0,
        totalEmpresas: 0,
        totalProdutos: 0,
        empresasPendentes: 0,
      });
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as estatísticas do painel',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, empresas e produtos da plataforma
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmpresas}</div>
            <p className="text-xs text-muted-foreground">Empresas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.empresasPendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/admin/withdrawals')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprovar Saques
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/admin/companies')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Gerenciar Empresas
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/admin/institutions')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Aprovar Instituições
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente para exibir
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
