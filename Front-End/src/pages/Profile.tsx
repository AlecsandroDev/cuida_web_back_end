import { useState } from "react";
import { Camera, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

const Profile = () => {
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg");
  const [formData, setFormData] = useState({
    nome: "Usuário",
    idade: "",
    cpf: "",
    rg: "",
    email: "usuario@email.com",
    telefone: "",
    endereco: "",
    carteirinha: "",
    tipoSanguineo: "",
    medicamentosRestritos: "",
    diagnosticos: "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success("Foto de perfil atualizada!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 px-4 py-8 md:px-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>

          <div className="space-y-6">
            {/* Foto de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>
                  Adicione ou atualize sua foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={profileImage} alt="Foto de perfil" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clique no ícone da câmera para alterar sua foto
                </p>
              </CardContent>
            </Card>

            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="flex items-center gap-2"><User className="h-4 w-4" />Nome Completo</Label>
                    <Input id="nome" value={formData.nome} onChange={handleInputChange} placeholder="Digite seu nome completo" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idade" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Idade</Label>
                    <Input id="idade" value={formData.idade} onChange={handleInputChange} placeholder="Digite sua idade" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="flex items-center gap-2">CPF</Label>
                    <Input id="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rg" className="flex items-center gap-2">RG</Label>
                    <Input id="rg" value={formData.rg} onChange={handleInputChange} placeholder="00.000.000-0" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />E-mail</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="flex items-center gap-2"><Phone className="h-4 w-4" />Telefone</Label>
                    <Input id="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco" className="flex items-center gap-2"><MapPin className="h-4 w-4" />Endereço</Label>
                    <Input id="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Digite seu endereço completo" />
                  </div>
                </div>

                {/* Informações de Saúde */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="carteirinha">Carteirinha do SUS</Label>
                    <Input id="carteirinha" value={formData.carteirinha} onChange={handleInputChange} placeholder="Número da carteirinha" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoSanguineo">Tipo sanguíneo</Label>
                    <Input id="tipoSanguineo" value={formData.tipoSanguineo} onChange={handleInputChange} placeholder="Ex: A+, O-, B+" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="medicamentosRestritos">Medicamentos restritos</Label>
                    <Input id="medicamentosRestritos" value={formData.medicamentosRestritos} onChange={handleInputChange} placeholder="Medicamentos que não pode tomar" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="diagnosticos">Problemas de saúde ou diagnósticos</Label>
                    <Input id="diagnosticos" value={formData.diagnosticos} onChange={handleInputChange} placeholder="Informe problemas de saúde conhecidos" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} className="px-8">Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
