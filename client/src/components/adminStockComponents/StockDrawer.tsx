import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Stock } from "@shared/schema";

interface StockDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockDrawer({ isOpen, onOpenChange }: StockDrawerProps) {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: 'add_mounted' | 'remove_mounted' | 'direct_sale' | 'direct_sale_correction' | 'reset', quantity?: number } | null>(null);
  const { data: stock } = useQuery<Stock>({ queryKey: ['/api/stock'] });

  // Mutación para actualizar el stock montado (agregar pollos al stock montado)
  const addMountedStock = useMutation({
    mutationFn: async (quantity: number) => {
      return await apiRequest("/api/stock/mounted/add", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pollos montados añadidos",
        description: `Se han añadido ${data.quantity || ""} pollos al stock montado correctamente`
      });
    },
    onError: (error) => {
      console.error("Error añadiendo pollos montados:", error);
      toast({
        title: "Error",
        description: "No se pudieron añadir pollos al stock montado",
        variant: "destructive"
      });
    }
  });

  // Mutación para quitar pollos del stock montado (corrección)
  const removeMountedStock = useMutation({
    mutationFn: async (quantity: number) => {
      return await apiRequest("/api/stock/mounted/remove", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Corrección de pollos montados",
        description: `Se ha realizado la corrección de ${data.quantity || ""} pollos montados correctamente`
      });
    },
    onError: (error) => {
      console.error("Error en corrección de pollos montados:", error);
      toast({
        title: "Error",
        description: "No se pudo realizar la corrección de pollos montados",
        variant: "destructive"
      });
    }
  });

  // Mutación para venta directa sin encargo
  const directSale = useMutation({
    mutationFn: async (quantity: number) => {
      return await apiRequest("/api/stock/direct-sale", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Venta directa registrada",
        description: `Se ha registrado la venta de ${data.quantity || ""} pollos correctamente`
      });
    },
    onError: (error) => {
      console.error("Error registrando venta directa:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la venta sin encargo",
        variant: "destructive"
      });
    }
  });

  // Mutación para corrección de venta directa
  const directSaleCorrection = useMutation({
    mutationFn: async (quantity: number) => {
      return await apiRequest("/api/stock/direct-sale/correct", { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Corrección registrada",
        description: `Se ha registrado la corrección de ${data.quantity || ""} pollos correctamente`
      });
    },
    onError: (error) => {
      console.error("Error registrando corrección:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la corrección de venta",
        variant: "destructive"
      });
    }
  });

  // Mutación para resetear el stock
  const resetStock = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/stock/reset", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Stock reseteado",
        description: "Los valores del día han sido reseteados correctamente",
      });
    },
    onError: (error) => {
      console.error("Error al resetear stock:", error);
      toast({
        title: "Error",
        description: "No se pudo resetear el stock del día",
        variant: "destructive"
      });
    }
  });

  // Manejador para pollos montados (initial_stock)
  const handleMountedStock = (quantity: number) => {
    setPendingAction({ 
      action: quantity > 0 ? 'add_mounted' : 'remove_mounted', 
      quantity: Math.abs(quantity) 
    });
    setShowConfirmDialog(true);
  };

  // Manejador para ventas sin encargo y correcciones - sin mostrar confirmación
  const handleDirectSale = (quantity: number) => {
    if (quantity < 0) {
      // Venta directa sin encargo - ejecutar inmediatamente
      directSale.mutate(Math.abs(quantity));
    } else {
      // Corrección de venta - ejecutar inmediatamente
      directSaleCorrection.mutate(quantity);
    }
  };

  // Manejador para resetear stock
  const handleResetStock = () => {
    setPendingAction({ action: 'reset' });
    setShowConfirmDialog(true);
  };

  // Confirmación de acción pendiente
  const handleConfirmAction = () => {
    if (!pendingAction) return;

    switch (pendingAction.action) {
      case 'add_mounted':
        if (pendingAction.quantity) {
          addMountedStock.mutate(pendingAction.quantity);
        }
        break;
      case 'remove_mounted':
        if (pendingAction.quantity) {
          removeMountedStock.mutate(pendingAction.quantity);
        }
        break;
      case 'direct_sale':
        if (pendingAction.quantity) {
          directSale.mutate(pendingAction.quantity);
        }
        break;
      case 'direct_sale_correction':
        if (pendingAction.quantity) {
          directSaleCorrection.mutate(pendingAction.quantity);
        }
        break;
      case 'reset':
        resetStock.mutate();
        break;
    }
    
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  // Formatea las cantidades para mostrar números enteros o con decimales según corresponda
  const formatQuantity = (quantity: string | number) => {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    return num === Math.floor(num) ? num.toString() : num.toFixed(1);
  };

  // Calcula y muestra el número de barras y pollos individuales
  const calculateBars = (quantity: number) => {
    const bars = Math.floor(quantity / 6);
    const remainingChickens = quantity % 6;
    return remainingChickens > 0 ? `${bars} barras y ${remainingChickens} pollos` : `${bars} barras`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-full sm:w-[74%] flex flex-col" aria-describedby="drawer-description">
        <DrawerHeader>
          <DrawerTitle className="text-center text-5xl py-5">Stock Actual 🐔</DrawerTitle>
          <DrawerDescription id="drawer-description" className="sr-only">
            Gestión del stock de pollos actual. Permite añadir o quitar pollos del stock montado y registrar ventas directas.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4 flex-grow overflow-auto">
          {/* Total de pollos Montado - Solo se edita con los botones de esta card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Total de pollos Montado:</Label>
              <div className="flex justify-between items-center mt-2">
                <Button 
                  className="text-2xl p-5" 
                  variant="outline" 
                  onClick={() => handleMountedStock(-1)}
                >
                  -1
                </Button>
                <span className="text-4xl font-bold">
                  {formatQuantity(stock?.initialStock || 0)}
                </span>
                <Button 
                  className="text-2xl p-5" 
                  variant="outline" 
                  onClick={() => handleMountedStock(1)}
                >
                  +1
                </Button>
              </div>
              <div className="flex justify-between mt-4">
                <Button 
                  className="text-2xl p-5" 
                  variant="outline" 
                  onClick={() => handleMountedStock(-6)}
                >
                  -6
                </Button>
                <Button 
                  className="text-2xl p-5" 
                  variant="outline" 
                  onClick={() => handleMountedStock(6)}
                >
                  +6
                </Button>
              </div>
              <div className="mt-4 font-semibold">
                {calculateBars(parseFloat(stock?.initialStock || "0"))}
              </div>
            </div>

            {/* Total de pollos Actual - Se actualiza automáticamente, no se edita directamente */}
            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Total de pollos Actual:</Label>
              <div className="text-4xl font-bold mt-2">
                {formatQuantity(stock?.currentStock || 0)}
              </div>
            </div>
          </div>

          {/* Mostrar valores de stock con encargos y sin encargos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Con Encargos:</Label>
              <div className="text-4xl font-bold mt-2">
                {formatQuantity(stock?.reservedStock || 0)}
              </div>
            </div>

            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Sin Encargo:</Label>
              <div className="text-4xl font-bold mt-2">
                {formatQuantity(stock?.unreservedStock || 0)}
              </div>
            </div>
          </div>

          {/* Sección para ventas sin encargo */}
          <div className="border p-5 rounded-lg text-center">
            <Label className="text-lg font-semibold">Venta de SIN encargo:</Label>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button 
                className="bg-slate-700 text-white text-2xl p-6 py-12" 
                onClick={() => handleDirectSale(-0.5)}
              >
                -0.5
              </Button>
              <Button 
                className="bg-slate-700 text-white text-2xl p-6 py-12" 
                onClick={() => handleDirectSale(0.5)}
              >
                +0.5
              </Button>
              <Button 
                className="bg-blue-600 text-white text-2xl p-6 py-12" 
                onClick={() => handleDirectSale(-1)}
              >
                -1
              </Button>
              <Button 
                className="text-2xl p-6 py-12" 
                variant="outline" 
                onClick={() => handleDirectSale(1)}
              >
                +1
              </Button>
            </div>
          </div>

          {/* Botón para resetear valores */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full border border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white"
              onClick={handleResetStock}
            >
              Resetear Valores
            </Button>
          </div>
        </div>
      </DrawerContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent aria-describedby="alert-dialog-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
            <AlertDialogDescription id="alert-dialog-description">
              {(() => {
                if (!pendingAction) return "";
                
                switch (pendingAction.action) {
                  case 'add_mounted':
                    return `¿Estás seguro de que deseas añadir ${pendingAction.quantity} pollos montados?`;
                  case 'remove_mounted':
                    return `¿Estás seguro de que deseas quitar ${pendingAction.quantity} pollos montados (corrección)?`;
                  case 'direct_sale':
                    return `¿Confirmas la venta sin encargo de ${pendingAction.quantity} pollos?`;
                  case 'direct_sale_correction':
                    return `¿Confirmas la corrección de ${pendingAction.quantity} pollos en venta directa?`;
                  case 'reset':
                    return "¿Estás seguro de que deseas resetear los valores del día? Esto creará un nuevo registro en la base de datos.";
                  default:
                    return "";
                }
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}