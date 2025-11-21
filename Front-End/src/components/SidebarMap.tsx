import { Clock, Eye, MapPin, Package, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ItemSidebarMap from "./ItemSidebarMap";
import { useState, useEffect } from "react"; 
import { useToast } from "@/hooks/use-toast";
import ItemDetailSidebarMap from "./ItemDetailSidebarMap";
import { listarFavoritos } from "../services/favoritoService"; 

// Função auxiliar para limpar o ID (Mantida para os Favoritos)
const extractId = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const parts = String(val).split('-');
    const id = parseInt(parts[parts.length - 1], 10);
    return isNaN(id) ? 0 : id;
};

export default function SidebarMap({ selectedUnit, mapInstanceRef, setSelectedUnit, unitViewers }: any) {
    
    const { toast } = useToast();
    const [hiddenDetailMenu, setHiddenDetailMenu] = useState(false);
    const [selectedItemDetail, setSelectedItemDetail] = useState<any>(null);
    
    // Estado dos favoritos
    const [meusFavoritosMap, setMeusFavoritosMap] = useState<Record<number, number>>({});

    // Carrega favoritos ao abrir a unidade
    useEffect(() => {
        const carregarFavoritos = async () => {
            const idCliente = localStorage.getItem("id");
            
            if (idCliente && selectedUnit) {
                try {
                    const lista = await listarFavoritos(Number(idCliente));
                    const mapa: Record<number, number> = {};
                    const unitIdLimpo = extractId(selectedUnit.id);

                    lista.forEach((fav: any) => {
                        // Verifica se o favorito pertence a esta unidade
                        if (extractId(fav.id_unidade) === unitIdLimpo) {
                            mapa[fav.id_medicamento] = fav.id_favorito;
                        }
                    });
                    setMeusFavoritosMap(mapa);
                } catch (error) {
                    console.error("Erro ao carregar favoritos:", error);
                }
            }
        };
        carregarFavoritos();
    }, [selectedUnit]); 

    const handleDetailMenu = ({ data }: any) => {
        setHiddenDetailMenu(true);
        setSelectedItemDetail(data);
    }

    return (
        <div className="w-full md:w-1/2 lg:w-2/5 bg-background border-b md:border-r md:border-b-0 border-border z-[1000] fixed bottom-0 md:static h-[50vh] md:h-full overflow-y-auto">
            { hiddenDetailMenu ? (
                <ItemDetailSidebarMap 
                    medication={selectedItemDetail} 
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
                                {1} visualizando esta unidade
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
                        {selectedUnit.medications.filter((med: any) => med.quantity > 0).map((med: any, index: number) => {
                        
                        const medIdLimpo = extractId(med.id);
                        const idFavoritoExistente = meusFavoritosMap[medIdLimpo] || null;

                        return (
                            <ItemSidebarMap
                                key={index || med.id}
                                id={med.id}
                                name={med.name}
                                dosage={med.dosage}
                                quantity={med.quantity}
                                tipo={med.tipo}
                                interests={med.interests}
                                description={med.description}
                                foto_url={med.foto_url}
                                
                                // ✅ CORREÇÃO: Usamos o valor que já vem pronto do mock
                                requiresPrescription={med.requiresPrescription} 
                                
                                viewingCount={med.viewingCount}
                                unitId={selectedUnit.id}
                                initialFavoriteId={idFavoritoExistente}
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