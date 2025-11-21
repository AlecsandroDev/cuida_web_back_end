import { useState, useEffect } from "react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adicionarFavorito, removerFavorito } from "../services/favoritoService";

const extractId = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const parts = String(val).split('-');
    const id = parseInt(parts[parts.length - 1], 10);
    return isNaN(id) ? 0 : id;
};

export default function ItemSidebarMap({ 
    id, name, dosage, quantity, tipo, description, 
    handleDetail, requiresPrescription, foto_url, unitId,
    initialFavoriteId // Recebemos a prop do Pai
}: any) {
    
    const { toast } = useToast(); 
    
    // 4. INICIALIZAMOS O ESTADO
    // Se initialFavoriteId tiver um valor (ID), favorited começa como true
    const [favorited, setFavorited] = useState(!!initialFavoriteId);
    const [idFavoritoBanco, setIdFavoritoBanco] = useState<number | null>(initialFavoriteId);
    const [loading, setLoading] = useState(false);

    // 5. ATUALIZAMOS O ESTADO SE O PAI MANDAR DADOS DEPOIS (Assim resolve o delay do F5)
    useEffect(() => {
        if (initialFavoriteId) {
            setFavorited(true);
            setIdFavoritoBanco(initialFavoriteId);
        } else {
            // Se não tiver ID, garante que está desmarcado (caso tenha mudado de unidade)
            setFavorited(false);
            setIdFavoritoBanco(null);
        }
    }, [initialFavoriteId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation(); 
        
        const idCliente = localStorage.getItem("id");
        const numericUnitId = extractId(unitId);
        const numericMedId = extractId(id);

        if (!idCliente) {
            toast({
                variant: "destructive",
                title: "Login Necessário",
                description: "Você precisa estar logado para favoritar!"
            });
            return;
        }

        setLoading(true);
        try {
            if (favorited && idFavoritoBanco) {
                await removerFavorito(idFavoritoBanco);
                setFavorited(false);
                setIdFavoritoBanco(null);
                toast({ title: "Removido", description: "Item removido dos favoritos." });
            } else {
                const novo = await adicionarFavorito({
                    id_cliente: Number(idCliente),
                    id_unidade: numericUnitId,
                    id_medicamento: numericMedId
                });
                setFavorited(true);
                setIdFavoritoBanco(novo.id_favorito);
                toast({ title: "Favoritado!", description: "Salvo nos seus favoritos." });
            }
        } catch (error) {
            console.error("Erro ao favoritar:", error);
            toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar favorito." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div        
            className={`border rounded-xl p-4 transition-shadow hover:shadow-md cursor-pointer
            ${quantity <= 15 
                ? "bg-red-50 border-red-500 hover:!bg-red-50"   
                : "bg-card border-border hover:!bg-card"        
            }`}
            onClick={() => {
                handleDetail({ data: { id, name, dosage, quantity, tipo, description, requiresPrescription, foto_url } });
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`font-medium ${quantity <= 15 ? "text-red-700" : "text-foreground"}`}>
                        {name}
                    </p>
                    <p className="text-sm text-muted-foreground">{dosage}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge 
                        variant="outline"
                        className={`text-sm 
                            ${quantity <= 15 
                            ? "bg-red-100 text-red-700 border-red-300" 
                            : "bg-blue-50 text-blue-700 border-blue-300"}`
                        }
                    >
                        {quantity} disponíveis
                    </Badge>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFavorite}
                        disabled={loading}
                        className="h-9 w-9 p-0 hover:bg-transparent"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                            <Heart 
                                className={`w-5 h-5 transition-colors ${favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'}`} 
                            />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}