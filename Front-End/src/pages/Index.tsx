import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Activity, Shield, MapPin, Clock, Stethoscope, Bot, TrendingUp, Award } from "lucide-react";
import roboticHand from "@/assets/robotic-hand-medical.png";
import logoSecretaria from "@/assets/logo-secretaria-saude-marilia.png";
const HomePage = () => {
  return <div className="min-h-screen bg-gradient-to-b from-background to-surface">
      <nav className="relative z-10 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground font-poppins">CUIDA</div>
              <div className="text-xs text-muted-foreground mx-2">|</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <img 
                  src={logoSecretaria} 
                  alt="Secretaria de Saúde de Marília" 
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-medium px-4 py-2 rounded-full text-sm border border-primary/20">
                  <Bot className="w-4 h-4" />
                  Sistema Mais Avançado de Gestão de Medicamentos
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-[1.1] font-poppins">
                  Revolucionando
                  <br />
                  <span className="bg-gradient-to-r from-primary via-secondary to-cuida-green bg-clip-text text-transparent">
                    Gestão de Saúde
                  </span> com IA
                </h1>
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Transforme a gestão de medicamentos com o CUIDA. Tenha controle de estoque em tempo real, 
                logística otimizada entre unidades e transparência total para o cidadão. Conectamos gestores 
                de saúde e cidadãos de Marília.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link to="/clientes/loginClientes">
                  <Button size="lg" className="bg-gradient-primary text-white hover:opacity-90 rounded-xl px-8 py-4 text-base font-medium flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto">
                    <Stethoscope className="w-5 h-5" />
                    Consultar Medicamentos
                  </Button>
                </Link>
                <Link to="/login">
                  
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 flex justify-center">
                
              </div>

              <Card className="absolute top-8 right-0 bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl p-5 w-56 animate-float border border-primary/10">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full border-3 border-background shadow-lg"></div>
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary to-success rounded-full border-3 border-background shadow-lg"></div>
                      <div className="w-10 h-10 bg-gradient-to-br from-accent to-warning rounded-full border-3 border-background shadow-lg"></div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground font-poppins">300+</div>
                      <div className="text-sm text-muted-foreground font-medium">Gestores Especializados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute top-48 right-8 bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl p-5 w-60 animate-float-delayed border border-secondary/10">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                      <TrendingUp className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground font-poppins">5,000+</div>
                      <div className="text-sm text-muted-foreground font-medium">Medicamentos Controlados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute bottom-16 left-8 bg-card/80 backdrop-blur-sm shadow-2xl rounded-2xl p-5 w-52 animate-float border border-success/10">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                      <Award className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground font-poppins">100%</div>
                      <div className="text-sm text-muted-foreground font-medium">Transparência</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-poppins">Funcionalidades Principais</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubra como o CUIDA está transformando o acesso à saúde através da tecnologia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-primary/10 hover:border-primary/20 bg-gradient-to-b from-card to-card/50">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                  <Stethoscope className="w-9 h-9 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-poppins text-foreground">Portal do Cidadão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Consulte medicamentos disponíveis, localize unidades de saúde e acompanhe seu histórico médico com facilidade.
                </p>
                <div className="flex items-center justify-center gap-2 mt-6 text-primary">
                  <MapPin className="w-4 h-4" />
                  <Clock className="w-4 h-4" />
                  <Heart className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-secondary/10 hover:border-secondary/20 bg-gradient-to-b from-card to-card/50">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-secondary/20">
                  <Users className="w-9 h-9 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-poppins text-foreground">Gestão Inteligente</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ferramentas avançadas para gestores controlarem estoque e otimizarem a distribuição de medicamentos.
                </p>
                <div className="flex items-center justify-center gap-2 mt-6 text-secondary">
                  <TrendingUp className="w-4 h-4" />
                  <Activity className="w-4 h-4" />
                  <Shield className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="group p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/10 hover:border-accent/20 bg-gradient-to-b from-card to-card/50">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-accent/20">
                  <Bot className="w-9 h-9 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-poppins text-foreground">Dados Centralizados</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dashboards consolidados para tomada de decisão, agendamento de entregas entre unidades e documentação 100% digital para auditoria.
                </p>
                <div className="flex items-center justify-center gap-2 mt-6 text-accent">
                  <Bot className="w-4 h-4" />
                  <TrendingUp className="w-4 h-4" />
                  <Award className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>;
};
export default HomePage;