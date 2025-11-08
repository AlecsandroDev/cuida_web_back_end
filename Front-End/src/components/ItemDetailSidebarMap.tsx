import { 
    Users, 
    Pill, 
    Syringe, 
    AlertTriangle,
    Package,
    ArrowLeft,
    FileText,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface MedicationDetailProps {
    medication: {
        id: string;
        name: string;
        dosage: string;
        quantity: number;
        tipo: string;
        imageUrl: string;
        description: string;
        requiresPrescription: boolean;
        viewingCount: number;
    };
    onBack: () => void;
    onRequestMore?: (medicationId: string) => void;
    selectedUnit: any; 
    unitViewers: any;
}

const getMedicationIcon = (type: string) => {
    switch (type) {
        case 'pill':
            return <Pill className="h-5 w-5" />;
        case 'vaccine':
            return <Syringe className="h-5 w-5" />;
        case 'iv':
            return <Syringe className="h-5 w-5" />;
        default:
            return <Package className="h-5 w-5" />;
    }
};


const getMedicationTypeLabel = (type: string) => {
    switch (type) {
        case 'pill':
            return 'Pílula';
        case 'vaccine':
            return 'Vacina';
        case 'iv':
            return 'Medicamento Intravenoso';
        default:
            return 'Outro';
    }
};

const getStockLevel = (quantity: number) => {
    if (quantity > 15) return { label: 'Estoque Alto', variant: 'default' as const };
    if (quantity <= 15) return { label: 'Estoque Baixo', variant: 'destructive' as const };
    return { label: 'Estoque Médio', variant: 'secondary' as const };
};

   
export default function ItemDetailSidebarMap({ medication, onBack, onRequestMore, selectedUnit, unitViewers }: MedicationDetailProps) {
    const { id, name, dosage, quantity, tipo, imageUrl, description, requiresPrescription, viewingCount } = medication;
    const stock = getStockLevel(quantity);
    console.log(medication);
    return (
        <div>
            <div className="relative ml-7 mt-7">
                <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2">{selectedUnit.name}</h2>
                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5">
                        <Eye className="w-3 h-3 mr-1" />
                        {unitViewers[selectedUnit.id] || 0} visualizando este medicamento
                    </Badge>
                </div>
                <Button
                    onClick={onBack}
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-4 gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Button>
            </div>
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">{name}</h1>
                    <p className="text-lg text-muted-foreground">{dosage}</p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <img 
                            src={imageUrl} 
                            alt={name}
                            className="w-full aspect-square object-cover rounded-2xl border-2 border-border shadow-md"
                        />
                    </div>
                </div>

                {/* Tipo de medicamento */}
                <Card className="p-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            {getMedicationIcon(tipo)}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tipo de Medicamento</p>
                            <p className="font-semibold text-foreground">{tipo}</p>
                        </div>
                    </div>
                </Card>

                {/* Informações de estoque */}
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-5 w-5" />
                            <span className="font-medium">Estoque Disponível</span>
                        </div>
                        <Badge variant={stock.variant} className="text-sm">
                            {stock.label}
                        </Badge>
                    </div>
                    <div className="text-center py-2">
                        <span className="text-4xl font-bold text-foreground">{quantity}</span>
                        <span className="text-lg text-muted-foreground ml-2">unidades</span>
                    </div>
                    
                    {/* Botão de solicitar - apenas se estoque baixo */}
                    {quantity <= 15 && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <Button 
                                variant="destructive" 
                                className="w-full gap-2"
                                onClick={() => onRequestMore?.(id)}
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Solicitar Mais Medicamentos
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                O estoque está baixo. Solicite reposição para esta unidade.
                            </p>
                        </div>
                    )}
                </Card>

                {/* Aviso de prescrição */}
                {requiresPrescription && (
                    <Card className="border-l-4 border-l-warning bg-warning/5 p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 p-2 bg-warning/10 rounded-lg h-fit">
                                <FileText className="h-5 w-5 text-warning" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                    Prescrição Necessária
                                </h4>
                                <p className="text-sm text-foreground/80">
                                    Este medicamento requer receita médica. Para retirá-lo, você deve:
                                </p>
                                <ul className="text-sm text-foreground/80 list-disc list-inside space-y-1 ml-2">
                                    <li>Comparecer ao posto de saúde</li>
                                    <li>Levar documento de identidade</li>
                                    <li>Apresentar receita médica válida</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Descrição detalhada */}
                <Card className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Sobre este Medicamento
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        {description}
                    </p>
                </Card>
            </div>
        </div>
    )
}