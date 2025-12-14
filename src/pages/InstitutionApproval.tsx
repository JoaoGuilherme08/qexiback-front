import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Instituicao } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Heart, Loader2, Building2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

type StatusFilter = 'TODOS' | 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export default function InstitutionApproval() {
  const { toast } = useToast();
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [selectedInstituicao, setSelectedInstituicao] = useState<Instituicao | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [adminId, setAdminId] = useState<string>('');
  const [userTipoUsuario, setUserTipoUsuario] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (!userData || !authToken) {
      toast({
        title: 'Autenticação necessária',
        description: 'Você precisa estar logado para acessar esta página.',
        variant: 'destructive',
      });
      window.location.href = '/login';
      return;
    }

    const initAuth = async () => {
      try {
        const parsed = JSON.parse(userData);
        console.log('userData do localStorage:', parsed);
        
        setUserTipoUsuario(parsed.tipoUsuario);
        
        // Tentar múltiplas fontes para o ID do admin
        let adminUserId = parsed.id || parsed.userId || '';
        
        // Se não encontrou, tentar validar o token para pegar o ID
        if (!adminUserId) {
          try {
            const tokenResponse = await apiService.validateToken(authToken);
            if (tokenResponse.data && tokenResponse.data.userId) {
              adminUserId = tokenResponse.data.userId;
              console.log('ID do admin obtido do token:', adminUserId);
            }
          } catch (tokenError) {
            console.error('Erro ao validar token:', tokenError);
          }
        }
        
        setAdminId(adminUserId);
        console.log('Admin ID definido:', adminUserId);

        if (parsed.tipoUsuario !== 'ADMIN') {
          toast({
            title: 'Acesso negado',
            description: 'Apenas administradores podem acessar esta página.',
            variant: 'destructive',
          });
          window.location.href = '/';
          return;
        }

        loadInstituicoes();
      } catch (error) {
        console.error('Erro ao parsear userData:', error);
        toast({
          title: 'Erro de autenticação',
          description: 'Dados de usuário inválidos. Faça login novamente.',
          variant: 'destructive',
        });
        window.location.href = '/login';
      }
    };
    
    initAuth();
  }, []);

  const loadInstituicoes = async () => {
    try {
      setLoading(true);
      const data = await apiService.listarTodasInstituicoesAdmin();
      setInstituicoes(data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar instituições',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedInstituicao || !adminId) {
      console.error('Dados faltando:', { selectedInstituicao, adminId });
      toast({
        title: 'Erro',
        description: 'Dados incompletos para aprovação',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);
      console.log('Aprovando instituição:', selectedInstituicao.id, 'Admin:', adminId);
      await apiService.aprovarInstituicao(selectedInstituicao.id, adminId);
      
      toast({
        title: 'Instituição aprovada',
        description: `${selectedInstituicao.nomeInstituicao} foi aprovada com sucesso.`,
      });
      
      setShowApproveDialog(false);
      setSelectedInstituicao(null);
      await loadInstituicoes();
    } catch (error: any) {
      console.error('Erro ao aprovar:', error);
      toast({
        title: 'Erro ao aprovar instituição',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInstituicao || !adminId || !motivoRejeicao.trim()) {
      console.error('Dados faltando para rejeição:', { selectedInstituicao, adminId, motivoRejeicao });
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da rejeição.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(true);
      console.log('Rejeitando instituição:', selectedInstituicao.id, 'Admin:', adminId, 'Motivo:', motivoRejeicao);
      await apiService.rejeitarInstituicao(selectedInstituicao.id, adminId, motivoRejeicao);
      
      toast({
        title: 'Instituição rejeitada',
        description: `${selectedInstituicao.nomeInstituicao} foi rejeitada.`,
      });
      
      setShowRejectDialog(false);
      setSelectedInstituicao(null);
      setMotivoRejeicao('');
      await loadInstituicoes();
    } catch (error: any) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: 'Erro ao rejeitar instituição',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APROVADA':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'REJEITADA':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      case 'PENDENTE':
      default:
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const filteredInstituicoes = instituicoes.filter(inst => {
    if (statusFilter === 'TODOS') return true;
    return inst.statusAprovacao === statusFilter;
  });

  const countByStatus = (status: string) => {
    return instituicoes.filter(inst => inst.statusAprovacao === status).length;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Aprovar Instituições</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de cadastro de instituições
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('PENDENTE')}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('APROVADA')}</div>
              <p className="text-xs text-muted-foreground">Instituições ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus('REJEITADA')}</div>
              <p className="text-xs text-muted-foreground">Cadastros recusados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Filtro */}
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="TODOS">Todos ({instituicoes.length})</TabsTrigger>
            <TabsTrigger value="PENDENTE">Pendentes ({countByStatus('PENDENTE')})</TabsTrigger>
            <TabsTrigger value="APROVADA">Aprovadas ({countByStatus('APROVADA')})</TabsTrigger>
            <TabsTrigger value="REJEITADA">Rejeitadas ({countByStatus('REJEITADA')})</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            {filteredInstituicoes.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    Nenhuma instituição encontrada
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredInstituicoes.map((instituicao) => (
                  <Card key={instituicao.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-pink-500" />
                            <CardTitle>{instituicao.nomeInstituicao}</CardTitle>
                            {getStatusBadge(instituicao.statusAprovacao)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>CNPJ: {instituicao.cnpjInstituicao}</p>
                            <p>Responsável: {instituicao.nomeResponsavel || 'N/A'}</p>
                            <p>Email: {instituicao.emailResponsavel || instituicao.email || 'N/A'}</p>
                            {instituicao.telefone && <p>Telefone: {instituicao.telefone}</p>}
                          </div>
                        </div>
                        
                        {instituicao.statusAprovacao === 'PENDENTE' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                setSelectedInstituicao(instituicao);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedInstituicao(instituicao);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {instituicao.descricaoInstituicao && (
                          <div>
                            <strong>Descrição:</strong>
                            <p className="text-muted-foreground">{instituicao.descricaoInstituicao}</p>
                          </div>
                        )}
                        
                        {instituicao.enderecoInstituicao && (
                          <div>
                            <strong>Endereço:</strong>
                            <p className="text-muted-foreground">
                              {instituicao.enderecoInstituicao}
                              {instituicao.cidadeInstituicao && `, ${instituicao.cidadeInstituicao}`}
                              {instituicao.estadoInstituicao && ` - ${instituicao.estadoInstituicao}`}
                            </p>
                          </div>
                        )}

                        {instituicao.chavePix && (
                          <div>
                            <strong>Chave PIX:</strong>
                            <p className="text-muted-foreground">{instituicao.chavePix}</p>
                          </div>
                        )}

                        {instituicao.statusAprovacao === 'REJEITADA' && instituicao.motivoRejeicao && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <strong className="text-red-700">Motivo da Rejeição:</strong>
                            <p className="text-red-600 mt-1">{instituicao.motivoRejeicao}</p>
                          </div>
                        )}

                        <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                          <span>Cadastro: {new Date(instituicao.dtCadastro).toLocaleDateString('pt-BR')}</span>
                          {instituicao.dtAprovacao && (
                            <span>
                              {instituicao.statusAprovacao === 'APROVADA' ? 'Aprovação' : 'Rejeição'}: {new Date(instituicao.dtAprovacao).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de Aprovação */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprovar Instituição</DialogTitle>
              <DialogDescription>
                Confirma a aprovação da instituição <strong>{selectedInstituicao?.nomeInstituicao}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApproveDialog(false);
                  setSelectedInstituicao(null);
                }}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleApprove} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Aprovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Rejeição */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Instituição</DialogTitle>
              <DialogDescription>
                Informe o motivo da rejeição da instituição <strong>{selectedInstituicao?.nomeInstituicao}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Rejeição *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Descreva o motivo da rejeição..."
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  rows={4}
                  disabled={actionLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedInstituicao(null);
                  setMotivoRejeicao('');
                }}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={actionLoading || !motivoRejeicao.trim()}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Rejeição
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
