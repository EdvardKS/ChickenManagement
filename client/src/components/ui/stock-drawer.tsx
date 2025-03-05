import { useState } from "react";
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

  // Función para manejar ventas directas y correcciones
  const handleDirectSale = async (quantity: number) => {
    try {
      console.log("[StockDrawer] Iniciando operación con cantidad:", quantity);

      // Determinamos el endpoint basado en si es venta o corrección
      const endpoint = quantity < 0 ? "/api/stock/remove" : "/api/stock/add";
      const absoluteQuantity = Math.abs(quantity);

      console.log("[StockDrawer] Preparando petición:", {
        endpoint,
        quantity: absoluteQuantity.toString()
      });

      // Realizamos la petición
      const res = await apiRequest("POST", endpoint, { 
        quantity: absoluteQuantity.toString(),
        updateType: quantity < 0 ? 'direct_sale' : 'direct_sale_correction'
      });

      if (!res.ok) {
        throw new Error(`Error en la respuesta: ${res.status}`);
      }

      const data = await res.json();
      console.log("[StockDrawer] Respuesta recibida:", data);

      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });

      toast({
        title: quantity < 0 ? "Venta registrada" : "Corrección registrada",
        description: quantity < 0 ? 
          "La venta se ha registrado correctamente" : 
          "La corrección se ha registrado correctamente"
      });
    } catch (error) {
      console.error("[StockDrawer] Error en operación:", error);
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
            Gestiona ventas directas y correcciones
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-8">
          <div className="grid grid-cols-2 gap-4">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}