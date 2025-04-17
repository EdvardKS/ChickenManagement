import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrderDrawer } from "./OrderDrawer";
import type { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    await apiRequest(`/api/orders/${orderId}/confirm`, {
      method: "PATCH"
    });

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
      description: error instanceof Error ? error.message : "No se pudo marcar el pedido como entregado",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


const handleDelete = async (orderId: number) => {
  try {
    setIsLoading(true);
    const order = orders?.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    await apiRequest(`/api/orders/${orderId}/cancel`, {
      method: "PATCH"
    });

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
      description: error instanceof Error ? error.message : "No se pudo cancelar el pedido",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

const handleError = async (orderId: number) => {
  try {
    setIsLoading(true);
    const order = orders?.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    await apiRequest(`/api/orders/${orderId}/error`, {
      method: "PATCH"
    });

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
      description: error instanceof Error ? error.message : "No se pudo marcar el pedido como error",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleUpdate = async (order: Order) => {
    try {
      setIsLoading(true);
      const originalOrder = orders?.find(o => o.id === order.id);
      if (!originalOrder) {
        throw new Error('Pedido original no encontrado');
      }

      // Calculate stock difference for update
      const quantityDiff = parseFloat(order.quantity.toString()) - parseFloat(originalOrder.quantity.toString());

      // Datos a enviar en la solicitud PATCH
      const updateData = {
        customerName: order.customerName,
        quantity: order.quantity.toString(),
        details: order.details,
        pickupTime: order.pickupTime,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        status: "pending",  // Siempre mantenemos el estado como pending
        deleted: false,     // Siempre mantenemos deleted como false
        confirmado: false,  // Añadido campo confirmado
        error: false,       // Añadido campo error
        // Información adicional para la actualización del stock
        quantityDiff,
        updateType: "order_update"
      };

      console.log('📤 OrdersTable - handleUpdate - Sending update:', updateData);

      const response = await apiRequest(`/api/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Solo intentamos parsear como JSON si hay una respuesta de error
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar el pedido');
      }
      
      // Para respuestas exitosas no intentamos parsear el cuerpo si no es necesario

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      setIsDrawerOpen(false);
      toast({
        title: "Pedido actualizado",
        description: "El pedido ha sido actualizado y el stock ha sido ajustado",
      });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (order: Order, messageType: 'ready' | 'confirmed' = 'ready') => {
    if (!order.customerPhone) return;

    let message = '';
    if (messageType === 'ready') {
      message = `Hola ${order.customerName}, tu pedido de ${formatQuantity(order.quantity)} pollos está listo.`;
    } else if (messageType === 'confirmed') {
      message = `Hola ${order.customerName}, su pedido de ${formatQuantity(order.quantity)} pollos ha sido CONFIRMADO. Gracias por su reserva.`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  // Filtrar pedidos para mostrar solo los pendientes:
  // Simplificando la lógica a mostrar sólo ordenes con status = 'pending'
  const ordersByDate = orders?.filter(order => order.status === 'pending')
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
                      <>
                        <Button
                          variant="ghost"
                          className="ml-2 p-1"
                          onClick={() => handleWhatsApp(order)}
                          title="Pedido listo"
                        >
                          📱
                        </Button>
                        <Button
                          variant="ghost"
                          className="ml-1 p-1"
                          onClick={() => handleWhatsApp(order, 'confirmed')}
                          title="Pedido confirmado"
                        >
                          ✅
                        </Button>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="w-2/12 text-lg text-center">{formatQuantity(order.quantity)}</TableCell>
                  <TableCell className="w-2/12 text-lg text-center">
                    {format(new Date(order.pickupTime), 'HH:mm')}
                  </TableCell>
                  <TableCell className="w-3/12 text-lg">{order.details || '-'}</TableCell>
                  <TableCell className="w-2/12 flex space-x-2 items-center">
                    <Button
                      variant="outline"
                      onClick={() => handleOrderClick(order)}
                      className="relative w-20 p-4 text-lg hover:bg-gray-200"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : '🔘'}
                      {order.customerPhone && !isLoading && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                    {order.customerPhone && (
                      <Button
                        variant="outline"
                        onClick={() => handleWhatsApp(order, 'confirmed')}
                        className="w-10 p-2 text-lg hover:bg-green-100"
                        title="Enviar mensaje de confirmación por WhatsApp"
                      >
                        <span className="text-green-600 text-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163A11.867 11.867 0 0 1 0 11.83C0 5.313 5.313 0 11.83 0S23.66 5.313 23.66 11.83s-5.313 11.83-11.83 11.83c-1.99 0-3.95-.51-5.688-1.48L.057 24zM11.83 1.96C6.32 1.96 1.96 6.32 1.96 11.83c0 1.827.494 3.610 1.428 5.17L2.26 21.67l4.75-1.238a9.777 9.777 0 0 0 4.82 1.26c5.51 0 9.87-4.36 9.87-9.87s-4.36-9.87-9.87-9.87zm5.845 12.545c-.08-.13-.29-.208-.607-.365-.316-.157-1.867-.923-2.157-1.03-.29-.106-.5-.16-.71.16-.21.318-.814 1.03-.997 1.24-.184.21-.368.234-.684.077-.316-.157-1.334-.493-2.542-1.57-.94-.838-1.572-1.87-1.756-2.19-.184-.318-.02-.49.14-.648.143-.15.316-.39.474-.585.16-.195.212-.34.318-.57.106-.23.053-.43-.027-.608-.08-.177-.71-1.713-.972-2.345-.26-.63-.52-.54-.71-.55-.185-.012-.396-.013-.607-.013-.21 0-.553.08-.842.398-.29.318-1.104 1.08-1.104 2.635 0 1.556 1.13 3.06 1.29 3.27.158.21 2.243 3.22 5.428 4.51 3.186 1.292 3.186.86 3.76.807.576-.052 1.867-.766 2.128-1.503.26-.738.26-1.366.183-1.502z"/>
                          </svg>
                        </span>
                      </Button>
                    )}
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
        isLoading={isLoading}
      />
    </div>
  );
}