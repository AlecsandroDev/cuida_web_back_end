import { useState } from "react";
import { login } from "../services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Eye, EyeOff, ArrowLeft, Heart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginCli() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ cpf: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await login(formData);
      localStorage.setItem("token", res.data.token);
      navigate("/PortalCidadao");
    } catch {
      alert("Credenciais inválidas!");
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-secondary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Voltar ao início */}
        <button 
          onClick={() => navigate("/")} 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-all duration-300 hover:gap-3 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </button>

        {/* Header da logo */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl animate-scale-in">
            <Heart className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground font-poppins">Portal do Cidadão</h1>
            <p className="text-sm text-muted-foreground font-medium">Secretaria de Saúde • Marília/SP</p>
          </div>
        </div>

        <Card className="shadow-2xl border border-border/50 bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-10 px-8 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20 shadow-lg">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground font-poppins mb-2">Bem-vindo!</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Entre com suas credenciais para acessar
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6 mt-2">
              <div className="space-y-3">
                <Label htmlFor="cpf" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  CPF
                </Label>
                <Input 
                  id="cpf" 
                  type="text" 
                  placeholder="000.000.000-00" 
                  value={formData.cpf} 
                  onChange={e => setFormData({...formData, cpf: e.target.value})} 
                  className="h-12 rounded-xl border-2 border-border/50 focus:border-primary transition-colors bg-background/50" 
                  required 
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Senha
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Digite sua senha" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-primary transition-colors bg-background/50 pr-12" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-primary text-white hover:opacity-90 h-14 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] mt-8 text-base"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Entrar no Portal
                    <Users className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Primeira vez aqui?{" "}
                <Link to="/clientes/cadastroClientes" className="text-primary hover:text-primary/80 font-semibold underline decoration-2 underline-offset-4 transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Portal oficial da Secretaria de Saúde de Marília<br />
                Seus dados estão protegidos e seguros
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}