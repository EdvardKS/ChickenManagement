import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrderDrawer } from "./OrderDrawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const confirmOrder = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido confirmado",
        description: "El pedido ha sido confirmado y el stock actualizado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo confirmar el pedido",
        variant: "destructive",
      });
    }
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar el pedido",
        variant: "destructive",
      });
    }
  });

  const markAsError = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/error`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido marcado como error",
        description: "El pedido ha sido marcado como error",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo marcar el pedido como error",
        variant: "destructive",
      });
    }
  });

  const formatQuantity = (quantity: any) => {
    const num = Number(quantity);
    if (isNaN(num)) return quantity;
    if (Number.isInteger(num)) return num.toString();
    if (num % 1 === 0.5) return `${Math.floor(num)} 1/2`;
    return num.toString();
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

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
                <TableHead className="w-2/12 text-lg">Cliente</TableHead>
                <TableHead className="w-1/12 text-lg text-center">Pollos</TableHead>
                <TableHead className="w-1/12 text-lg text-center">Hora</TableHead>
                <TableHead className="w-2/12 text-lg">Detalles</TableHead>
                <TableHead className="w-4/12 text-lg">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateOrders.map((order, index) => (
                <TableRow key={order.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-lg font-medium">{order.customerName}</TableCell>
                  <TableCell className="text-lg text-center">{formatQuantity(order.quantity)}</TableCell>
                  <TableCell className="text-lg text-center">
                    {format(new Date(order.pickupTime), 'HH:mm')}
                  </TableCell>
                  <TableCell className="text-lg">{order.details || '-'}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOrderClick(order)}
                      className="relative hover:bg-[#a35118]"
                    >
                      Ver detalles
                      {order.customerPhone && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => confirmOrder.mutate(order.id)}
                      disabled={confirmOrder.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => cancelOrder.mutate(order.id)}
                      disabled={cancelOrder.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => markAsError.mutate(order.id)}
                      disabled={markAsError.isPending}
                      className="text-red-500 border-red-500 hover:bg-red-50"
                    >
                      Error
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
      />
    </div>
  );
}