// Front-End/src/components/SidebarMap.tsx (Versão Completa com Props)

import { Clock, Eye, Heart, MapPin, Package, Phone, Warehouse, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ItemSidebarMap from "./ItemSidebarMap";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ItemDetailSidebarMap from "./ItemDetailSidebarMap";
import { Map } from "leaflet"; // Importando o tipo do Mapa (assumindo Leaflet)

// --- 1. DEFINIÇÃO DOS TIPOS (PROPS) ---

// Tipo para os dados do medicamento vindos da API
export interface Medicamento {
    id: string;
    name: string;
    dosage: string;
    quantity: number;
    tipo: string;
    description: string;
    foto_url?: string; // A foto que adicionamos
}

// Tipo para os dados da unidade vindos da API
export interface HealthUnit {
    id: string;
    name: string;
    address: string;
    workingHours: string;
    phone: string;
    type: string;
    medications: Medicamento[];
}

// Tipo para o estado de detalhe (combina campos)
export interface MedicamentoDetalhe {
    id: string;
    name: string;
    dosage: string;
    quantity: number;
    imageUrl: string;
    tipo: string;
    description: string;
    // (Campos do useState original)
    requiresPrescription: boolean;
    viewingCount: number;
}

// Props do componente SidebarMap
interface SidebarMapProps {
    selectedUnit: HealthUnit | null;
    mapInstanceRef: React.RefObject<Map | null>; // Tipo do Mapa (Leaflet)
    setSelectedUnit: (unit: HealthUnit | null) => void;
    unitViewers: Record<string, number>;
}

// --- 2. APLICAÇÃO DOS TIPOS ---

export default function SidebarMap({ 
    selectedUnit, 
    mapInstanceRef, 
    setSelectedUnit, 
    unitViewers 
}: SidebarMapProps) { // <-- Props aplicadas

    const [medicationInterests, setMedicationInterests] = useState<Record<string, number>>({});
    const { toast } = useToast();

    const handleMedicationInterest = (medicationId: string, medicationName: string) => {
        setMedicationInterests(prev => ({
            ...prev,
            [medicationId]: (prev[medicationId] || 0) + 1
        }));
        
        toast({
            title: "Interesse registrado!",
            description: `Você demonstrou interesse em ${medicationName}. A demanda foi registrada.`,
            duration: 3000,
        });
    };

    const [hiddenDetailMenu, setHiddenDetailMenu] = useState(false);
    
    // Aplicando o tipo ao useState
    const [selectedItemDetail, setSelectedItemDetail] = useState<MedicamentoDetalhe>({
        id: "",
        name: "",
        dosage: "",
        quantity: 0,
        imageUrl: "", // <-- Nosso novo campo
        tipo: 'pill',
        description: "",
        requiresPrescription: false,
        viewingCount: 0
    });

    // Tipo para os dados que vêm do 'ItemSidebarMap'
    interface HandleDetailData {
        id: string;
        name: string;
        dosage: string;
        quantity: number;
        tipo: string;
        description: string;
        imageUrl?: string;
    }

    const handleDetailMenu = ({ data }: { data: HandleDetailData }) => {
        setHiddenDetailMenu(true);
        // Combina os dados recebidos com os campos padrão
        setSelectedItemDetail(prev => ({
            ...prev, // Mantém 'requiresPrescription', 'viewingCount'
            ...data, // Adiciona os dados do item clicado
            imageUrl: data.imageUrl || "", // Garante que 'imageUrl' seja uma string
        }));
    }

    // Se não houver unidade selecionada, não renderiza nada (ou um placeholder)
    if (!selectedUnit) {
        return null; // Ou um componente de "Selecione uma unidade"
    }

    return (
        <div className="w-full md:w-1/2 lg:w-2/5 h-1/2 md:h-full bg-background border-b md:border-r md:border-b-0 border-border z-[1000] overflow-y-hidden fixed bottom-0 md:static">
            { hiddenDetailMenu ? (
                <ItemDetailSidebarMap 
                    medication={selectedItemDetail} // O tipo agora bate (MedicamentoDetalhe)
                    onBack={ () => setHiddenDetailMenu(false) } 
                    selectedUnit={selectedUnit}
                    unitViewers={unitViewers}
                />
            ) : null }

            { !hiddenDetailMenu && (<div className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2">{selectedUnit.name}</h2>
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5">
                                <Eye className="w-3 h-3 mr-1" />
                                {unitViewers[selectedUnit.id] || 0} visualizando esta unidade
                            </Badge>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSelectedUnit(null);
                            if (mapInstanceRef.current) {
                                mapInstanceRef.current.setView([-22.2144, -49.9463], 13, { animate: true });
                            }
                        }}
                        className="hover:bg-accent"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
                        <span className="text-muted-foreground">{selectedUnit.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{selectedUnit.workingHours}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-5 h-5 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{selectedUnit.phone}</span>
                    </div>
                </div>


                <div>
                    <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Medicamentos Disponíveis
                    </h3>
                    <div className="space-y-3">
                        {/* Tipando 'med' como 'Medicamento' */}
                        {selectedUnit.medications.filter(med => med.quantity > 0).map((med: Medicamento) => {
                            const interests = medicationInterests[med.id] || 0;
                            
                            return (
                                <ItemSidebarMap
                                    key={med.id} // Chave movida para o topo
                                    id={med.id}
                                    name={med.name}
                                    dosage={med.dosage}
                                    quantity={med.quantity}
                                    tipo={med.tipo}
                                    interests={interests}
                                    description={med.description}
                                    imageUrl={med.foto_url} // <-- Passando a foto
                                    handleMedicationInterest={handleMedicationInterest}
                                    handleDetail={handleDetailMenu}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <Badge 
                        variant="outline" 
                        className="border-primary/30 text-primary bg-primary/5"
                    >
                        {selectedUnit.type}
                    </Badge>
                </div>
            </div>)}
        </div>
    )
}