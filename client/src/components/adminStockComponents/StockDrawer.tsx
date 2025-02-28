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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Stock } from "@shared/schema";

interface StockDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockDrawer({ isOpen, onOpenChange }: StockDrawerProps) {
  const { toast } = useToast();
  const { data: stock } = useQuery<Stock>({ queryKey: ['/api/stock'] });

  const updateStock = useMutation({
    mutationFn: async ({ action, quantity }: { action: 'add' | 'remove' | 'sell'; quantity: number }) => {
      const res = await apiRequest("POST", `/api/stock/${action}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive",
      });
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

  const handleUpdateStock = (action: 'add' | 'remove' | 'sell', quantity: number) => {
    updateStock.mutate({ action, quantity });
  };

  const handleResetDay = () => {
    if (window.confirm("¿Estás seguro de que deseas resetear los valores del día? Esta acción no se puede deshacer.")) {
      resetStock.mutate();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-[74%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Stock Actual 🐔</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 flex-grow overflow-auto">
          <div className="border p-3 rounded-lg">
            <Label>Total de pollos Montado:</Label>
            <div className="flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={() => handleUpdateStock('remove', 1)}
                disabled={updateStock.isPending}
              >-1</Button>
              <span className="text-xl font-bold">{stock?.currentStock || 0}</span>
              <Button 
                variant="outline"
                onClick={() => handleUpdateStock('add', 1)}
                disabled={updateStock.isPending}
              >+1</Button>
            </div>
            <div className="flex justify-between mt-2">
              <Button 
                variant="outline"
                onClick={() => handleUpdateStock('remove', 6)}
                disabled={updateStock.isPending}
              >-6</Button>
              <Button 
                variant="outline"
                onClick={() => handleUpdateStock('add', 6)}
                disabled={updateStock.isPending}
              >+6</Button>
            </div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Total de pollos Actual:</Label>
            <div className="text-xl font-bold">{stock?.currentStock || 0}</div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Con Encargos:</Label>
            <div className="text-xl font-bold">{stock?.reservedStock || 0}</div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Sin Encargo:</Label>
            <div className="text-xl font-bold">{stock?.unreservedStock || 0}</div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Venta de SIN encargo:</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                className="bg-black text-white"
                onClick={() => handleUpdateStock('sell', 0.5)}
                disabled={updateStock.isPending}
              >-0.5</Button>
              <Button 
                className="bg-black text-white"
                onClick={() => handleUpdateStock('add', 0.5)}
                disabled={updateStock.isPending}
              >+0.5</Button>
              <Button 
                className="bg-blue-500 text-white"
                onClick={() => handleUpdateStock('sell', 1)}
                disabled={updateStock.isPending}
              >-1</Button>
              <Button 
                variant="outline"
                onClick={() => handleUpdateStock('add', 1)}
                disabled={updateStock.isPending}
              >+1</Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button 
            variant="destructive" 
            className="w-full text-sm py-2" 
            onClick={handleResetDay}
            disabled={resetStock.isPending}
          >
            {resetStock.isPending ? "Reseteando..." : "Resetear Valores"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}