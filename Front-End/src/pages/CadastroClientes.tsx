import { useState } from "react";
import { register } from "../services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ArrowLeft, Heart, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function CadastroClientes() {
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    endereco: "",
    cpf: "",
    rg: "",
    email: "",
    telefone: "",
    carteirinha: "",
    tipoSanguineo: "",
    medicamentosRestritos: "",
    diagnosticos: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { id, value, checked, type } = e.target;

    if (id === "cpf" || id === "telefone") {
      value = value.replace(/\D/g, ""); // Remove tudo que não é número
    }

    if (type === "checkbox") {
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const requiredFields = ["nome", "idade", "endereco", "cpf", "rg", "email", "telefone", "password"];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!formData.acceptTerms) {
      alert("Você deve aceitar os termos de uso.");
      return;
    }

    try {
      await register(formData);
      navigate("/clientes/loginClientes");

      alert("Conta criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert(err.response.data.message);
    } 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-surface to-primary/5 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-5xl relative z-10 animate-fade-in">
        {/* Voltar ao login */}
        <button
          onClick={() => navigate("/clientes/loginClientes")}
          className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 mb-8 transition-all duration-300 hover:gap-3 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </button>

        {/* Header da logo */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-xl animate-scale-in">
            <Heart className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground font-poppins">Portal do Cidadão</h1>
            <p className="text-sm text-muted-foreground font-medium">Secretaria de Saúde • Marília/SP</p>
          </div>
        </div>

        <Card className="shadow-2xl border border-border/50 bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-10 px-8 bg-gradient-to-b from-secondary/5 to-transparent">
            <div className="w-24 h-24 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-secondary/20 shadow-lg">
              <Users className="w-12 h-12 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground font-poppins mb-2">Criar sua Conta</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Preencha seus dados para ter acesso completo ao portal
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Seção: Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="nome" className="text-sm font-semibold text-foreground">Nome completo *</Label>
                    <Input 
                      id="nome" 
                      value={formData.nome} 
                      onChange={handleChange} 
                      placeholder="Seu nome completo" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="idade" className="text-sm font-semibold text-foreground">Idade *</Label>
                    <Input 
                      id="idade" 
                      type="number"
                      value={formData.idade} 
                      onChange={handleChange} 
                      placeholder="Ex: 35" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm font-semibold text-foreground">CPF *</Label>
                    <Input 
                      id="cpf" 
                      value={formData.cpf} 
                      onChange={handleChange} 
                      placeholder="000.000.000-00" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rg" className="text-sm font-semibold text-foreground">RG *</Label>
                    <Input 
                      id="rg" 
                      value={formData.rg} 
                      onChange={handleChange} 
                      placeholder="00.000.000-0" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="seu@email.com" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-sm font-semibold text-foreground">Telefone *</Label>
                    <Input 
                      id="telefone" 
                      value={formData.telefone} 
                      onChange={handleChange} 
                      placeholder="(00) 00000-0000" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="endereco" className="text-sm font-semibold text-foreground">Endereço completo *</Label>
                    <Input 
                      id="endereco" 
                      value={formData.endereco} 
                      onChange={handleChange} 
                      placeholder="Rua, número, bairro, cidade" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                      required 
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção: Informações de Saúde */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  Informações de Saúde
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="carteirinha" className="text-sm font-semibold text-foreground">Carteirinha do SUS</Label>
                    <Input 
                      id="carteirinha" 
                      value={formData.carteirinha} 
                      onChange={handleChange} 
                      placeholder="Número da carteirinha" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoSanguineo" className="text-sm font-semibold text-foreground">Tipo sanguíneo</Label>
                    <Input 
                      id="tipoSanguineo" 
                      value={formData.tipoSanguineo} 
                      onChange={handleChange} 
                      placeholder="Ex: A+, O-, B+" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="medicamentosRestritos" className="text-sm font-semibold text-foreground">Medicamentos restritos</Label>
                    <Input 
                      id="medicamentosRestritos" 
                      value={formData.medicamentosRestritos} 
                      onChange={handleChange} 
                      placeholder="Medicamentos que não pode tomar" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="diagnosticos" className="text-sm font-semibold text-foreground">Problemas de saúde ou diagnósticos</Label>
                    <Input 
                      id="diagnosticos" 
                      value={formData.diagnosticos} 
                      onChange={handleChange} 
                      placeholder="Informe problemas de saúde conhecidos" 
                      className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção: Senha */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  Criar Senha de Acesso
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">Senha *</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Crie uma senha segura" 
                        className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50 pr-12"
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirmar senha *</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        placeholder="Digite a senha novamente" 
                        className="h-12 rounded-xl border-2 border-border/50 focus:border-secondary transition-colors bg-background/50 pr-12"
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox de termos de uso */}
              <div className="flex items-start space-x-3 p-5 rounded-xl bg-secondary/5 border-2 border-secondary/20">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: !!checked })}
                  className="mt-1"
                />
                <Label htmlFor="acceptTerms" className="text-sm text-foreground leading-relaxed cursor-pointer">
                  Aceito os{" "}
                  <Link to="/termos-de-uso" className="text-secondary hover:text-secondary/80 font-semibold underline decoration-2 underline-offset-2">
                    termos de uso e política de privacidade
                  </Link>{" "}
                  do Portal do Cidadão
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-secondary text-white hover:opacity-90 h-14 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] text-base" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Cadastrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Criar Conta
                    <Users className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/clientes/loginClientes" className="text-secondary hover:text-secondary/80 font-semibold underline decoration-2 underline-offset-4 transition-colors">
                  Faça login
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Seus dados estão protegidos e serão utilizados apenas para prestação de serviços de saúde<br />
                conforme nossa política de privacidade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}