import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrderDrawer } from "./OrderDrawer";
import type { Order } from "@shared/schema";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleConfirm = (orderId: number) => {
    console.log(`Pedido confirmado con ID: ${orderId}`);
    // Aquí puedes agregar la lógica de confirmación (ej. actualización en el backend)
  };

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
                  <TableCell className="w-3/12 text-lg font-medium">{order.customerName}</TableCell>
                  <TableCell className="w-2/12 text-lg text-center">{formatQuantity(order.quantity)}</TableCell>
                  <TableCell className="w-2/12 text-lg text-center">
                    {format(new Date(order.pickupTime), 'HH:mm')}
                  </TableCell>
                  <TableCell className="w-3/12 text-lg">{order.details || '-'}</TableCell>
                  <TableCell className="w-2/12">
                    <Button
                      variant="outline"
                      onClick={() => handleOrderClick(order)}
                      className="relative w-20 p-4 text-lg hover:bg-[#a35118]"
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
        onConfirm={handleConfirm}  // ✅ Se agrega la función onConfirm
      />
    </div>
  );


}
