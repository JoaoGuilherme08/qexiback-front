import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, AlertCircle, Copy, Check, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { transacaoService, type Transacao } from "@/services/api";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

export const MyPurchases = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Filtros e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Verificar se o usuário é cliente
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Redirecionar se não for cliente
        if (user.tipoUsuario !== "CLIENTE") {
          navigate("/home");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error);
        navigate("/home");
        return;
      }
    }
    
    fetchCompras();
  }, [navigate]);

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const user = JSON.parse(userData);
      console.log("User data:", user); // Debug
      
      // O campo correto é userId (vem do LoginResponse)
      const usuarioId = user.userId;
      
      if (!usuarioId) {
        console.error("ID do usuário não encontrado. Dados completos:", user);
        throw new Error("ID do usuário não encontrado");
      }
      
      console.log("Buscando compras para usuarioId:", usuarioId); // Debug
      const transacoes = await transacaoService.listarTransacoesPorUsuario(usuarioId);
      // Ordenar por data de compra (mais recentes primeiro)
      const sortedTransacoes = transacoes.sort((a, b) => 
        new Date(b.dtCompra).getTime() - new Date(a.dtCompra).getTime()
      );
      setCompras(sortedTransacoes);
    } catch (err) {
      console.error("Erro ao buscar compras:", err);
      setError("Não foi possível carregar suas compras. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: Transacao['statusTransacao']) => {
    const statusConfig = {
      PENDENTE: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", variant: "default" as const, icon: Clock },
      PAGO: { label: "Pago", variant: "default" as const, icon: CheckCircle },
      LIBERADO: { label: "Liberado", variant: "default" as const, icon: Package },
      CANCELADO: { label: "Cancelado", variant: "destructive" as const, icon: XCircle },
      EXPIRADO: { label: "Expirado", variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.PENDENTE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filtrar e paginar compras usando useMemo para performance
  const filteredAndPaginatedCompras = useMemo(() => {
    let filtered = compras;

    // Filtro por busca (nome do produto ou empresa)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (compra) =>
          compra.nomeProduto?.toLowerCase().includes(lowerSearch) ||
          compra.nomeFantasiaEmpresa?.toLowerCase().includes(lowerSearch) ||
          compra.codigoRetirada?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((compra) => compra.statusTransacao === statusFilter);
    }

    // Calcular paginação
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalItems: filtered.length,
      totalPages,
      currentPage,
    };
  }, [compras, searchTerm, statusFilter, currentPage]);

  // Reset para primeira página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar userType="user" />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando suas compras...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="user" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Minhas Compras</h1>
          </div>
          <p className="text-muted-foreground">
            Acompanhe seus pedidos e códigos de retirada
          </p>
        </div>

        {/* Filtros e Busca */}
        {!error && compras.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Busca */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por produto, empresa ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro por Status */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                      <SelectItem value="LIBERADO">Liberado</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      <SelectItem value="EXPIRADO">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contador de resultados */}
              <div className="mt-4 text-sm text-muted-foreground">
                Mostrando {filteredAndPaginatedCompras.items.length} de {filteredAndPaginatedCompras.totalItems} compra(s)
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Nenhuma compra */}
        {!error && compras.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma compra encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não realizou nenhuma compra.
                </p>
                <Button onClick={() => window.location.href = "/home"}>
                  Ver Ofertas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Filtros não retornaram resultados */}
        {!error && compras.length > 0 && filteredAndPaginatedCompras.totalItems === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar os filtros ou termo de busca.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Compras */}
        {filteredAndPaginatedCompras.items.length > 0 && (
          <>
            <div className="grid gap-6">
              {filteredAndPaginatedCompras.items.map((compra) => (
                <Card key={compra.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{compra.nomeProduto}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {compra.nomeFantasiaEmpresa}
                        </p>
                      </div>
                      {getStatusBadge(compra.statusTransacao)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      {/* Código de Retirada - Destaque Principal */}
                      {(compra.statusTransacao === 'PAGO' || compra.statusTransacao === 'LIBERADO') && (
                    <div className="bg-primary/5 border-2 border-primary rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Código de Retirada
                          </p>
                          <p className="text-3xl font-bold text-primary font-mono tracking-wider">
                            {compra.codigoRetirada}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {compra.statusTransacao === 'LIBERADO' 
                              ? '✓ Produto já retirado' 
                              : 'Apresente este código na loja para retirar seu produto'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(compra.codigoRetirada)}
                          className="ml-4"
                        >
                          {copiedCode === compra.codigoRetirada ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Informações da Compra */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data da Compra</p>
                      <p className="font-medium">{formatDate(compra.dtCompra)}</p>
                    </div>

                    {compra.dtLiberacao && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Data de Retirada</p>
                        <p className="font-medium">{formatDate(compra.dtLiberacao)}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valor Pago</p>
                      <p className="font-medium text-lg">{formatCurrency(compra.valorCompra)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cashback Ganho</p>
                      <p className="font-medium text-lg text-[#00ea7c]">
                        {formatCurrency(compra.valorCashback)}
                      </p>
                    </div>
                  </div>

                  {/* Status Aguardando Pagamento */}
                  {compra.statusTransacao === 'AGUARDANDO_PAGAMENTO' && compra.pixExpiresAt && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            Aguardando Pagamento
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Expira em: {formatDate(compra.pixExpiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Cancelado/Expirado */}
                  {(compra.statusTransacao === 'CANCELADO' || compra.statusTransacao === 'EXPIRADO') && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            {compra.statusTransacao === 'CANCELADO' ? 'Compra Cancelada' : 'Pagamento Expirado'}
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {compra.statusTransacao === 'CANCELADO' 
                              ? 'Esta compra foi cancelada e o valor será estornado.'
                              : 'O prazo para pagamento expirou. Faça uma nova compra se desejar.'}
                          </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {filteredAndPaginatedCompras.totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Página {filteredAndPaginatedCompras.currentPage} de {filteredAndPaginatedCompras.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(filteredAndPaginatedCompras.totalPages, prev + 1))}
                    disabled={currentPage === filteredAndPaginatedCompras.totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </>
      )}
      </main>

      <Footer />
    </div>
  );
};
