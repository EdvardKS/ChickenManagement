import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, Stock } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

export default function AdminOrders() {
  const { toast } = useToast();

  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders'] 
  });

  const { data: stock } = useQuery<Stock>({
    queryKey: ['/api/stock']
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido actualizado",
        description: "El estado del pedido se ha actualizado correctamente"
      });
    }
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente"
      });
    }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Control de Stock</h2>
        {stock && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stock Inicial</p>
              <p className="text-2xl font-bold">{stock.initialStock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stock Actual</p>
              <p className="text-2xl font-bold">{stock.currentStock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stock Comprometido</p>
              <p className="text-2xl font-bold">{stock.committed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stock Disponible</p>
              <p className="text-2xl font-bold">{stock.currentStock - stock.committed}</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-xl font-semibold mb-4">Pedidos Pendientes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map(order => (
              <TableRow key={order.id}>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.customerPhone}</TableCell>
                <TableCell>{order.items?.join(", ") || "Sin items"}</TableCell>
                <TableCell>{(order.totalAmount / 100).toFixed(2)}€</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell className="space-x-2">
                  {order.status === "pending" && (
                    <Button
                      onClick={() => updateOrder.mutate({ 
                        id: order.id, 
                        status: "completed" 
                      })}
                      disabled={updateOrder.isPending}
                    >
                      Completar
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => deleteOrder.mutate(order.id)}
                    disabled={deleteOrder.isPending}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}