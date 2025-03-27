import { useQuery } from "@tanstack/react-query";
import { type Stock, type StockHistory } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { format, differenceInDays, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActionTypeDistribution = {
  name: string;
  value: number;
};

type ActivityByHourData = {
  hour: number;
  count: number;
};

type ActivityByDayData = {
  day: string;
  count: number;
};

type StockTimelinePoint = {
  timestamp: string;
  dateFormatted: string;
  level: number;
  change: number;
  action: string;
};

// Mapping the action types to human-readable Spanish names
const actionTypeMap: Record<string, string> = {
  "add_mounted": "Montaje",
  "remove_mounted": "Desmontaje",
  "mounted_correction": "Corrección de Montaje",
  "direct_sale": "Venta Directa",
  "direct_sale_correction": "Corrección de Venta",
  "new_order": "Nuevo Pedido",
  "cancel_order": "Cancelación de Pedido",
  "order_delivered": "Pedido Entregado",
  "order_error": "Error en Pedido",
  "order_update": "Actualización de Pedido",
  "reset_stock": "Reseteo de Stock"
};

// Action type colors for visual consistency
const actionTypeColors: Record<string, string> = {
  "add_mounted": "#4CAF50",
  "remove_mounted": "#F44336",
  "mounted_correction": "#FFC107",
  "direct_sale": "#2196F3",
  "direct_sale_correction": "#9C27B0",
  "new_order": "#00BCD4",
  "cancel_order": "#FF5722",
  "order_delivered": "#3F51B5",
  "order_error": "#795548",
  "order_update": "#607D8B",
  "reset_stock": "#E91E63"
};

export default function StockHistory() {
  const [timeFilter, setTimeFilter] = useState("7days");
  
  const { data: stockHistory, isLoading: historyLoading } = useQuery<StockHistory[]>({
    queryKey: ["/api/stock/history"],
  });

  const { data: currentStock, isLoading: stockLoading } = useQuery<Stock>({
    queryKey: ["/api/stock"],
  });

  if (stockLoading || historyLoading || !stockHistory || !currentStock) {
    return <StockHistorySkeleton />;
  }

  // Filter data based on time selection
  const filteredHistory = filterHistoryByTime(stockHistory, timeFilter);

  // Process data for various visualizations
  const actionDistribution = getActionDistribution(filteredHistory);
  const activityByHour = getActivityByHour(filteredHistory);
  const activityByDay = getActivityByDay(filteredHistory);
  const stockTimeline = getStockTimeline(filteredHistory);
  
  // Calculate average daily activity
  const activityPerDay = filteredHistory.length / (timeFilter === "all" ? 30 : parseInt(timeFilter));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Historial de Stock</h2>
        <Select
          defaultValue={timeFilter}
          onValueChange={(value) => setTimeFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 días</SelectItem>
            <SelectItem value="14days">Últimos 14 días</SelectItem>
            <SelectItem value="30days">Últimos 30 días</SelectItem>
            <SelectItem value="all">Todo el historial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Operaciones</CardTitle>
            <CardDescription>Total en el periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Operaciones/Día</CardTitle>
            <CardDescription>Promedio en el periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activityPerDay.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Stock Actual</CardTitle>
            <CardDescription>Unidades disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{parseFloat(currentStock.unreservedStock).toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Stock Reservado</CardTitle>
            <CardDescription>Unidades reservadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{parseFloat(currentStock.reservedStock).toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Línea de Tiempo de Stock</CardTitle>
            <CardDescription>Cambios en el nivel de stock y operaciones</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd" 
                />
                <YAxis name="Nivel de Stock" />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === "change") {
                      return [`${value > 0 ? '+' : ''}${value}`, "Cambio"];
                    }
                    return [value, name === "level" ? "Nivel de Stock" : name];
                  }}
                  labelFormatter={(label) => {
                    const item = stockTimeline.find(item => item.dateFormatted === label);
                    return `${label} - ${item ? actionTypeMap[item.action] || item.action : ""}`;
                  }}
                />
                <Legend />
                <Line
                  type="stepAfter"
                  dataKey="level"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Nivel de Stock"
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="change"
                  stroke="#82ca9d"
                  name="Cambio"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo de Operación</CardTitle>
            <CardDescription>Frecuencia de cada tipo de operación</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {actionDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={actionTypeColors[
                        Object.keys(actionTypeMap).find(
                          key => actionTypeMap[key] === entry.name
                        ) || ""
                      ] || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} operaciones`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad por Hora del Día</CardTitle>
            <CardDescription>Distribución horaria de operaciones</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} operaciones`, "Cantidad"]}
                  labelFormatter={(hour) => `${hour}:00 - ${hour}:59`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8884d8" 
                  name="Operaciones" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad por Día de la Semana</CardTitle>
            <CardDescription>Distribución semanal de operaciones</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} operaciones`, "Cantidad"]}
                />
                <Bar 
                  dataKey="count" 
                  fill="#82ca9d" 
                  name="Operaciones" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro Detallado de Operaciones</CardTitle>
          <CardDescription>Últimas {Math.min(10, filteredHistory.length)} operaciones del periodo seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Tipo de Operación</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Stock Anterior</TableHead>
                <TableHead>Stock Nuevo</TableHead>
                <TableHead>Creado Por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.slice(0, 10).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      style={{ 
                        backgroundColor: actionTypeColors[item.action] || "#999",
                        color: 
                          ["add_mounted", "direct_sale", "order_delivered"].includes(item.action) 
                          ? "white" 
                          : "black" 
                      }}
                    >
                      {actionTypeMap[item.action] || item.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{parseFloat(item.quantity).toFixed(1)}</TableCell>
                  <TableCell>{parseFloat(item.previousStock).toFixed(1)}</TableCell>
                  <TableCell>{parseFloat(item.newStock).toFixed(1)}</TableCell>
                  <TableCell>{item.createdBy || "Sistema"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Utility functions for data processing

function filterHistoryByTime(history: StockHistory[], timeFilter: string): StockHistory[] {
  if (timeFilter === "all") {
    return [...history].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const days = parseInt(timeFilter);
  const cutoffDate = addDays(new Date(), -days);
  
  return history
    .filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getTime() > cutoffDate.getTime();
    })
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

function getActionDistribution(history: StockHistory[]): ActionTypeDistribution[] {
  const actionCounts: Record<string, number> = {};
  
  history.forEach(item => {
    const actionName = actionTypeMap[item.action] || item.action;
    actionCounts[actionName] = (actionCounts[actionName] || 0) + 1;
  });
  
  return Object.entries(actionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getActivityByHour(history: StockHistory[]): ActivityByHourData[] {
  const hourCounts: Record<number, number> = {};
  
  // Initialize all hours with 0
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }
  
  history.forEach(item => {
    const hour = new Date(item.createdAt || new Date()).getHours();
    hourCounts[hour] += 1;
  });
  
  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);
}

function getActivityByDay(history: StockHistory[]): ActivityByDayData[] {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const dayCounts: Record<string, number> = {};
  
  // Initialize all days with 0
  days.forEach(day => {
    dayCounts[day] = 0;
  });
  
  history.forEach(item => {
    const day = days[new Date(item.createdAt || new Date()).getDay()];
    dayCounts[day] += 1;
  });
  
  // Return in week order (starting Monday for better visualization)
  return [
    { day: "Lunes", count: dayCounts["Lunes"] },
    { day: "Martes", count: dayCounts["Martes"] },
    { day: "Miércoles", count: dayCounts["Miércoles"] },
    { day: "Jueves", count: dayCounts["Jueves"] },
    { day: "Viernes", count: dayCounts["Viernes"] },
    { day: "Sábado", count: dayCounts["Sábado"] },
    { day: "Domingo", count: dayCounts["Domingo"] }
  ];
}

function getStockTimeline(history: StockHistory[]): StockTimelinePoint[] {
  // Sort history by creation date (oldest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.createdAt || new Date()).getTime() - new Date(b.createdAt || new Date()).getTime()
  );
  
  return sortedHistory.map(item => {
    const createdDate = new Date(item.createdAt || new Date());
    const timestamp = createdDate.toISOString();
    const dateFormatted = format(createdDate, "dd/MM HH:mm");
    const level = parseFloat(item.newStock);
    const change = parseFloat(item.newStock) - parseFloat(item.previousStock);
    
    return {
      timestamp,
      dateFormatted,
      level,
      change,
      action: item.action
    };
  });
}

function StockHistorySkeleton() {
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

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-[400px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}