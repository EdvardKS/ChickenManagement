import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
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
  const [pendingAction, setPendingAction] = useState<{ action: 'add' | 'remove' | 'reset', quantity?: number } | null>(null);
  const { data: stock } = useQuery<Stock>({ queryKey: ['/api/stock'] });

  // Mutación para actualizar el stock montado (initial_stock)
  const updateMountedStock = useMutation({
    mutationFn: async ({ action, quantity }: { action: 'add' | 'remove'; quantity: number }) => {
      const currentInitialStock = parseFloat(stock?.initialStock || "0");
      const newInitialStock = action === 'add' ? 
        currentInitialStock + quantity : 
        currentInitialStock - quantity;

      const res = await apiRequest("POST", `/api/stock/update`, { 
        initialStock: newInitialStock.toString(),
        updateType: 'mounted' // Indica que es una actualización de stock montado
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Stock montado actualizado",
        description: "El stock montado se ha actualizado correctamente"
      });
    },
    onError: (error) => {
      console.error("Error actualizando stock montado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock montado",
        variant: "destructive"
      });
    }
  });

  // Mutación para ventas directas (afecta solo current_stock)
  const handleDirectSale = async (quantity: number) => {
    try {
      const endpoint = quantity < 0 ? "/api/stock/sell" : "/api/stock/add";
      const absoluteQuantity = Math.abs(quantity);

      await apiRequest("POST", endpoint, { 
        quantity: absoluteQuantity,
        updateType: 'sale' // Indica que es una venta directa
      });

      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: quantity < 0 ? "Venta registrada" : "Corrección registrada",
        description: quantity < 0 ? 
          "La venta se ha registrado correctamente" : 
          "La corrección se ha registrado correctamente"
      });
    } catch (error) {
      console.error("Error registrando operación:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la operación",
        variant: "destructive"
      });
    }
  };

  const handleMountedStock = (quantity: number) => {
    setPendingAction({ 
      action: quantity > 0 ? 'add' : 'remove', 
      quantity: Math.abs(quantity) 
    });
    setShowConfirmDialog(true);
  };

  const handleResetStock = () => {
    setPendingAction({ action: 'reset' });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.action === 'reset') {
      resetStock.mutate();
    } else if (pendingAction.quantity) {
      updateMountedStock.mutate({ 
        action: pendingAction.action, 
        quantity: pendingAction.quantity 
      });
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const formatQuantity = (quantity: string | number) => {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    return num === Math.floor(num) ? num.toString() : num.toFixed(1);
  };

  const calculateBars = (quantity: number) => {
    const bars = Math.floor(quantity / 6);
    const remainingChickens = quantity % 6;
    return remainingChickens > 0 ? `${bars} barras y ${remainingChickens} pollos` : `${bars} barras`;
  };

  const resetStock = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stock/reset", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Stock reseteado",
        description: "Los valores del día han sido reseteados correctamente",
      });
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-full sm:w-[74%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="text-center text-5xl py-5">Stock Actual 🐔</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4 flex-grow overflow-auto">
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

            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Total de pollos Actual:</Label>
              <div className="text-4xl font-bold mt-2">
                {formatQuantity(stock?.currentStock || 0)}
              </div>
            </div>
          </div>

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

          <div className="border p-5 rounded-lg text-center">
            <Label className="text-lg font-semibold">Venta de SIN encargo:</Label>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button 
                className="bg-black text-white text-2xl p-6 py-12" 
                onClick={() => handleDirectSale(-0.5)}
              >
                -0.5
              </Button>
              <Button 
                className="bg-black text-white text-2xl p-6 py-12" 
                onClick={() => handleDirectSale(0.5)}
              >
                +0.5
              </Button>
              <Button 
                className="bg-blue-500 text-white text-2xl p-6 py-12" 
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

          <div className="p-4">
            <Button
              variant="outline"
              className="w-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={handleResetStock}
            >
              Resetear Valores
            </Button>
          </div>
        </div>
      </DrawerContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Acción</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === 'reset'
                ? "¿Estás seguro de que deseas resetear los valores del día?"
                : `¿Estás seguro de que deseas ${pendingAction?.action === 'add' ? 'añadir' : 'quitar'} ${pendingAction?.quantity} pollos montados?`}
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