// Front-End/src/components/ItemSidebarMap.tsx (Versão Completa com Props)

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pill } from "lucide-react"; // Usaremos como fallback

// --- 1. DEFINIÇÃO DOS TIPOS (PROPS) ---

// O tipo de 'data' que o handleDetail espera
interface MedicamentoItemData {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  tipo: string;
  description: string;
  imageUrl: string;
}

// Props do componente
interface ItemSidebarMapProps {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  tipo: string;
  interests: number;
  description: string;
  imageUrl?: string; // Opcional, vindo de 'foto_url'
  handleMedicationInterest: (medicationId: string, medicationName: string) => void;
  handleDetail: (detail: { data: MedicamentoItemData }) => void;
}

// --- 2. APLICAÇÃO DOS TIPOS ---

export default function ItemSidebarMap({
  id,
  name,
  dosage,
  quantity,
  tipo,
  interests,
  description,
  imageUrl, // <-- Prop tipada
  handleMedicationInterest,
  handleDetail,
}: ItemSidebarMapProps) { // <-- Props aplicadas

  const handleRegisterInterest = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede o 'handleDetail' de ser disparado
    handleMedicationInterest(id, name);
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
      // Passa os dados no formato esperado pela 'MedicamentoItemData'
      onClick={() => handleDetail({ 
        data: { 
          id, 
          name, 
          dosage, 
          quantity, 
          tipo, 
          description, 
          imageUrl: imageUrl || "" // Garante que seja string
        } 
      })}
    >
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={imageUrl || undefined} alt={name} />
        <AvatarFallback className="bg-muted">
          <Pill className="w-5 h-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{dosage}</p>
      </div>
      
      <div className="flex flex-col items-end gap-1">
        <Badge variant={quantity > 10 ? "default" : "secondary"}>
          {quantity} un
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-2"
          onClick={handleRegisterInterest}
        >
          <Heart className={`mr-1 h-3 w-3 ${interests > 0 ? 'fill-primary text-primary' : ''}`} />
          Interesse {interests > 0 && `(${interests})`}
        </Button>
      </div>
    </div>
  );
}