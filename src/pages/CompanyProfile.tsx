import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Calendar, Edit2, Save, X, User } from "lucide-react";
import { apiService } from "@/services/api";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estado inicial dos dados do usuário
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    cpfCnpj: ""
  });

  // Estado inicial dos dados da empresa
  const [companyData, setCompanyData] = useState({
    id: "",
    nomeFantasia: "",
    cnpjEmpresa: "",
    email: "",
    phone: "",
    address: ""
  });

  // Estado temporário para edição
  const [editUserData, setEditUserData] = useState({
    ...userData
  });

  const [editCompanyData, setEditCompanyData] = useState({
    ...companyData
  });

  const [editingUser, setEditingUser] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);

  // Carregar dados da empresa do backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        
        // Obter token do localStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Validar token e obter dados
        const response = await apiService.validateToken(token);
        
        if (response.data && (response.data.tipoUsuario === "EMPRESA" || response.data.tipoUsuario === "ADMINISTRADOR_EMPRESA")) {
          const data = response.data;

          // Dados do usuário
          const newUserData = {
            id: data.userId || "",
            name: data.nome || "",
            email: data.email || "",
            phone: data.telefone || "",
            address: data.endereco || "",
            cpfCnpj: data.cpfCnpj || ""
          };

          // Dados da empresa
          const newCompanyData = {
            id: data.empresaId || "",
            nomeFantasia: data.nomeFantasia || "",
            cnpjEmpresa: data.cnpjEmpresa || "",
            email: data.email || "",
            phone: data.telefone || "",
            address: data.endereco || ""
          };

          setUserData(newUserData);
          setEditUserData(newUserData);
          setCompanyData(newCompanyData);
          setEditCompanyData(newCompanyData);
        } else {
          toast({
            title: "Acesso Negado",
            description: "Apenas empresas podem acessar este perfil.",
            variant: "destructive"
          });
          navigate("/profile");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
        navigate("/profile");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [navigate, toast]);

  const handleEditUser = () => {
    setEditingUser(true);
    setEditUserData({ ...userData });
  };

  const handleCancelUser = () => {
    setEditingUser(false);
    setEditUserData({ ...userData });
  };

  const handleSaveUser = async () => {
    try {
      const updatedUser = await apiService.atualizarUsuario(userData.id, {
        nome: editUserData.name,
        email: editUserData.email,
        telefone: editUserData.phone,
        endereco: editUserData.address,
        cpfCnpj: editUserData.cpfCnpj,
      });

      const newUserData = {
        id: userData.id,
        name: updatedUser.nome,
        email: updatedUser.email,
        phone: updatedUser.telefone || "",
        address: updatedUser.endereco || "",
        cpfCnpj: updatedUser.cpfCnpj || ""
      };
      
      setUserData(newUserData);
      setEditUserData(newUserData);
      setEditingUser(false);
      
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram salvos com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditCompany = () => {
    setEditingCompany(true);
    setEditCompanyData({ ...companyData });
  };

  const handleCancelCompany = () => {
    setEditingCompany(false);
    setEditCompanyData({ ...companyData });
  };

  const handleSaveCompany = async () => {
    try {
      const updatedUser = await apiService.atualizarUsuario(userData.id, {
        nome: editCompanyData.nomeFantasia,
        email: editCompanyData.email,
        telefone: editCompanyData.phone,
        endereco: editCompanyData.address,
        cpfCnpj: companyData.cnpjEmpresa,
      });

      const newCompanyData = {
        id: companyData.id,
        nomeFantasia: updatedUser.nome,
        cnpjEmpresa: companyData.cnpjEmpresa,
        email: updatedUser.email,
        phone: updatedUser.telefone || "",
        address: updatedUser.endereco || ""
      };
      
      setCompanyData(newCompanyData);
      setEditCompanyData(newCompanyData);
      setEditingCompany(false);
      
      toast({
        title: "Perfil atualizado",
        description: "Os dados da empresa foram salvos com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar os dados da empresa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil da empresa...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="user" />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-lg flex items-center justify-center bg-[#00ea7c]">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">{companyData.nomeFantasia}</CardTitle>
            </CardHeader>
          </Card>

          {/* Informações Pessoais (tb_usuarios) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Dados do usuário (tb_usuarios)</CardDescription>
                </div>
                {!editingUser ? <Button onClick={handleEditUser} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button> : <div className="flex gap-2">
                    <Button onClick={handleSaveUser} variant="default" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancelUser} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                {editingUser ? <Input id="name" value={editUserData.name} onChange={e => setEditUserData({
                  ...editUserData,
                  name: e.target.value
                })} /> : <p className="text-muted-foreground">{userData.name}</p>}
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                {editingUser ? <Input id="email" type="email" value={editUserData.email} onChange={e => setEditUserData({
                  ...editUserData,
                  email: e.target.value
                })} /> : <p className="text-muted-foreground">{userData.email}</p>}
              </div>

              <Separator />

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                {editingUser ? (
                  <InputMask
                    mask="(99) 99999-9999"
                    value={editUserData.phone}
                    onChange={e => setEditUserData({
                      ...editUserData,
                      phone: e.target.value
                    })}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="phone"
                        placeholder="(00) 00000-0000"
                      />
                    )}
                  </InputMask>
                ) : (
                  <p className="text-muted-foreground">{userData.phone || "Não informado"}</p>
                )}
              </div>

              <Separator />

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </Label>
                {editingUser ? <Input id="address" value={editUserData.address} onChange={e => setEditUserData({
                  ...editUserData,
                  address: e.target.value
                })} /> : <p className="text-muted-foreground">{userData.address || "Não informado"}</p>}
              </div>

              <Separator />

              {/* CPF/CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  CPF/CNPJ
                </Label>
                <p className="text-muted-foreground">{userData.cpfCnpj || "Não informado"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Empresa (tb_empresas) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações Empresa</CardTitle>
                  <CardDescription>Dados da empresa (tb_empresas)</CardDescription>
                </div>
                {!editingCompany ? <Button onClick={handleEditCompany} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button> : <div className="flex gap-2">
                    <Button onClick={handleSaveCompany} variant="default" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancelCompany} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome Fantasia */}
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nome Fantasia
                </Label>
                {editingCompany ? <Input id="nomeFantasia" value={editCompanyData.nomeFantasia} onChange={e => setEditCompanyData({
                  ...editCompanyData,
                  nomeFantasia: e.target.value
                })} /> : <p className="text-muted-foreground">{companyData.nomeFantasia}</p>}
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                {editingCompany ? <Input id="email" type="email" value={editCompanyData.email} onChange={e => setEditCompanyData({
                  ...editCompanyData,
                  email: e.target.value
                })} /> : <p className="text-muted-foreground">{companyData.email}</p>}
              </div>

              <Separator />

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                {editingCompany ? (
                  <InputMask
                    mask="(99) 99999-9999"
                    value={editCompanyData.phone}
                    onChange={e => setEditCompanyData({
                      ...editCompanyData,
                      phone: e.target.value
                    })}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="phone"
                        placeholder="(00) 00000-0000"
                      />
                    )}
                  </InputMask>
                ) : (
                  <p className="text-muted-foreground">{companyData.phone || "Não informado"}</p>
                )}
              </div>

              <Separator />

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </Label>
                {editingCompany ? <Input id="address" value={editCompanyData.address} onChange={e => setEditCompanyData({
                  ...editCompanyData,
                  address: e.target.value
                })} /> : <p className="text-muted-foreground">{companyData.address || "Não informado"}</p>}
              </div>

              <Separator />

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  CNPJ
                </Label>
                <p className="text-muted-foreground">{companyData.cnpjEmpresa || "Não informado"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};

export default CompanyProfile;
