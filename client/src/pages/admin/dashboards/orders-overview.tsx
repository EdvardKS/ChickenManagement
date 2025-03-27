import { useQuery } from "@tanstack/react-query";
import { type Order, type Stock } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Badge
} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { format, parseISO, startOfDay, endOfDay, differenceInHours, addDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo } from "react";

// Type definitions for data structures
type OrderAnalytics = {
  status: string;
  count: number;
  color: string;
};

type OrderTrend = {
  date: string;
  pedidos: number;
  entregados: number;
  cancelados: number;
};

type QuantityDistribution = {
  cantidad: string;
  pedidos: number;
};

type CustomerStats = {
  cliente: string;
  pedidos: number;
  totalPollos: number;
};

type TimeDistribution = {
  hora: string;
  pedidos: number;
};

type DailyStats = {
  label: string;
  value: number;
};

// Map of order status to display names and colors
const orderStatusMap: Record<string, { name: string, color: string }> = {
  "pending": { name: "Pendiente", color: "#FFA500" },
  "delivered": { name: "Entregado", color: "#4CAF50" },
  "cancelled": { name: "Cancelado", color: "#F44336" },
  "error": { name: "Error", color: "#9C27B0" },
  "unknown": { name: "Desconocido", color: "#607D8B" }
};

