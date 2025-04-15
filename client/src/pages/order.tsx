import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderForm from "@/components/order-form";
import type { Stock } from "@shared/schema";

export default function Order() {
  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock'] 
  });

  return ( 
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">Realizar Pedido</h1>

      <Card>
        <CardHeader>
          <CardTitle>Stock Disponible (Informativo)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Pollos disponibles hoy: {stock?.currentStock ?? 0}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Nota: Puedes realizar pedidos sin importar la cantidad disponible.
          </p>
        </CardContent>
      </Card>

      <OrderForm currentStock={stock?.currentStock ? Number(stock.currentStock) : 0} />
    </div>
  );
}
