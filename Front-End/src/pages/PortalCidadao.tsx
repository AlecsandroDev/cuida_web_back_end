import { Map, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HealthCampaignCard from "@/components/HealthCampaignCard";
import outuroRosaImg from "@/assets/outubro-rosa.png";
import vaccinationImg from "@/assets/vaccination.png";
import aleitamentoImg from "@/assets/aleitamento.png";
import escorpiaoImg from "@/assets/escorpiao.png";
import carretasImg from "@/assets/carretas-mamografia.png";
import novembroAzulImg from "@/assets/novembro-azul.png";
import denuncieImg from "@/assets/Denuncie.png";
import dentista from "@/assets/dentista.png";


const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-white to-blue-200">
         <div className="flex">
        <Sidebar />
        
        <main className="flex-1 px-4 py-12 md:px-8">
          {/* Hero Section */}
          <section className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bem-vindo ao Portal do Cidadão
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Aqui você pode encontrar informações sobre unidades de saúde, consultar disponibilidade de medicamentos e muito mais.
            </p>
          </section>

          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Localize Unidades de Saúde
                  </CardTitle>
                  <CardDescription>
                    Use nosso mapa interativo para encontrar a unidade de saúde mais próxima de você.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/mapa">Ver Mapa</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-secondary" />
                    Consulte Medicamentos
                  </CardTitle>
                  <CardDescription>
                    Verifique a disponibilidade de medicamentos em tempo real nas unidades de saúde.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full">
                    <Link to="/mapa">Buscar Medicamento</Link>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </section>


          <section className="mb-12 text-center">
            <a
              href="https://vidafarmacias.com.br/campanha"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={denuncieImg}
                alt="Denuncie"
                className="mx-auto rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer w-full max-w-4xl"
              />
            </a>
          </section>
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Notícias e Campanhas de Saúde
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              <HealthCampaignCard
                title="Outubro Rosa: Quando devo fazer mamografia?"
                description="Entenda as recomendações para diferentes faixas etárias e veja como agendar o exame pelo SUS em todo o estado"
                content="Durante o Outubro Rosa, mês dedicado à conscientização sobre a prevenção e o diagnóstico precoce do câncer de mama, o Governo do Estado reforça a importância dos exames preventivos..."
                source="Secretaria Estadual da Saúde"
                link="https://portaldenoticias.saude.sp.gov.br/outubro-rosa-quando-devo-fazer-mamografia-entenda-a-importancia-do-exame/"
                image={outuroRosaImg}
                variant="pink"
              />
              
              <HealthCampaignCard
                title="Vacina contra HPV protege contra o câncer"
                description="O imunizante é o único capaz de prevenir tipos de câncer causados pelo vírus"
                content="O Governo do Estado de São Paulo, por meio da Secretaria de Estado da Saúde (SES), reforça o alerta aos pais e responsáveis sobre a importância da vacinação contra o HPV..."
                source="Secretaria Estadual da Saúde"
                link="https://portaldenoticias.saude.sp.gov.br/vacina-contra-hpv-protege-contra-o-cancer-mas-ainda-precisa-de-adesao/"
                image={vaccinationImg}
                variant="default"
              />
              
              <HealthCampaignCard
                title="Novembro Azul: Conscientização sobre o Câncer de Próstata"
                description="Novembro é o mês dedicado à conscientização sobre o câncer de próstata, com a campanha Novembro Azul"
                content="No Brasil, o câncer de próstata é o segundo mais comum entre os homens, representando cerca de 29% dos casos de câncer. Somente em 2023, foram estimados mais de 70 mil novos casos no país, segundo dados do Instituto Nacional de Câncer (INCA)..."
                source="Instituto Nacional de Câncer (INCA)"
                image={novembroAzulImg}
                variant="blue"
              />
              
              <HealthCampaignCard
                title="O aleitamento materno salvou a minha filha, conta mãe de prematura"
                description="Mãe de prematura beneficiada por banco de leite humano"
                content="O Estado de São Paulo conta com 60 bancos de leite humano (BLH) e 53 postos de coleta para doação"
                source="Secretaria Estadual da Saúde"
                image={aleitamentoImg}
                variant="default"
              />
              
              <HealthCampaignCard
                title="Cuidados com escorpiões: como se proteger e onde buscar ajuda"
                description="Estado de São Paulo conta com 228 pontos estratégicos de soro antiveneno"
                content="Saiba como prevenir acidentes com escorpiões e onde buscar atendimento em caso de picadas"
                source="Secretaria Estadual da Saúde"
                image={escorpiaoImg}
                variant="default"
              />
              
              <HealthCampaignCard
                title="Carretas de Mamografia realiza exames gratuitos em seis regiões"
                description="O serviço funciona de segunda a sexta-feira, das 8h às 17h, com disponibilização de até 50 senhas por dia"
                content="Carretas de Mamografia realizam exames gratuitos em seis regiões no mês de julho; confira os locais e horários"
                source="Secretaria Estadual da Saúde"
                image={carretasImg}
                variant="pink"
              />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Index;
