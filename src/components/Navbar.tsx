import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Store, Heart, Menu, X, LogOut, User, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { clearStoredAuth } from "@/utils/auth";

interface NavbarProps {
  userType?: "user" | "store" | "institution" | null;
}

export const Navbar = ({
  userType = null
}: NavbarProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userTipoUsuario, setUserTipoUsuario] = useState<string | null>(null);
  const [storedUserType, setStoredUserType] = useState<NavbarProps["userType"]>(null);
  const [hasEmpresa, setHasEmpresa] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  // Verificar tipo de usuário do localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserTipoUsuario(parsed.tipoUsuario);
        // Verificar se o usuário tem uma empresa associada
        if (parsed.empresaId || parsed.tipoUsuario === "EMPRESA" || parsed.tipoUsuario === "ADMINISTRADOR_EMPRESA" || parsed.tipoUsuario === "MEMBRO_EMPRESA") {
          setHasEmpresa(true);
        }
      } catch (error) {
        console.error("Erro ao parsear userData:", error);
      }
    }
  }, []);

  useEffect(() => {
    const savedUserType = localStorage.getItem("userType");
    if (savedUserType === "user" || savedUserType === "store" || savedUserType === "institution") {
      setStoredUserType(savedUserType);
    } else {
      setStoredUserType(null);
    }
  }, []);

  const effectiveUserType = userType ?? storedUserType;
  
  // Verificar se usuário está autenticado
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userLinks = [{
    path: "/home",
    label: "Ofertas",
    icon: Store
  }, {
    path: "/wallet",
    label: "Carteira",
    icon: Wallet
  }, {
    path: "/profile",
    label: "Perfil",
    icon: User
  }];
  
  const storeLinks = [{
    path: "/store/dashboard",
    label: "Dashboard Loja",
    icon: Store
  }, {
    path: "/store/products",
    label: "Meus Produtos",
    icon: Store
  }];
  const adminCompanyLinks = !hasEmpresa ? [{
    path: "/company/create",
    label: "Cadastrar Empresa",
    icon: Store
  }, {
    path: "/company/users",
    label: "Usuários da Empresa",
    icon: Users
  }] : [{
    path: "/company/users",
    label: "Usuários da Empresa",
    icon: Users
  }];
  
  const institutionLinks = [{
    path: "/institution/dashboard",
    label: "Dashboard",
    icon: Heart
  }, {
    path: "/profile",
    label: "Perfil",
    icon: User
  }];

  const isAdminEmpresa = userTipoUsuario === "ADMINISTRADOR_EMPRESA";
  const isStoreUser = isAdminEmpresa || userTipoUsuario === "EMPRESA" || effectiveUserType === "store";

  let links = userLinks;
  if (effectiveUserType === "institution") {
    links = institutionLinks;
  } else if (isStoreUser) {
    links = [...userLinks, ...storeLinks];
    if (isAdminEmpresa) {
      links = [...links, ...adminCompanyLinks];
    }
  }
  
  const handleLogout = () => {
    clearStoredAuth();
    navigate("/login");
  };

  return <nav className="sticky top-0 z-50 w-full bg-[#281f56] border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={effectiveUserType ? "/home" : "/"} className="flex items-center gap-2 group">
            
            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-[#00ea7c]">
              Qexiback
            </span>
          </Link>

          {/* Desktop Navigation */}
          {effectiveUserType && <div className="hidden md:flex items-center gap-1">
              {links.map(link => <Link key={link.path} to={link.path}>
                  <Button variant={isActive(link.path) ? "default" : "ghost"} size="sm" className="gap-2 bg-[#f4efea] text-[#281f56]">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>)}
            </div>}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="bg-[#f4efea]">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </> : <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-[#00ea7c] text-[#281f56]">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top">
            {effectiveUserType && <div className="flex flex-col gap-2 mb-4">
                {links.map(link => <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive(link.path) ? "default" : "ghost"} className="w-full justify-start gap-2" size="sm">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>)}
              </div>}
            <div className="flex flex-col gap-2">
              {!isAuthenticated ? <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full">
                      Cadastrar
                    </Button>
                  </Link>
                </> : <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>}
            </div>
          </div>}
      </div>
    </nav>;
};