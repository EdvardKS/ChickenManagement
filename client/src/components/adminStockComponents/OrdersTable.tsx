import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const { toast } = useToast();

  const completeOrder = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status: "completed" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido completado",
        description: "El pedido se ha marcado como completado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo completar el pedido",
        variant: "destructive",
      });
    },
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
        description: "El pedido se ha eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido",
        variant: "destructive",
      });
    },
  });

  const handleComplete = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas marcar este pedido como completado?")) {
      completeOrder.mutate(id);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
      deleteOrder.mutate(id);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pedidos Pendientes</h2>
      <div className="rounded-md border">
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
                  <Button
                    onClick={() => handleComplete(order.id)}
                    disabled={completeOrder.isPending}
                  >
                    Completar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(order.id)}
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