export default function OrdersOverview() {
  const [timeFilter, setTimeFilter] = useState("30days");
  
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: stock, isLoading: stockLoading } = useQuery<Stock>({
    queryKey: ["/api/stock"],
  });

  if (ordersLoading || stockLoading || !orders || !stock) {
    return <OrdersOverviewSkeleton />;
  }

  // Filter orders based on timeFilter
  const filteredOrders = filterOrdersByTime(orders, timeFilter);
  
  // Calculating today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || new Date());
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });
  
  // Orders pending for today
  const pendingTodayOrders = orders.filter(order => {
    const pickupDate = new Date(order.pickupTime || new Date());
    pickupDate.setHours(0, 0, 0, 0);
    return (
      pickupDate.getTime() === today.getTime() && 
      order.status === "pending" && 
      !order.deleted
    );
  });
  
  // Calculate total quantities
  const totalOrderedQuantity = pendingTodayOrders.reduce(
    (sum, order) => sum + parseFloat(order.quantity.toString()), 
    0
  );
  
  const totalDeliveredQuantity = filteredOrders
    .filter(order => order.status === "delivered")
    .reduce((sum, order) => sum + parseFloat(order.quantity.toString()), 0);
  
  // Order status distribution
  const ordersByStatus = filteredOrders.reduce<Record<string, number>>((acc, order) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const orderStatusData: OrderAnalytics[] = Object.entries(ordersByStatus)
    .map(([status, count]) => ({
      status: orderStatusMap[status]?.name || status,
      count,
      color: orderStatusMap[status]?.color || "#999999"
    }))
    .sort((a, b) => b.count - a.count);

  // Orders trend over time
  const ordersByDate = filteredOrders.reduce<Record<string, { total: number, delivered: number, cancelled: number }>>((acc, order) => {
    const date = format(new Date(order.createdAt || new Date()), "yyyy-MM-dd");
    
    if (!acc[date]) {
      acc[date] = { total: 0, delivered: 0, cancelled: 0 };
    }
    
    acc[date].total += 1;
    
    if (order.status === "delivered") {
      acc[date].delivered += 1;
    } else if (order.status === "cancelled" || order.deleted) {
      acc[date].cancelled += 1;
    }
    
    return acc;
  }, {});

  const orderTrendData: OrderTrend[] = Object.entries(ordersByDate)
    .map(([date, stats]) => ({
      date: format(parseISO(date), "dd/MM"),
      pedidos: stats.total,
      entregados: stats.delivered,
      cancelados: stats.cancelled
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Quantity distribution
  const quantityGroups = filteredOrders.reduce<Record<string, number>>((acc, order) => {
    const quantity = parseFloat(order.quantity.toString());
    const range = Math.floor(quantity);
    const key = range === quantity ? `${quantity}` : `${range}-${range+0.5}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const quantityData: QuantityDistribution[] = Object.entries(quantityGroups)
    .map(([range, count]) => ({
      cantidad: `${range} pollos`,
      pedidos: count,
    }))
    .sort((a, b) => {
      const aNum = parseFloat(a.cantidad.split(" ")[0]);
      const bNum = parseFloat(b.cantidad.split(" ")[0]);
      return aNum - bNum;
    });

  // Top customers
  const customerStats = filteredOrders.reduce<Record<string, { orders: number, quantity: number }>>((acc, order) => {
    if (!acc[order.customerName]) {
      acc[order.customerName] = { orders: 0, quantity: 0 };
    }
    
    acc[order.customerName].orders += 1;
    acc[order.customerName].quantity += parseFloat(order.quantity.toString());
    
    return acc;
  }, {});

  const topCustomers: CustomerStats[] = Object.entries(customerStats)
    .map(([name, stats]) => ({
      cliente: name,
      pedidos: stats.orders,
      totalPollos: stats.quantity
    }))
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, 5);

  // Time distribution (pickup times)
  const pickupsByHour = filteredOrders.reduce<Record<number, number>>((acc, order) => {
    const hour = new Date(order.pickupTime).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const timeDistribution: TimeDistribution[] = Array.from({ length: 24 }, (_, i) => i)
    .map(hour => ({
      hora: `${hour}:00`,
      pedidos: pickupsByHour[hour] || 0
    }))
    .filter(item => item.pedidos > 0); // Only include hours with orders

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análisis de Pedidos</h2>
        <Select
          defaultValue={timeFilter}
          onValueChange={(value) => setTimeFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 días</SelectItem>
            <SelectItem value="30days">Últimos 30 días</SelectItem>
            <SelectItem value="90days">Últimos 3 meses</SelectItem>
            <SelectItem value="all">Todo el historial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pedidos Hoy</CardTitle>
            <CardDescription>Total nuevos pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaysOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pendientes Hoy</CardTitle>
            <CardDescription>Pedidos por entregar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTodayOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Stock Disponible</CardTitle>
            <CardDescription>Pollos sin reservar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{parseFloat(stock.unreservedStock).toFixed(1)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pollos Reservados</CardTitle>
            <CardDescription>Total pendiente entrega</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrderedQuantity.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Pedidos</CardTitle>
            <CardDescription>Evolución durante {timeFilter === "all" ? "todo el periodo" : `los últimos ${timeFilter === "7days" ? "7 días" : timeFilter === "30days" ? "30 días" : "3 meses"}`}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="pedidos" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Total Pedidos"
                />
                <Area 
                  type="monotone" 
                  dataKey="entregados" 
                  stackId="2"
                  stroke="#4CAF50" 
                  fill="#4CAF50" 
                  name="Entregados"
                />
                <Area 
                  type="monotone" 
                  dataKey="cancelados" 
                  stackId="2"
                  stroke="#F44336" 
                  fill="#F44336" 
                  name="Cancelados"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Pedidos</CardTitle>
            <CardDescription>Distribución por estado para el periodo seleccionado</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {orderStatusData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} pedidos`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tamaño</CardTitle>
            <CardDescription>Número de pedidos por cantidad de pollos</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quantityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cantidad" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} pedidos`, "Cantidad"]} />
                <Bar 
                  dataKey="pedidos" 
                  fill="#82ca9d" 
                  name="Pedidos" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Horarios Populares</CardTitle>
            <CardDescription>Distribución de pedidos por hora de recogida</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} pedidos`, "Cantidad"]} />
                <Bar 
                  dataKey="pedidos" 
                  fill="#8884d8" 
                  name="Pedidos" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Principales</CardTitle>
            <CardDescription>Los 5 clientes con mayor número de pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Nº Pedidos</TableHead>
                  <TableHead>Total Pollos</TableHead>
                  <TableHead>Promedio por Pedido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{customer.cliente}</TableCell>
                    <TableCell>{customer.pedidos}</TableCell>
                    <TableCell>{customer.totalPollos.toFixed(1)}</TableCell>
                    <TableCell>{(customer.totalPollos / customer.pedidos).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Pendientes Hoy</CardTitle>
            <CardDescription>Por entregar en las próximas horas</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTodayOrders.length > 0 ? (
              <div className="space-y-4">
                {pendingTodayOrders
                  .sort((a, b) => new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime())
                  .slice(0, 5)
                  .map((order) => {
                    const pickupTime = new Date(order.pickupTime);
                    const hoursUntilPickup = differenceInHours(pickupTime, new Date());
                    let urgencyColor = "#4CAF50"; // Green by default
                    
                    if (hoursUntilPickup < 0) {
                      urgencyColor = "#F44336"; // Red (past due)
                    } else if (hoursUntilPickup < 1) {
                      urgencyColor = "#FFC107"; // Yellow (urgent)
                    }
                    
                    return (
                      <div key={order.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <div className="font-medium">{order.customerName}</div>
                          <Badge style={{ backgroundColor: urgencyColor }}>
                            {format(pickupTime, "HH:mm")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {parseFloat(order.quantity.toString()).toFixed(1)} pollos
                        </div>
                        {order.customerPhone && (
                          <div className="text-sm mt-1">Tel: {order.customerPhone}</div>
                        )}
                      </div>
                    );
                  })}
                {pendingTodayOrders.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    + {pendingTodayOrders.length - 5} pedidos más
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No hay pedidos pendientes para hoy
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen del Periodo</CardTitle>
            <CardDescription>Estadísticas relevantes del periodo seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Pedidos</div>
                <div className="text-3xl font-bold">{filteredOrders.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Pollos Entregados</div>
                <div className="text-3xl font-bold">{totalDeliveredQuantity.toFixed(1)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Promedio Diario</div>
                <div className="text-3xl font-bold">
                  {(filteredOrders.length / (timeFilter === "all" ? 90 : parseInt(timeFilter))).toFixed(1)} pedidos
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tamaño Promedio</div>
                <div className="text-3xl font-bold">
                  {filteredOrders.length === 0 
                    ? "0" 
                    : (filteredOrders.reduce((sum, order) => sum + parseFloat(order.quantity.toString()), 0) / filteredOrders.length).toFixed(2)} pollos
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Estado de los Pedidos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {orderStatusData.map(status => (
                  <div key={status.status} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                    <div>
                      <span className="font-medium">{status.count}</span>
                      <span className="text-sm text-muted-foreground ml-1">{status.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Utility functions

function filterOrdersByTime(orders: Order[], timeFilter: string): Order[] {
  if (timeFilter === "all") {
    return [...orders];
  }

  const days = parseInt(timeFilter);
  const cutoffDate = addDays(new Date(), -days);
  
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt || new Date());
    return orderDate.getTime() >= cutoffDate.getTime();
  });
}

function OrdersOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[350px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[300px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[60px] w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[150px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}