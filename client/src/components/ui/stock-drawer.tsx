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
    mutationFn: async (data: { initialStock: number; currentStock: number }) => {
      const res = await apiRequest("PATCH", "/api/stock", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Stock actualizado",
        description: "El stock se ha actualizado correctamente"
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStockMutation.mutate({
      initialStock: parseInt(initialStock),
      currentStock: parseInt(currentStock)
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <img
              src="/img/corporativa/logo-negro.png"
              alt="Asador La Morenica"
              className="h-16"
            />
          </SheetTitle>
          <SheetDescription>
            Gestiona el stock de pollos disponibles
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label htmlFor="initialStock">Stock Inicial</Label>
            <Input
              id="initialStock"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              type="number"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentStock">Stock Actual</Label>
            <Input
              id="currentStock"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              type="number"
              min="0"
            />
          </div>
          {stock && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stock Comprometido:</span>
                <span className="font-medium">{stock.committed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stock Disponible:</span>
                <span className="font-medium">{stock.currentStock - stock.committed}</span>
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={updateStockMutation.isPending}
          >
            {updateStockMutation.isPending ? "Actualizando..." : "Actualizar Stock"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
