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

  const updateStock = useMutation({
    mutationFn: async ({ action, quantity }: { action: 'add' | 'remove' | 'sell'; quantity: number }) => {
      const res = await apiRequest("POST", `/api/stock/${action}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
    },
  });

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

  const handleUpdateStock = (action: 'add' | 'remove', quantity: number) => {
    setPendingAction({ action, quantity });
    setShowConfirmDialog(true);
  };

  const handleResetStock = () => {
    setPendingAction({ action: 'reset' });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (pendingAction?.action === 'reset') {
      resetStock.mutate();
    } else if (pendingAction) {
      updateStock.mutate({ action: pendingAction.action, quantity: pendingAction.quantity! });
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const formatQuantity = (quantity: number) => {
    return quantity === Math.floor(quantity) ? quantity.toString() : quantity.toString();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-full sm:w-[74%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Stock Actual 🐔</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 space-y-4 flex-grow overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Total de pollos Montado:</Label>
              <div className="flex justify-between items-center mt-2">
                <Button className="text-2xl p-5" variant="outline" onClick={() => handleUpdateStock('remove', 1)}>-1</Button>
                <span className="text-4xl font-bold">{formatQuantity(stock?.currentStock || 0)}</span>
                <Button className="text-2xl p-5" variant="outline" onClick={() => handleUpdateStock('add', 1)}>+1</Button>
              </div>
              <div className="flex justify-between mt-4">
                <Button className="text-2xl p-5" variant="outline" onClick={() => handleUpdateStock('remove', 6)}>-6</Button>
                <Button className="text-2xl p-5" variant="outline" onClick={() => handleUpdateStock('add', 6)}>+6</Button>
              </div>
            </div>

            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Total de pollos Actual:</Label>
              <div className="text-4xl font-bold mt-2">{formatQuantity(stock?.currentStock || 0)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Con Encargos:</Label>
              <div className="text-4xl font-bold mt-2">{formatQuantity(stock?.reservedStock || 0)}</div>
            </div>

            <div className="border p-5 rounded-lg text-center">
              <Label className="text-lg font-semibold">Sin Encargo:</Label>
              <div className="text-4xl font-bold mt-2">{formatQuantity(stock?.unreservedStock || 0)}</div>
            </div>
          </div>

          <div className="border p-5 rounded-lg text-center">
            <Label className="text-lg font-semibold">Venta de SIN encargo:</Label>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button className="bg-black text-white text-2xl p-6 py-12" onClick={() => updateStock.mutate({ action: 'sell', quantity: 0.5 })}>-0.5</Button>
              <Button className="bg-black text-white text-2xl p-6 py-12" onClick={() => updateStock.mutate({ action: 'add', quantity: 0.5 })}>+0.5</Button>
              <Button className="bg-blue-500 text-white text-2xl p-6 py-12" onClick={() => updateStock.mutate({ action: 'sell', quantity: 1 })}>-1</Button>
              <Button className="text-2xl p-6 py-12" variant="outline" onClick={() => updateStock.mutate({ action: 'add', quantity: 1 })}>+1</Button>
            </div>
          </div>
 
        {/* Contenedor fijo para el botón */}
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
        <AlertDialogContent 
          className={`p-6 rounded-lg text-center shadow-lg ${pendingAction?.action === 'reset' ? 'bg-red-600 text-white' : 'bg-white text-black'}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Confirmar Acción
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg mt-2">
              {pendingAction?.action === 'reset'
                ? "¿Estás seguro de que deseas resetear los valores del día?"
                : `¿Estás seguro de que deseas ${pendingAction?.action === 'add' ? 'añadir' : 'quitar'} ${pendingAction?.quantity} pollos?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center gap-4 mt-4">
            <AlertDialogCancel className="px-6 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={`px-6 py-2 rounded-md font-semibold ${
                pendingAction?.action === 'reset'
                  ? 'bg-white text-red-600 border border-red-600 hover:bg-red-700 hover:text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      
    </Drawer>
  );
}
