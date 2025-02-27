import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Order, Stock } from "@shared/schema";

export default function AdminHome() {
  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders'] 
  });
  
  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock'] 
  });

  const pendingOrders = orders?.filter(o => o.status === "pending").length ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/admin/orders">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Pedidos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{pendingOrders}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/stock">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stock?.currentStock ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/products">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Gestión de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Administrar menús y productos</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
