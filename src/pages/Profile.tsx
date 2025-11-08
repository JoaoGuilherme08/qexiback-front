import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";
const Profile = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Estado inicial dos dados do usuário (mock)
  const [userData, setUserData] = useState({
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    address: "São Paulo, SP",
    joinDate: "Janeiro 2024",
    avatar: ""
  });

  // Estado temporário para edição
  const [editData, setEditData] = useState({
    ...userData
  });
  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      ...userData
    });
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      ...userData
    });
  };
  const handleSave = () => {
    setUserData({
      ...editData
    });
    setIsEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso."
    });
  };
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header do Perfil */}
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{userData.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Membro desde {userData.joinDate}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Gerencie seus dados cadastrais</CardDescription>
                </div>
                {!isEditing ? <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button> : <div className="flex gap-2">
                    <Button onClick={handleSave} variant="default" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
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
                {isEditing ? <Input id="name" value={editData.name} onChange={e => setEditData({
                ...editData,
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
                {isEditing ? <Input id="email" type="email" value={editData.email} onChange={e => setEditData({
                ...editData,
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
                {isEditing ? <Input id="phone" value={editData.phone} onChange={e => setEditData({
                ...editData,
                phone: e.target.value
              })} /> : <p className="text-muted-foreground">{userData.phone}</p>}
              </div>

              <Separator />

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localização
                </Label>
                {isEditing ? <Input id="address" value={editData.address} onChange={e => setEditData({
                ...editData,
                address: e.target.value
              })} /> : <p className="text-muted-foreground">{userData.address}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Conta */}
          
        </div>
      </main>

      <Footer />
    </div>;
};
export default Profile;