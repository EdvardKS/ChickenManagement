import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OrderDrawer } from "./OrderDrawer";
import { Bell } from "lucide-react";
import type { Order } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const completeOrder = useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log('Confirming order:', id);
        const res = await apiRequest("PATCH", `/api/orders/${id}/confirm`);
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error('Error al confirmar el pedido');
        const text = await res.text(); // Get response as text first
        console.log('Response text:', text);
        try {
          return text ? JSON.parse(text) : {}; // Parse if there's content
        } catch (e) {
          console.error('JSON parse error:', e);
          return {}; // Return empty object if parsing fails
        }
      } catch (error) {
        console.error('Complete order error:', error);
        throw new Error('No se pudo completar el pedido');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido completado",
        description: "El pedido se ha confirmado y el stock ha sido actualizado",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo completar el pedido",
        variant: "destructive",
      });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: number) => {
      try {
        const res = await apiRequest("DELETE", `/api/orders/${id}`);
        if (!res.ok) throw new Error('Error al eliminar el pedido');
      } catch (error) {
        throw new Error('No se pudo eliminar el pedido');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el pedido",
        variant: "destructive",
      });
    },
  });

  const markAsError = useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log('Marking order as error:', id);
        const res = await apiRequest("PATCH", `/api/orders/${id}/error`);
        console.log('Error marking response:', res.status);
        if (!res.ok) throw new Error('Error al marcar el pedido como error');
        return res.json();
      } catch (error) {
        console.error('Mark as error error:', error);
        throw new Error('No se pudo marcar el pedido como error');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido marcado como error",
        description: "El pedido se ha marcado como error correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el pedido como error",
        variant: "destructive",
      });
    },
  });

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Agrupar pedidos por fecha y filtrar los marcados como error
  const ordersByDate = orders?.filter(order => !order.deleted)
    .reduce((acc, order) => {
    const date = format(new Date(order.pickupTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Pedidos Pendientes</h2>

      {ordersByDate && Object.entries(ordersByDate).map(([date, dateOrders]) => (
        <div key={date} className="rounded-md border">
          <h3 className="text-xl font-medium p-4 bg-muted">
            {format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg">Cliente</TableHead>
                <TableHead className="text-lg">Cantidad</TableHead>
                <TableHead className="text-lg">Detalles</TableHead>
                <TableHead className="text-lg">Hora de Recogida</TableHead>
                <TableHead className="text-lg">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="text-lg font-medium">{order.customerName}</TableCell>
                  <TableCell className="text-lg">{order.quantity} pollos</TableCell>
                  <TableCell className="text-lg">{order.details || '-'}</TableCell>
                  <TableCell className="text-lg">
                    {format(new Date(order.pickupTime), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleOrderClick(order)}
                      className="relative"
                    >
                      🔘
                      {order.customerPhone && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      <OrderDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onConfirm={(id) => completeOrder.mutate(id)}
        onDelete={(id) => deleteOrder.mutate(id)}
        onError={(id) => markAsError.mutate(id)}
      />
    </div>
  );
}