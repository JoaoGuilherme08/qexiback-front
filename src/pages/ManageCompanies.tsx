import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Percent,
} from 'lucide-react';

interface Empresa {
  id: string;
  userId: string;
  nomeFantasia: string;
  cnpjEmpresa: string;
  descricaoEmpresa?: string;
  enderecoEmpresa?: string;
  cidadeEmpresa?: string;
  estadoEmpresa?: string;
  email?: string;
  telefone?: string;
  statusEmpresa: boolean;
  taxaVendaPercentual: number;
  dtCadastro: string;
  dtAtualizacao?: string;
  nomeProprietario?: string;
  emailProprietario?: string;
}

type StatusFilter = 'TODOS' | 'APROVADAS' | 'PENDENTES';

export default function ManageCompanies() {
  console.log('🎯 [ManageCompanies] Componente renderizado');
  
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showTaxDialog, setShowTaxDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [novaTaxa, setNovaTaxa] = useState('');

  useEffect(() => {
    console.log('🚀 [ManageCompanies] Componente montado - carregando empresas...');
    loadEmpresas();
  }, []);

  useEffect(() => {
    filterEmpresas();
  }, [empresas, statusFilter, searchTerm]);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      console.log('🔍 [ManageCompanies] Carregando empresas...');
      console.log('🔑 Token existe:', !!token);
      
      if (!token) {
        console.error('❌ Token não encontrado no localStorage');
        toast({
          title: 'Não autenticado',
          description: 'Faça login novamente',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/empresas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          console.error('❌ Acesso negado (403) - Token pode estar inválido');
          toast({
            title: 'Acesso Negado',
            description: 'Você não tem permissão para acessar esta página',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Empresas carregadas:', data.length);
      setEmpresas(data);
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmpresas = () => {
    let filtered = empresas;

    // Filtrar por status
    if (statusFilter === 'APROVADAS') {
      filtered = filtered.filter((e) => e.statusEmpresa);
    } else if (statusFilter === 'PENDENTES') {
      filtered = filtered.filter((e) => !e.statusEmpresa);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.nomeFantasia.toLowerCase().includes(term) ||
          e.cnpjEmpresa.includes(term) ||
          e.nomeProprietario?.toLowerCase().includes(term) ||
          e.cidadeEmpresa?.toLowerCase().includes(term)
      );
    }

    setFilteredEmpresas(filtered);
  };

  const handleAprovar = async () => {
    if (!selectedEmpresa) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8080/api/admin/empresas/${selectedEmpresa.id}/aprovar`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erro ao aprovar empresa');

      toast({
        title: 'Empresa Aprovada',
        description: `${selectedEmpresa.nomeFantasia} foi aprovada com sucesso!`,
      });

      setShowApproveDialog(false);
      setSelectedEmpresa(null);
      loadEmpresas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a empresa',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejeitar = async () => {
    if (!selectedEmpresa) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8080/api/admin/empresas/${selectedEmpresa.id}/rejeitar`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erro ao rejeitar empresa');

      toast({
        title: 'Empresa Rejeitada',
        description: `${selectedEmpresa.nomeFantasia} foi desativada.`,
      });

      setShowRejectDialog(false);
      setSelectedEmpresa(null);
      loadEmpresas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a empresa',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAtualizarTaxa = async () => {
    if (!selectedEmpresa || !novaTaxa) return;

    const taxa = parseFloat(novaTaxa);
    if (isNaN(taxa) || taxa < 0 || taxa > 100) {
      toast({
        title: 'Taxa Inválida',
        description: 'A taxa deve ser um número entre 0 e 100',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8080/api/admin/empresas/${selectedEmpresa.id}/taxa`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taxaVendaPercentual: taxa }),
        }
      );

      if (!response.ok) throw new Error('Erro ao atualizar taxa');

      toast({
        title: 'Taxa Atualizada',
        description: `Taxa de ${selectedEmpresa.nomeFantasia} atualizada para ${taxa}%`,
      });

      setShowTaxDialog(false);
      setSelectedEmpresa(null);
      setNovaTaxa('');
      loadEmpresas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a taxa',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const countByStatus = (status: 'APROVADAS' | 'PENDENTES') => {
    if (status === 'APROVADAS') {
      return empresas.filter((e) => e.statusEmpresa).length;
    }
    return empresas.filter((e) => !e.statusEmpresa).length;
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Gerenciar Empresas
            </CardTitle>
            <p className="text-muted-foreground">
              Aprove, rejeite e gerencie empresas cadastradas na plataforma
            </p>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CNPJ, proprietário ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="TODOS">Todas ({empresas.length})</TabsTrigger>
                <TabsTrigger value="PENDENTES">
                  Pendentes ({countByStatus('PENDENTES')})
                </TabsTrigger>
                <TabsTrigger value="APROVADAS">
                  Aprovadas ({countByStatus('APROVADAS')})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter}>
                {filteredEmpresas.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma empresa encontrada</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Proprietário</TableHead>
                          <TableHead>CNPJ</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Taxa</TableHead>
                          <TableHead>Cadastro</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmpresas.map((empresa) => (
                          <TableRow key={empresa.id}>
                            <TableCell className="font-medium">
                              {empresa.nomeFantasia}
                            </TableCell>
                            <TableCell>{empresa.nomeProprietario || '-'}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {formatCNPJ(empresa.cnpjEmpresa)}
                            </TableCell>
                            <TableCell>
                              {empresa.cidadeEmpresa && empresa.estadoEmpresa
                                ? `${empresa.cidadeEmpresa}/${empresa.estadoEmpresa}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {empresa.taxaVendaPercentual
                                ? `${empresa.taxaVendaPercentual}%`
                                : '5%'}
                            </TableCell>
                            <TableCell>{formatDate(empresa.dtCadastro)}</TableCell>
                            <TableCell>
                              {empresa.statusEmpresa ? (
                                <Badge className="bg-green-600">Aprovada</Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEmpresa(empresa);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  Detalhes
                                </Button>
                                {!empresa.statusEmpresa && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEmpresa(empresa);
                                      setShowApproveDialog(true);
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEmpresa(empresa);
                                    setNovaTaxa(
                                      empresa.taxaVendaPercentual?.toString() || '5'
                                    );
                                    setShowTaxDialog(true);
                                  }}
                                >
                                  <Percent className="h-4 w-4" />
                                </Button>
                                {empresa.statusEmpresa && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedEmpresa(empresa);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialog: Detalhes */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Empresa</DialogTitle>
            </DialogHeader>
            {selectedEmpresa && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome Fantasia</Label>
                    <p className="font-medium">{selectedEmpresa.nomeFantasia}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CNPJ</Label>
                    <p className="font-mono">{formatCNPJ(selectedEmpresa.cnpjEmpresa)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Proprietário</Label>
                    <p>{selectedEmpresa.nomeProprietario || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {selectedEmpresa.statusEmpresa ? (
                        <Badge className="bg-green-600">Aprovada</Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p>{selectedEmpresa.descricaoEmpresa || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <p className="text-sm">{selectedEmpresa.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Telefone</Label>
                      <p className="text-sm">{selectedEmpresa.telefone || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-muted-foreground text-xs">Endereço</Label>
                    <p className="text-sm">
                      {selectedEmpresa.enderecoEmpresa || '-'}
                      {selectedEmpresa.cidadeEmpresa && (
                        <>
                          <br />
                          {selectedEmpresa.cidadeEmpresa}/{selectedEmpresa.estadoEmpresa}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Cadastro</Label>
                      <p className="text-sm">{formatDate(selectedEmpresa.dtCadastro)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground text-xs">Taxa de Venda</Label>
                      <p className="text-sm">
                        {selectedEmpresa.taxaVendaPercentual || 5}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Aprovar */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprovar Empresa</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja aprovar a empresa{' '}
                <strong>{selectedEmpresa?.nomeFantasia}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAprovar}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Rejeitar */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desativar Empresa</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja desativar a empresa{' '}
                <strong>{selectedEmpresa?.nomeFantasia}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejeitar}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Desativando...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Atualizar Taxa */}
        <Dialog open={showTaxDialog} onOpenChange={setShowTaxDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar Taxa de Venda</DialogTitle>
              <DialogDescription>
                Altere a taxa de venda para <strong>{selectedEmpresa?.nomeFantasia}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taxa">Taxa de Venda (%)</Label>
                <Input
                  id="taxa"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={novaTaxa}
                  onChange={(e) => setNovaTaxa(e.target.value)}
                  placeholder="Ex: 5.00"
                />
                <p className="text-sm text-muted-foreground">
                  Valor atual: {selectedEmpresa?.taxaVendaPercentual || 5}%
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTaxDialog(false);
                  setNovaTaxa('');
                }}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button onClick={handleAtualizarTaxa} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Taxa'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
