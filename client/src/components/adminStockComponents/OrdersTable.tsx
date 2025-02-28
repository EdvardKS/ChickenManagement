import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OrderDrawer } from "./OrderDrawer";
import { Bell } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const completeOrder = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/confirm`);
      return res.json();
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
      setIsDrawerOpen(false);
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

  const markAsError = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/orders/${id}/error`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido marcado como error",
        description: "El pedido se ha marcado como error correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo marcar el pedido como error",
        variant: "destructive",
      });
    },
  });

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pedidos Pendientes</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Hora de Recogida</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map(order => (
              <TableRow key={order.id}>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.quantity} pollos</TableCell>
                <TableCell>{order.details || '-'}</TableCell>
                <TableCell>{order.pickupTime}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => handleOrderClick(order)}
                    className="relative"
                  >
                    🔘
                    {order.needsWhatsApp && (
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