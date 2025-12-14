import { Link } from "react-router-dom";
import { Wallet, Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Qexiback</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Transforme suas compras em impacto social. Cashback que faz a diferença.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Para Você</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/home" className="hover:text-accent transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-accent transition-colors">
                  Minha Carteira
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-accent transition-colors">
                  Meu Perfil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Para Empresas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/store/dashboard" className="hover:text-accent transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Seja Parceiro
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2025 Qexiback. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-accent transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
