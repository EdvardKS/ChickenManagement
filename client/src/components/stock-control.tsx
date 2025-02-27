import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Stock } from "@shared/schema";

interface StockControlProps {
  currentStock?: Stock;
}

export default function StockControl({ currentStock }: StockControlProps) {
  const { toast } = useToast();
  const [stockValue, setStockValue] = useState(currentStock?.currentStock ?? 0);

  const updateStock = useMutation({
    mutationFn: async (data: Partial<Stock>) => {
      const res = await apiRequest("PATCH", "/api/stock", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Stock actualizado",
        description: "El stock se ha actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive",
      });
    },
  });

  const handleStockUpdate = (type: 'add' | 'subtract', amount: number) => {
    const newStock = type === 'add' ? stockValue + amount : stockValue - amount;
    if (newStock < 0) {
      toast({
        title: "Error",
        description: "El stock no puede ser negativo",
        variant: "destructive",
      });
      return;
    }
    setStockValue(newStock);
    updateStock.mutate({
      currentStock: newStock,
      date: new Date(),
      initialStock: currentStock?.initialStock ?? newStock,
      committed: currentStock?.committed ?? 0,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Pollos disponibles:</Label>
            <div className="text-2xl font-bold">{stockValue}</div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Pedidos comprometidos:</Label>
            <div className="text-2xl font-bold">{currentStock?.committed ?? 0}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ajustar stock</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => handleStockUpdate('subtract', 1)}
                >
                  -1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStockUpdate('add', 1)}
                >
                  +1
                </Button>
              </div>
            </div>

            <div>
              <Label>Ajuste manual</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  value={stockValue}
                  onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                />
                <Button
                  onClick={() => updateStock.mutate({
                    currentStock: stockValue,
                    date: new Date(),
                    initialStock: currentStock?.initialStock ?? stockValue,
                    committed: currentStock?.committed ?? 0,
                  })}
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Stock inicial del día: {currentStock?.initialStock ?? 0}</div>
            <div>Ventas realizadas: {
              ((currentStock?.initialStock ?? 0) - (currentStock?.currentStock ?? 0))
            }</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
