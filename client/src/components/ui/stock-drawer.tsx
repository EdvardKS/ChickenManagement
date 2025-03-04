import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Stock } from "@shared/schema";

interface StockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockDrawer({ open, onOpenChange }: StockDrawerProps) {
  const { toast } = useToast();
  const [initialStock, setInitialStock] = useState("");
  const [currentStock, setCurrentStock] = useState("");

  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock'] 
  });

  useEffect(() => {
    if (stock) {
      setInitialStock(stock.initialStock.toString());
      setCurrentStock(stock.currentStock.toString());
    }
  }, [stock]);

  const updateStockMutation = useMutation({
    mutationFn: async (data: { quantity: number }) => {
      console.log("Enviando petición con cantidad:", data.quantity);
      const res = await apiRequest("POST", "/api/stock/add", { 
        quantity: data.quantity 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Stock actualizado",
        description: "El stock se ha actualizado correctamente"
      });
    },
    onError: (error) => {
      console.error("Error actualizando stock:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive"
      });
    }
  });

  const handleDirectSale = (quantity: number) => {
    console.log("Manejando venta directa con cantidad:", quantity);
    if (quantity < 0) {
      // Para restar, usamos la ruta remove
      const res = apiRequest("POST", "/api/stock/remove", { 
        quantity: Math.abs(quantity) 
      }).then(r => r.json())
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
        toast({
          title: "Stock actualizado",
          description: "El stock se ha actualizado correctamente"
        });
      })
      .catch((error) => {
        console.error("Error actualizando stock:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el stock",
          variant: "destructive"
        });
      });
    } else {
      // Para sumar, usamos la mutación existente
      updateStockMutation.mutate({ quantity });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Control de Stock</SheetTitle>
          <SheetDescription>
            Gestiona el stock de pollos disponibles
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label htmlFor="initialStock">Stock Inicial</Label>
            <Input
              id="initialStock"
              value={initialStock}
              type="number"
              min="0"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentStock">Stock Actual</Label>
            <Input
              id="currentStock"
              value={currentStock}
              type="number"
              min="0"
              disabled
            />
          </div>
          {stock && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stock Reservado:</span>
                <span className="font-medium">{stock.reservedStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stock Disponible:</span>
                <span className="font-medium">{stock.unreservedStock}</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleDirectSale(-0.5)}
              variant="outline"
              disabled={updateStockMutation.isPending}
            >
              -0.5
            </Button>
            <Button
              onClick={() => handleDirectSale(0.5)}
              variant="outline"
              disabled={updateStockMutation.isPending}
            >
              +0.5
            </Button>
            <Button
              onClick={() => handleDirectSale(-1)}
              variant="outline"
              disabled={updateStockMutation.isPending}
            >
              -1
            </Button>
            <Button
              onClick={() => handleDirectSale(1)}
              variant="outline"
              disabled={updateStockMutation.isPending}
            >
              +1
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}