import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saqueService } from '@/services/api';
import type { Saque, AprovarSaqueRequest, RejeitarSaqueRequest } from '@/services/api';
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
import { CheckCircle, XCircle, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

type StatusFilter = 'TODOS' | 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export default function WithdrawalApproval() {
  const { toast } = useToast();
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [selectedSaque, setSelectedSaque] = useState<Saque | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [adminId, setAdminId] = useState<string>('');
  const [userTipoUsuario, setUserTipoUsuario] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    console.log('[WithdrawalApproval] userData:', userData);

    if (!userData) {
      toast({
        title: 'Autenticação necessária',
        description: 'Você precisa estar logado para acessar esta página.',
        variant: 'destructive',
      });
      window.location.href = '/login';
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      console.log('[WithdrawalApproval] Parsed userData:', parsed);
      console.log('[WithdrawalApproval] TipoUsuario:', parsed.tipoUsuario);
      console.log('[WithdrawalApproval] UserId:', parsed.id);

      setUserTipoUsuario(parsed.tipoUsuario);
      setAdminId(parsed.id || '');

      if (parsed.tipoUsuario !== 'ADMIN') {
        toast({
          title: 'Acesso negado',
          description: 'Apenas administradores podem acessar esta página.',
          variant: 'destructive',
        });
        window.location.href = '/';
        return;
      }

      loadSaques();
    } catch (error) {
      console.error('[WithdrawalApproval] Erro ao parsear userData:', error);
      toast({
        title: 'Erro de autenticação',
        description: 'Dados de usuário inválidos. Faça login novamente.',
        variant: 'destructive',
      });
      window.location.href = '/login';
    }
  }, []);

  const loadSaques = async () => {
    try {
      setLoading(true);
      const data = await saqueService.listarTodosSaques();
      setSaques(data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar saques',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSaque) return;

    // Obter adminId diretamente do localStorage para garantir valor atualizado
    const userData = localStorage.getItem('userData');
    if (!userData) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você não está autenticado. Faça login novamente.',
        variant: 'destructive',
      });
      window.location.href = '/login';
      return;
    }

    let currentAdminId: string;
    try {
      const parsed = JSON.parse(userData);
      console.log('[handleApprove] userData parseado:', parsed);
      console.log('[handleApprove] parsed.id:', parsed.id);
      console.log('[handleApprove] parsed.userId:', parsed.userId);
      console.log('[handleApprove] Todas as chaves:', Object.keys(parsed));
      
      // Tentar diferentes possíveis nomes do campo ID
      currentAdminId = parsed.id || parsed.userId || parsed.usuarioId;
      
      if (!currentAdminId) {
        console.error('[handleApprove] ID não encontrado em userData:', parsed);
        throw new Error('ID não encontrado');
      }
      
      console.log('[handleApprove] currentAdminId obtido:', currentAdminId);
    } catch (error) {
      toast({
        title: 'Erro de autenticação',
        description: 'Dados de usuário inválidos. Faça login novamente.',
        variant: 'destructive',
      });
      window.location.href = '/login';
      return;
    }

    try {
      setActionLoading(true);
      const request: AprovarSaqueRequest = {
        saqueId: selectedSaque.id,
        observacoes: observacoes.trim() || undefined,
      };

      await saqueService.aprovarSaque(currentAdminId, request);

      toast({
        title: 'Saque aprovado!',
        description: `Saque de R$ ${selectedSaque.valorSaque.toFixed(2)} aprovado com sucesso.`,
      });

      setShowApproveDialog(false);
      setObservacoes('');
      setSelectedSaque(null);
      await loadSaques();
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar saque',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSaque || !motivoRejeicao.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo da rejeição.',
        variant: 'destructive',
      });
      return;
    }

    // Obter adminId diretamente do localStorage para garantir valor atualizado
    const userData = localStorage.getItem('userData');
    if (!userData) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você não está autenticado. Faça login novamente.',
        variant: 'destructive',
      });
      window.location.href = '/login';
      return;
    }

    let currentAdminId: string;
    try {
      const parsed = JSON.parse(userData);
      console.log('[handleReject] userData parseado:', parsed);
      console.log('[handleReject] parsed.id:', parsed.id);
      console.log('[handleReject] parsed.userId:', parsed.userId);
      console.log('[handleReject] Todas as chaves:', Object.keys(parsed));
      
      // Tentar diferentes possíveis nomes do campo ID
      currentAdminId = parsed.id || parsed.userId || parsed.usuarioId;
      
      if (!currentAdminId) {
        console.error('[handleReject] ID não encontrado em userData:', parsed);
        throw new Error('ID não encontrado');
      }
      
      console.log('[handleReject] currentAdminId obtido:', currentAdminId);
    } catch (error) {
      toast({
        title: 'Erro de autenticação',
        description: 'Dados de usuário inválidos. Faça login novamente.',
        variant: 'destructive',
      });
      window.location.href = '/login';
      return;
    }

    try {
      setActionLoading(true);
      const request: RejeitarSaqueRequest = {
        saqueId: selectedSaque.id,
        motivoRejeicao: motivoRejeicao.trim(),
        observacoes: observacoes.trim() || undefined,
      };

      await saqueService.rejeitarSaque(currentAdminId, request);

      toast({
        title: 'Saque rejeitado',
        description: `Saque de R$ ${selectedSaque.valorSaque.toFixed(2)} foi rejeitado e o valor estornado.`,
      });

      setShowRejectDialog(false);
      setMotivoRejeicao('');
      setObservacoes('');
      setSelectedSaque(null);
      await loadSaques();
    } catch (error: any) {
      toast({
        title: 'Erro ao rejeitar saque',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openApproveDialog = (saque: Saque) => {
    setSelectedSaque(saque);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (saque: Saque) => {
    setSelectedSaque(saque);
    setShowRejectDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      PENDENTE: { label: 'Pendente', variant: 'secondary', icon: Clock },
      APROVADO: { label: 'Aprovado', variant: 'default', icon: CheckCircle },
      REJEITADO: { label: 'Rejeitado', variant: 'destructive', icon: XCircle },
      PAGO: { label: 'Pago', variant: 'default', icon: DollarSign },
      CANCELADO: { label: 'Cancelado', variant: 'outline', icon: XCircle },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSaques = saques.filter((saque) => {
    if (statusFilter === 'TODOS') return true;
    return saque.status === statusFilter;
  });

  const countByStatus = (status: string) => {
    return saques.filter((s) => s.status === status).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Aprovação de Saques</CardTitle>
            <p className="text-muted-foreground">
              Gerencie as solicitações de saque dos usuários
            </p>
          </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="TODOS">
                Todos ({saques.length})
              </TabsTrigger>
              <TabsTrigger value="PENDENTE">
                Pendentes ({countByStatus('PENDENTE')})
              </TabsTrigger>
              <TabsTrigger value="APROVADO">
                Aprovados ({countByStatus('APROVADO')})
              </TabsTrigger>
              <TabsTrigger value="REJEITADO">
                Rejeitados ({countByStatus('REJEITADO')})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter}>
              {filteredSaques.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum saque encontrado nesta categoria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Usuário</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Valor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Chave PIX</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data Solicitação</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSaques.map((saque) => (
                        <tr key={saque.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{saque.nomeUsuario}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {saque.emailUsuario}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            R$ {saque.valorSaque.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">{saque.chavePix}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(saque.dtSolicitacao)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(saque.status)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {saque.status === 'PENDENTE' ? (
                              <div className="flex gap-2 justify-center">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  onClick={() => openApproveDialog(saque)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openRejectDialog(saque)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Aprovação */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Saque</DialogTitle>
            <DialogDescription>
              Você está prestes a aprovar o saque de{' '}
              <strong>R$ {selectedSaque?.valorSaque.toFixed(2)}</strong> para{' '}
              <strong>{selectedSaque?.nomeUsuario}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chave PIX de Destino</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {selectedSaque?.chavePix}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes-approve">Observações (Opcional)</Label>
              <Textarea
                id="observacoes-approve"
                placeholder="Adicione observações sobre esta aprovação..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setObservacoes('');
                setSelectedSaque(null);
              }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Aprovação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Saque</DialogTitle>
            <DialogDescription>
              Você está prestes a rejeitar o saque de{' '}
              <strong>R$ {selectedSaque?.valorSaque.toFixed(2)}</strong> de{' '}
              <strong>{selectedSaque?.nomeUsuario}</strong>.
              <br />
              <span className="text-amber-600 font-medium">
                O valor será automaticamente estornado para a carteira do usuário.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo-rejeicao">
                Motivo da Rejeição <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivo-rejeicao"
                placeholder="Informe o motivo da rejeição (obrigatório)..."
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes-reject">Observações Adicionais (Opcional)</Label>
              <Textarea
                id="observacoes-reject"
                placeholder="Adicione observações adicionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setMotivoRejeicao('');
                setObservacoes('');
                setSelectedSaque(null);
              }}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !motivoRejeicao.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirmar Rejeição
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
