import { useState, useEffect } from "react";
import { 
    Pill, Syringe, AlertTriangle, Package, ArrowLeft, 
    FileText, Eye, CheckCircle, Clock, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { criarPedido, listarMeusPedidos } from "../services/pedidoService";

const extractId = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const parts = String(val).split('-');
    const id = parseInt(parts[parts.length - 1], 10);
    return isNaN(id) ? 0 : id;
};

const getStockLevel = (quantity: number) => {
    if (quantity > 15) return { label: 'Estoque Alto', variant: 'default' as const };
    if (quantity <= 15) return { label: 'Estoque Baixo', variant: 'destructive' as const };
    return { label: 'Estoque Médio', variant: 'secondary' as const };
};

const getMedicationIcon = (type: string) => {
    switch (type) {
        case 'pill': return <Pill className="h-5 w-5" />;
        case 'vaccine': return <Syringe className="h-5 w-5" />;
        case 'iv': return <Syringe className="h-5 w-5" />;
        default: return <Package className="h-5 w-5" />;
    }
};

export default function ItemDetailSidebarMap({ medication, onBack, selectedUnit }: any) {
    const { id, name, dosage, quantity, tipo, foto_url, description, requiresPrescription } = medication;
    const stock = getStockLevel(quantity);
    
    const { toast } = useToast();
    const [isRequested, setIsRequested] = useState(false);
    const [loadingPedido, setLoadingPedido] = useState(false);
    const [checkingOrder, setCheckingOrder] = useState(true);

    useEffect(() => {
        let mounted = true;
        const verificarPedidoExistente = async () => {
            const idCliente = localStorage.getItem("id");
            const numericMedId = extractId(id);
            const numericUnitId = extractId(selectedUnit?.id);

            if (idCliente && numericMedId && numericUnitId) {
                try {
                    const meusPedidos = await listarMeusPedidos(Number(idCliente));
                    
                    if (mounted) {
                        const pedidoEncontrado = meusPedidos.some((p: any) => 
                            p.id_medicamento === numericMedId && 
                            p.id_unidade === numericUnitId
                        );

                        if (pedidoEncontrado) {
                            setIsRequested(true);
                        }
                    }
                } catch (error) {
                    console.error("Erro ao verificar pedidos:", error);
                }
            }
            if (mounted) setCheckingOrder(false);
        };
        verificarPedidoExistente();
        return () => { mounted = false; };
    }, [id, selectedUnit]);


    const handleRequest = async () => {
        const idCliente = localStorage.getItem("id");
        const numericMedId = extractId(id);
        const numericUnitId = extractId(selectedUnit?.id);

        if (!idCliente) {
            toast({ variant: "destructive", title: "Erro", description: "Login necessário." });
            return;
        }
        
        setLoadingPedido(true);
        try {
            const dataEntrega = new Date();
            dataEntrega.setDate(dataEntrega.getDate() + 3);

            await criarPedido({
                id_cliente: Number(idCliente),
                id_medicamento: numericMedId,
                id_unidade: numericUnitId,
                id_funcionario: 1, 
                quantidade: 1,
                data_entrega: dataEntrega.toISOString().split('T')[0],
                horario_entrega: "14:00"
            });
            setIsRequested(true);
            toast({ title: "Sucesso", description: "Pedido realizado." });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Falha no pedido." });
        } finally {
            setLoadingPedido(false);
        }
    };

    return (
        <div>
             <div className="relative ml-7 mt-7">
                <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1">{selectedUnit.name}</h2>
                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5">
                        <Eye className="w-3 h-3 mr-1" />
                        1 visualizando este medicamento
                    </Badge>
                </div>
                <Button onClick={onBack} variant="ghost" size="sm" className="absolute top-2 right-4 gap-2">
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
                            src={foto_url || "https://via.placeholder.com/400x400?text=Sem+Imagem"} 
                            alt={name}
                            className="w-full aspect-square object-cover rounded-2xl border-2 border-border shadow-md"
                        />
                    </div>
                </div>

                <Card className="p-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            {getMedicationIcon(tipo)}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tipo de Medicamento</p>
                            <p className="font-semibold text-foreground capitalize">{tipo || 'Geral'}</p>
                        </div>
                    </div>
                </Card>

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
                    
                    {quantity <= 15 && (
                        <div className="mt-4 pt-4 border-t border-border">
                            {checkingOrder ? (
                                <div className="flex justify-center items-center py-4 text-muted-foreground gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Verificando disponibilidade...</span>
                                </div>
                            ) : !isRequested ? (
                                <>
                                    <Button 
                                        variant="destructive" 
                                        className="w-full gap-2"
                                        onClick={handleRequest}
                                        disabled={loadingPedido}
                                    >
                                        {loadingPedido ? <Loader2 className="h-4 w-4 animate-spin"/> : <AlertTriangle className="h-4 w-4" />}
                                        {loadingPedido ? "Processando..." : "Solicitar Mais Medicamentos"}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        O estoque está baixo. Solicite reposição para garantir sua retirada.
                                    </p>
                                </>
                            ) : (
                                <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4 animate-in fade-in zoom-in duration-300">
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-lg">
                                            <CheckCircle className="h-6 w-6" />
                                            <span>Solicitação Enviada!</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Aguarde a confirmação.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* 👇 AQUI ESTAVA O PROBLEMA DE COR */}
                {requiresPrescription && (
                    <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20 dark:border-l-yellow-600">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg h-fit">
                                <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
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

                <Card className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Sobre este Medicamento
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        {description || "Sem descrição disponível."}
                    </p>
                </Card>
            </div>
        </div>
    )
}