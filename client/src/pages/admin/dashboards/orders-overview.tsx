import { useQuery } from "@tanstack/react-query";
import { type Order } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

type OrderAnalytics = {
  status: string;
  count: number;
};

type OrderTrend = {
  date: string;
  pedidos: number;
};

type QuantityDistribution = {
  cantidad: string;
  pedidos: number;
};

type CustomerStats = {
  cliente: string;
  pedidos: number;
};

export default function OrdersOverview() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return <OrdersOverviewSkeleton />;
  }

  if (!orders) {
    return null;
  }

  // Procesar datos para las gráficas
  const ordersByStatus = orders.reduce<Record<string, number>>((acc, order) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const orderStatusData: OrderAnalytics[] = Object.entries(ordersByStatus).map(([status, count]) => ({
    status,
    count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Agrupar pedidos por día
  const ordersByDate = orders.reduce<Record<string, number>>((acc, order) => {
    const date = format(new Date(order.createdAt), "yyyy-MM-dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const orderTrendData: OrderTrend[] = Object.entries(ordersByDate)
    .map(([date, count]) => ({
      date,
      pedidos: count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Distribución de cantidades
  const quantityDistribution = orders.reduce<Record<number, number>>((acc, order) => {
    const quantity = parseFloat(order.quantity.toString());
    const range = Math.floor(quantity);
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  const quantityData: QuantityDistribution[] = Object.entries(quantityDistribution)
    .map(([quantity, count]) => ({
      cantidad: `${quantity} pollos`,
      pedidos: count,
    }))
    .sort((a, b) => a.cantidad.localeCompare(b.cantidad));

  // Top clientes
  const customerOrders = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.customerName] = (acc[order.customerName] || 0) + 1;
    return acc;
  }, {});

  const topCustomers: CustomerStats[] = Object.entries(customerOrders)
    .map(([name, count]) => ({
      cliente: name,
      pedidos: count,
    }))
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, 5);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 font-poppins">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Pedidos</CardTitle>
          <CardDescription>Distribución actual de los pedidos por estado</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={orderStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {orderStatusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Pedidos</CardTitle>
          <CardDescription>Número de pedidos por día</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orderTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Cantidades</CardTitle>
          <CardDescription>Número de pedidos por cantidad de pollos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quantityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cantidad" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Clientes</CardTitle>
          <CardDescription>Clientes con más pedidos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="cliente" width={100} />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersOverviewSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 font-poppins">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}