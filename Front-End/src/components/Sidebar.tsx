import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { logout } from "../services/auth";
import { User, Map, Pill, Home, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string;
  userPhoto?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName = "Usuário", userPhoto }) => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const menuItems = [
    { title: "Início", icon: Home, path: "/PortalCidadao" },
    { title: "Perfil", icon: User, path: "/Profile" },
    { title: "Mapa de Unidades", icon: Map, path: "/mapa" },
    { title: "Consultar Medicamentos", icon: Pill, path: "/mapa" },
  ];
   const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen fixed top-0 left-0 z-10">
      {/* Cabeçalho do Portal */}
      <div className="flex items-center p-4 border-b bg-background">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-2">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
            Portal do Cidadão
          </h1>
          <p className="text-xs text-muted-foreground">Marília - SP</p>
        </div>
      </div>

      {/* Conteúdo rolável */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé / Logout */}
        <div className="p-4 border-t">
          <Link to="/profile" className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              {userPhoto ? (
                <AvatarImage src={userPhoto} alt={userName} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout} 
          >
            <LogOut className="mr-2 h-4 w-4" />
            LOGOUT
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
