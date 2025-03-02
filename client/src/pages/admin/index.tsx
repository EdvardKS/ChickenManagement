import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, ChartBar, Package, Settings, Database } from "lucide-react";
import { Link } from "wouter";
import type { Order } from "@shared/schema";

export default function AdminHome() {
  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders'] 
  });

  const pendingOrders = orders?.filter(o => o.status === "pending").length ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Link href="/admin/dashboards/orders-overview">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                Dashboards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Análisis y visualización de datos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/products">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestión de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Administrar menús y productos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gestionar ajustes del sistema</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/seeds">
          <Card className="hover:bg-accent cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestión de Semillas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Importar datos desde archivos JSON</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}