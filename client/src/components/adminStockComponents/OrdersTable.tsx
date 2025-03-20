import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrderDrawer } from "./OrderDrawer";
import type { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

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

  const handleConfirm = async (orderId: number) => {
    try {
      const order = orders?.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      // Simplificamos la llamada para evitar errores de fecha
      await apiRequest("PATCH", `/api/orders/${orderId}/confirm`, {});

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido entregado",
        description: "El pedido ha sido marcado como entregado y el stock ha sido actualizado",
      });
    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar el pedido como entregado",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (orderId: number) => {
    try {
      const order = orders?.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      // Simplificamos la llamada para evitar errores de fecha
      await apiRequest("PATCH", `/api/orders/${orderId}/cancel`, {});

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado y el stock ha sido actualizado",
      });
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar el pedido",
        variant: "destructive",
      });
    }
  };

  const handleError = async (orderId: number) => {
    try {
      const order = orders?.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      // Simplificamos la llamada para evitar errores de fecha
      await apiRequest("PATCH", `/api/orders/${orderId}/error`, {});

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido marcado como error",
        description: "El pedido ha sido marcado como error y el stock ha sido actualizado",
      });
    } catch (error) {
      console.error('Error al marcar pedido como error:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar el pedido como error",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (order: Order) => {
    try {
      const originalOrder = orders?.find(o => o.id === order.id);
      if (!originalOrder) {
        throw new Error('Pedido original no encontrado');
      }

      // Calculate stock difference for update
      const quantityDiff = parseFloat(order.quantity) - parseFloat(originalOrder.quantity);

      await apiRequest("PATCH", `/api/orders/${order.id}`, {
        ...order,
        quantityDiff,
        updateType: "order_update",
        pickupTime: new Date(order.pickupTime).toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido actualizado",
        description: "El pedido ha sido actualizado y el stock ha sido ajustado",
      });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (order: Order) => {
    if (!order.customerPhone) return;

    const message = `Hola ${order.customerName}, tu pedido de ${formatQuantity(order.quantity)} pollos está listo.`;
    const encodedMessage = encodeURIComponent(message);
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  // Filter out deleted orders and group remaining ones by date
  const ordersByDate = orders?.filter(order => !order.deleted && order.status !== 'cancelled' && order.status !== 'error')
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
                <TableHead className="w-3/12 text-lg">Cliente</TableHead>
                <TableHead className="w-2/12 text-lg text-center">Pollos</TableHead>
                <TableHead className="w-2/12 text-lg text-center">Hora</TableHead>
                <TableHead className="w-3/12 text-lg">Detalles</TableHead>
                <TableHead className="w-2/12 text-lg">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateOrders.map((order, index) => (
                <TableRow key={order.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="w-3/12 text-lg font-medium">
                    {order.customerName}
                    {order.customerPhone && (
                      <Button
                        variant="ghost"
                        className="ml-2 p-1"
                        onClick={() => handleWhatsApp(order)}
                      >
                        📱
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="w-2/12 text-lg text-center">{formatQuantity(order.quantity)}</TableCell>
                  <TableCell className="w-2/12 text-lg text-center">
                    {format(new Date(order.pickupTime), 'HH:mm')}
                  </TableCell>
                  <TableCell className="w-3/12 text-lg">{order.details || '-'}</TableCell>
                  <TableCell className="w-2/12">
                    <Button
                      variant="outline"
                      onClick={() => handleOrderClick(order)}
                      className="relative w-20 p-4 text-lg hover:bg-gray-200"
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
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onError={handleError}
        onUpdate={handleUpdate}
      />
    </div>
  );
}