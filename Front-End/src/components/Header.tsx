import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import cuidaLogo from "@/assets/cuida-logo.png";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={cuidaLogo} alt="CUIDA Logo" className="w-10 h-10 rounded-lg shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-primary">CUIDA</h1>
              <p className="text-xs text-muted-foreground">Sistema de Cuidados</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-foreground hover:text-primary transition-colors font-medium">
              CUIDA
            </a>
            <a href="#gestores" className="text-foreground hover:text-primary transition-colors font-medium">
              Gestores
            </a>
            <a href="#tecnologia" className="text-foreground hover:text-primary transition-colors font-medium">
              Tecnologia
            </a>
            <a href="#departamentos" className="text-foreground hover:text-primary transition-colors font-medium">
              Departamentos
            </a>
            <Link to="/portal-cidadao" className="text-foreground hover:text-primary transition-colors font-medium">
              Portal do Cidadão
            </Link>
            <a href="#contato" className="text-foreground hover:text-primary transition-colors font-medium">
              Contato
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">
              Entrar
            </Button>
            <Button variant="hero">
              Começar Agora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-4">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                CUIDA
              </a>
              <a href="#gestores" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Gestores
              </a>
              <a href="#tecnologia" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Tecnologia
              </a>
              <a href="#departamentos" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Departamentos
              </a>
              <Link to="/portal-cidadao" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Portal do Cidadão
              </Link>
              <a href="#contato" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Contato
              </a>
              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setIsMenuOpen(false)}>
                  Entrar
                </Button>
                <Button variant="hero" onClick={() => setIsMenuOpen(false)}>
                  Começar Agora
                </Button>
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;