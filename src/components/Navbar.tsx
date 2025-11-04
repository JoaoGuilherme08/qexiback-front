import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Store, Heart, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
interface NavbarProps {
  userType?: "user" | "store" | "institution" | null;
  onLogout?: () => void;
}
export const Navbar = ({
  userType = null,
  onLogout
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
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
    label: "Dashboard",
    icon: Store
  }, {
    path: "/store/products",
    label: "Produtos",
    icon: Store
  }];
  const institutionLinks = [{
    path: "/institution/dashboard",
    label: "Dashboard",
    icon: Heart
  }, {
    path: "/institution/profile",
    label: "Perfil",
    icon: User
  }];
  const links = userType === "store" ? storeLinks : userType === "institution" ? institutionLinks : userLinks;
  return <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 bg-[#281f56]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={userType ? "/home" : "/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Wallet className="#00EA7C" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-[#00ea7c]">
              Qexiback
            </span>
          </Link>

          {/* Desktop Navigation */}
          {userType && <div className="hidden md:flex items-center gap-1">
              {links.map(link => {})}
            </div>}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!userType ? <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </> : <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
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
            {userType && <div className="flex flex-col gap-2 mb-4">
                {links.map(link => <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive(link.path) ? "default" : "ghost"} className="w-full justify-start gap-2" size="sm">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>)}
              </div>}
            <div className="flex flex-col gap-2">
              {!userType ? <>
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
                </> : <Button variant="outline" onClick={onLogout} className="w-full gap-2">
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>}
            </div>
          </div>}
      </div>
    </nav>;
};