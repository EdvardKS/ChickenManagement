import { useQuery } from "@tanstack/react-query";
import { type Stock, type StockHistory } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

type StockDistribution = {
  name: string;
  value: number;
};

type StockTimelinePoint = {
  fecha: string;
  stock: number;
  cantidad: number;
};

type StockUsage = {
  fecha: string;
  uso: number;
};

export default function StockLevelsBasic() {
  const { data: currentStock, isLoading: stockLoading } = useQuery<Stock>({
    queryKey: ["/api/stock"],
  });

  const { data: stockHistory, isLoading: historyLoading } = useQuery<StockHistory[]>({
    queryKey: ["/api/stock/history"],
  });

  if (stockLoading || historyLoading || !currentStock || !stockHistory) {
    return <StockLevelsBasicSkeleton />;
  }

  // Datos para el gráfico de stock actual
  const stockDistribution: StockDistribution[] = [
    { name: "Stock Reservado", value: parseFloat(currentStock.reservedStock) },
    { name: "Stock Disponible", value: parseFloat(currentStock.unreservedStock) },
  ];

  const COLORS = ["#FF8042", "#00C49F"];

  // Procesar historial de stock para la línea de tiempo
  const stockTimeline: StockTimelinePoint[] = stockHistory
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((record) => ({
      fecha: format(new Date(record.createdAt), "dd/MM HH:mm"),
      stock: parseFloat(record.newStock.toString()),
      cantidad: parseFloat(record.quantity.toString()),
    }));

  // Calcular la tasa de uso diaria
  const stockUsageRate = stockHistory
    .filter((record) => record.action === "remove" || record.action === "sell")
    .reduce<Record<string, number>>((acc, record) => {
      const date = format(new Date(record.createdAt), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + parseFloat(record.quantity.toString());
      return acc;
    }, {});

  const usageData: StockUsage[] = Object.entries(stockUsageRate).map(([date, usage]) => ({
    fecha: date,
    uso: usage,
  }));

  // Predicción de reposición
  const averageUsage = Object.values(stockUsageRate).reduce((a, b) => a + b, 0) / Object.values(stockUsageRate).length || 1;
  const daysUntilEmpty = parseFloat(currentStock.unreservedStock) / averageUsage;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Niveles de Stock</h1>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 font-poppins">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Stock</CardTitle>
            <CardDescription>Stock actual reservado vs. disponible</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stockDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
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
            <CardTitle>Historial de Stock</CardTitle>
            <CardDescription>Cambios en el nivel de stock a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stock" stroke="#8884d8" name="Nivel de Stock" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso de Stock</CardTitle>
            <CardDescription>Tendencia de consumo diario</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="uso" stroke="#82ca9d" fill="#82ca9d" name="Uso Diario" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análisis de Reposición</CardTitle>
            <CardDescription>Estimación de necesidad de reposición</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] flex flex-col justify-center items-center text-center">
            <div className="text-4xl font-bold mb-4">
              {daysUntilEmpty.toFixed(1)} días
            </div>
            <p className="text-muted-foreground">
              Tiempo estimado hasta necesitar reposición
            </p>
            <p className="mt-4">
              Uso promedio diario: {averageUsage.toFixed(1)} unidades
            </p>
            <p>
              Stock disponible: {parseFloat(currentStock.unreservedStock).toFixed(1)} unidades
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StockLevelsBasicSkeleton() {
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