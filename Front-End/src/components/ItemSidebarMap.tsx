import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

export default function ItemSidebarMap({ id, name, dosage, tipo, description, quantity, interests, handleMedicationInterest, handleDetail }: any) {

    return (
        <div key={id}         
                className={`border rounded-xl p-4 transition-shadow hover:shadow-md 
                ${quantity <= 15 
                    ? "bg-red-50 border-red-500 hover:!bg-red-50"   
                    : "bg-card border-border hover:!bg-card"        
                }`
            }
            onClick={ (e) => {
                e.stopPropagation();
                handleDetail({ data: { id, name, dosage, tipo, description, quantity, interests } });
            } }
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
                        onClick={() => handleMedicationInterest(id, name)}
                        className="h-9 w-9 p-0"
                    >
                        <Heart className={`w-5 h-5 ${interests > 0 ? 'fill-current text-red-500' : ''}`} />
                    </Button>
                </div>
            </div>
        </div>
    )
}