import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Heart, Clock } from "lucide-react";

export default function TermosDeUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2 border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-9 h-9 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground font-poppins">CUIDA</h1>
              <p className="text-sm text-muted-foreground font-medium">Marília - SP</p>
            </div>
          </div>
        </div>

        {/* Termos de Uso Card */}
        <Card className="shadow-2xl border border-primary/10 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-lg">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground font-poppins">
              Termo de Compromisso e Uso da Plataforma CUIDA
            </CardTitle>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-medium px-4 py-2 rounded-full text-sm border border-primary/20 mt-4">
              <Clock className="w-4 h-4" />
              Última atualização: 20/08/2025
            </div>
          </CardHeader>

          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6 text-foreground">
              <p className="text-muted-foreground leading-relaxed">
                Este Termo de Compromisso e Uso estabelece as condições para utilização da Plataforma
                CUIDA, sistema oficial da Secretaria Municipal de Saúde de Marília. O CUIDA foi criado para
                oferecer maior transparência e praticidade na consulta à disponibilidade de medicamentos nas
                Unidades de Saúde, bem como para apoiar os processos internos de gestão e controle.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Ao acessar ou utilizar a Plataforma, o usuário declara que leu atentamente, compreendeu e
                concorda com todas as disposições aqui descritas.
              </p>

              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">1. Finalidade da Plataforma</h2>
                  <p className="text-muted-foreground mb-3">A Plataforma CUIDA tem por finalidade:</p>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Permitir que cidadãos verifiquem em quais unidades de saúde há determinado medicamento disponível, bem como informações sobre endereço, horários de funcionamento e status de estoque.</li>
                    <li>• Facilitar o acompanhamento de filas, tempos de espera e quantidade de atendimentos em andamento, quando disponibilizado pela unidade.</li>
                    <li>• Apoiar a Secretaria de Saúde e seus gestores na administração de estoques, no planejamento da distribuição de medicamentos e no monitoramento de consumo e validade de lotes.</li>
                    <li>• Oferecer maior eficiência e transparência na comunicação entre cidadãos e o sistema público de saúde.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    O usuário reconhece que a Plataforma tem caráter informativo e de apoio, não substituindo
                    atendimento médico, diagnóstico clínico ou orientações profissionais de saúde.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">2. Compromissos do Usuário</h2>
                  <p className="text-muted-foreground mb-3">O usuário se compromete a:</p>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Fornecer dados verdadeiros, completos e atualizados em seu cadastro, assumindo total responsabilidade pelas informações prestadas.</li>
                    <li>• Utilizar a Plataforma apenas para fins legítimos, respeitando sua finalidade pública e comunitária.</li>
                    <li>• Não praticar atos de fraude, manipulação de informações ou qualquer ação que possa comprometer o funcionamento do sistema.</li>
                    <li>• Manter em sigilo suas credenciais de acesso, sendo responsável por qualquer atividade realizada em sua conta.</li>
                    <li>• Respeitar os limites da Plataforma e compreender que sua função principal é fornecer informações e facilitar o acesso aos serviços de saúde, sem garantir resultados absolutos.</li>
                  </ul>
                  <p className="text-sm font-medium text-accent mt-3">
                    <strong>Idade mínima:</strong> Para utilizar funcionalidades que envolvam cadastro de dados pessoais, o usuário
                    deve ter no mínimo 18 anos. Menores de idade só poderão se cadastrar com consentimento
                    expresso dos pais ou responsáveis legais.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">3. Tratamento de Dados Pessoais e Sensíveis</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Para o pleno funcionamento da Plataforma, poderão ser coletados e tratados dados pessoais (nome, CPF, endereço, contato) e dados pessoais sensíveis (tipo sanguíneo, alergias, doenças, restrições a medicamentos).</li>
                    <li>• O usuário autoriza o tratamento de tais dados de forma livre, informada e destacada, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</li>
                    <li>• O tratamento terá como finalidade exclusiva:
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>○ possibilitar o funcionamento da Plataforma;</li>
                        <li>○ permitir a correta gestão de medicamentos e atendimentos;</li>
                        <li>○ garantir maior segurança e eficiência nos serviços de saúde.</li>
                      </ul>
                    </li>
                    <li>• O usuário tem direito de, a qualquer momento:
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>○ solicitar acesso às informações coletadas;</li>
                        <li>○ requerer a correção de dados desatualizados ou incorretos;</li>
                        <li>○ solicitar a exclusão de seus dados, ressalvados os casos em que sua manutenção seja exigida por lei.</li>
                      </ul>
                    </li>
                    <li>• A Secretaria de Saúde compromete-se a adotar medidas técnicas e administrativas adequadas para proteger os dados coletados, comunicando ao usuário qualquer incidente relevante de segurança.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">4. Informações de Localização e Serviços de Terceiros</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• A Plataforma poderá solicitar o acesso à localização do dispositivo para identificar as unidades de saúde mais próximas.</li>
                    <li>• As informações de mapas e rotas são fornecidas por serviços de terceiros (Google Maps, OpenStreetMap, Leaflet), sujeitos às condições desses provedores.</li>
                    <li>• O usuário reconhece que a precisão da localização pode variar e que a Secretaria de Saúde não se responsabiliza por eventuais imprecisões ou falhas decorrentes desses serviços externos.</li>
                    <li>• Sempre que exigido, será exibida a atribuição correspondente ao provedor do mapa.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">5. Limitações e Avisos Importantes</h2>
                  <p className="text-muted-foreground mb-3">O usuário declara estar ciente de que:</p>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• As informações apresentadas na Plataforma podem sofrer variações em tempo real e, portanto, não constituem garantia de disponibilidade absoluta de medicamentos ou serviços.</li>
                    <li>• A retirada de medicamentos controlados ou sujeitos a prescrição médica dependerá sempre da apresentação da receita válida e atualizada diretamente na unidade de saúde.</li>
                    <li>• A Plataforma não substitui consultas médicas, diagnósticos ou orientações clínicas. Em situações de urgência, o usuário deve procurar imediatamente um serviço de saúde adequado.</li>
                    <li>• O CUIDA é uma ferramenta de apoio e transparência, mas sua utilização não cria qualquer direito automático à entrega de medicamentos.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">6. Responsabilidade do Usuário</h2>
                  <p className="text-muted-foreground mb-3">O usuário será responsável por:</p>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Qualquer informação incorreta, incompleta ou falsa fornecida no cadastro ou durante o uso da Plataforma;</li>
                    <li>• Danos diretos ou indiretos causados a si próprio, a terceiros ou ao serviço público decorrentes do uso inadequado do sistema;</li>
                    <li>• O sigilo e uso indevido de suas credenciais de acesso, quando aplicável;</li>
                    <li>• Eventuais infrações legais praticadas por meio do uso da Plataforma.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">7. Responsabilidade da Secretaria de Saúde</h2>
                  <p className="text-muted-foreground mb-3">A Secretaria de Saúde compromete-se a:</p>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Disponibilizar a Plataforma em caráter contínuo, salvo por motivos de manutenção ou fatores externos que impeçam sua operação.</li>
                    <li>• Adotar medidas para proteger os dados pessoais e sensíveis dos usuários, observando a legislação vigente.</li>
                    <li>• Garantir que os registros de acesso e as ações realizadas na Plataforma sejam mantidos para fins de auditoria e responsabilização.</li>
                    <li>• Informar os usuários em caso de alterações relevantes nos Termos ou em caso de incidentes que comprometam a segurança dos dados.</li>
                    <li>• Utilizar as informações coletadas exclusivamente para fins de gestão em saúde pública.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">8. Segurança da Informação</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Todas as ações realizadas na Plataforma poderão ser registradas em logs de auditoria, permitindo rastreabilidade e segurança.</li>
                    <li>• A Secretaria de Saúde adota medidas técnicas e administrativas de segurança, mas não pode garantir a eliminação total de riscos relacionados à internet.</li>
                    <li>• Em caso de incidente que gere risco ou dano relevante, os usuários e a Autoridade Nacional de Proteção de Dados (ANPD) serão notificados, conforme exige a LGPD.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">9. Suspensão e Cancelamento de Acesso</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• O descumprimento destes Termos poderá resultar na suspensão temporária ou no cancelamento definitivo da conta do usuário.</li>
                    <li>• A Secretaria de Saúde poderá suspender o acesso por razões técnicas, de manutenção, de segurança ou por determinação legal.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">10. Comunicações Oficiais</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• O usuário concorda que a Secretaria poderá enviar comunicações relacionadas à Plataforma por meio de:
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>○ Notificações dentro do próprio sistema;</li>
                        <li>○ Mensagens enviadas para o e-mail cadastrado.</li>
                      </ul>
                    </li>
                    <li>• É responsabilidade do usuário manter seus dados de contato atualizados.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">11. Alterações deste Termo</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Este Termo poderá ser atualizado periodicamente, a fim de refletir alterações legais ou melhorias nos serviços da Plataforma.</li>
                    <li>• Mudanças relevantes serão comunicadas aos usuários.</li>
                    <li>• O uso contínuo da Plataforma após a atualização implicará concordância com as novas condições.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 font-poppins">12. Legislação Aplicável e Foro</h2>
                  <ul className="space-y-2 text-muted-foreground pl-4">
                    <li>• Este Termo é regido pela legislação brasileira, em especial pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e pelo Código de Defesa do Consumidor.</li>
                    <li>• Eventuais disputas serão resolvidas no foro da comarca de Marília, salvo disposição legal em contrário.</li>
                  </ul>
                </section>
              </div>

              <div className="border-t border-border pt-6 mt-8">
                <p className="text-sm text-muted-foreground text-center">
                  © 2025 Secretaria Municipal de Saúde de Marília. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}