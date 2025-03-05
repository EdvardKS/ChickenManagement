import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Stock } from "@shared/schema";

interface StockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockDrawer({ open, onOpenChange }: StockDrawerProps) {
  const { toast } = useToast();
  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock'] 
  });

  const handleDirectSale = async (amount: number) => {
    try {
      console.log("⚡ Enviando venta directa:", { amount });

      const res = await apiRequest("POST", "/api/stock/direct-sale", { 
        amount: amount.toString() // Enviamos como string
      });

      if (!res.ok) {
        throw new Error(`Error en la respuesta: ${res.status}`);
      }

      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Venta registrada",
        description: "La operación se ha registrado correctamente"
      });
    } catch (error) {
      console.error("❌ Error en venta directa:", error);
      toast({
        title: "Error",
        description: "No se pudo realizar la operación",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Venta SIN encargo</SheetTitle>
          <SheetDescription>
            Gestiona ventas directas
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <Button
            onClick={() => handleDirectSale(-0.5)}
            variant="outline"
          >
            -0.5
          </Button>
          <Button
            onClick={() => handleDirectSale(0.5)}
            variant="outline"
          >
            +0.5
          </Button>
          <Button
            onClick={() => handleDirectSale(-1)}
            variant="outline"
          >
            -1
          </Button>
          <Button
            onClick={() => handleDirectSale(1)}
            variant="outline"
          >
            +1
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}