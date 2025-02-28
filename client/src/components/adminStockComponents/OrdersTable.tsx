import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Order } from "@shared/schema";

interface OrdersTableProps {
  orders: Order[] | undefined;
}

export function OrdersTable({ orders }: OrdersTableProps) {
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
                  <Button>Completar</Button>
                  <Button variant="destructive">Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
