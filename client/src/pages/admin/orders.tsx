import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function AdminOrders() {
  const { toast } = useToast();

  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders'] 
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
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
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente"
      });
    }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>

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
                  >
                    Completar
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => deleteOrder.mutate(order.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}