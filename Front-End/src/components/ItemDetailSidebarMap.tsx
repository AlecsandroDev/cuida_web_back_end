// Front-End/src/components/ItemDetailSidebarMap.tsx (Versão Completa com Props)

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Eye, Heart, MapPin, Package, Phone, Warehouse, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pill as PillIcon } from "lucide-react";
import { HealthUnit, MedicamentoDetalhe } from "./SidebarMap"; // Importando tipos do pai

// --- 1. DEFINIÇÃO DOS TIPOS (PROPS) ---

interface ItemDetailSidebarMapProps {
  medication: MedicamentoDetalhe; // Tipo importado do SidebarMap
  onBack: () => void;
  selectedUnit: HealthUnit | null; // Tipo importado do SidebarMap
  unitViewers: Record<string, number>;
}

// --- 2. APLICAÇÃO DOS TIPOS ---

export default function ItemDetailSidebarMap({ 
  medication, 
  onBack, 
  selectedUnit, 
  unitViewers 
}: ItemDetailSidebarMapProps) { // <-- Props aplicadas

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground flex-1 truncate">
          Detalhes do Medicamento
        </h3>
      </div>

      {/* Conteúdo rolável */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        
        <div className="flex justify-center">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
            {/* O tipo garante que 'medication.imageUrl' existe e é string */}
            <AvatarImage src={medication.imageUrl || undefined} alt={medication.name} />
            <AvatarFallback className="bg-muted p-4">
              <PillIcon className="w-full h-full text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">{medication.name}</h3>
          <p className="text-sm text-muted-foreground">{medication.dosage}</p>
        </div>

        <div className="space-y-2">
            <h4 className="font-medium text-foreground">Descrição</h4>
            <p className="text-sm text-muted-foreground">
              {medication.description || "Nenhuma descrição disponível."}
            </p>
        </div>

        <div className="space-y-2">
            <h4 className="font-medium text-foreground">Disponibilidade</h4>
            <Badge variant={medication.quantity > 10 ? "default" : "secondary"}>
                {medication.quantity} unidades disponíveis
            </Badge>
        </div>
        
        {selectedUnit && (
            <div className="space-y-3 pt-4 border-t">
                 <h4 className="font-medium text-foreground">Disponível em:</h4>
                <div className="flex items-start gap-3 text-sm">
                    <Warehouse className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
                    <span className="font-semibold">{selectedUnit.name}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{selectedUnit.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Eye className="w-5 h-5 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">
                        {unitViewers[selectedUnit.id] || 0} visualizando esta unidade
                    </span>
                </div>
            </div>
        )}

      </div>

      {/* Rodapé */}
      <div className="p-4 border-t">
        <Button size="lg" className="w-full">
          <Heart className="mr-2 h-4 w-4" />
          Registrar Interesse
        </Button>
      </div>
    </div>
  );
}