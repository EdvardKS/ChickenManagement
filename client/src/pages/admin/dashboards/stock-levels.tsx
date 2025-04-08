import { useQuery } from "@tanstack/react-query";
import { type Stock, type StockHistory } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { useState } from "react";
import { AlertTriangle, TrendingUp, BrainCircuit, BarChart3, Loader2 } from "lucide-react";

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

type AIForecast = {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
};

type PredictionResult = {
  current_stock: {
    id: number;
    date: string;
    initial_stock: string;
    current_stock: string;
    reserved_stock: string;
    unreserved_stock: string;
    last_updated: string;
  };
  historical_analysis: {
    avg_daily_usage: number;
    days_until_empty: number;
    total_usage_last_30_days: number;
  };
  forecast_summary: {
    next_7_days: {
      total_usage: number;
      avg_daily_usage: number;
      max_usage: number;
      min_usage: number;
    };
    next_14_days: {
      total_usage: number;
      avg_daily_usage: number;
      max_usage: number;
      min_usage: number;
    };
    next_30_days: {
      total_usage: number;
      avg_daily_usage: number;
      max_usage: number;
      min_usage: number;
    };
  };
  plots: {
    prophet_forecast: string;
    prophet_components: string;
    ml_forecast: string;
  };
  full_forecast: AIForecast[];
};

type PatternResult = {
  hourly_distribution: {
    hourly_orders: Record<string, number>;
    hourly_orders_pct: Record<string, number>;
    hourly_stock_ops: Record<string, number>;
    hourly_stock_ops_pct: Record<string, number>;
  };
  weekly_distribution: {
    weekly_orders: Record<string, number>;
    weekly_orders_pct: Record<string, number>;
    weekly_stock_ops: Record<string, number>;
    weekly_stock_ops_pct: Record<string, number>;
  };
  monthly_distribution: {
    monthly_orders: Record<string, number>;
    monthly_orders_pct: Record<string, number>;
    monthly_stock_ops: Record<string, number>;
    monthly_stock_ops_pct: Record<string, number>;
  };
};

export default function StockLevels() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isTraining, setIsTraining] = useState(false);
  
  const { data: currentStock, isLoading: stockLoading } = useQuery<Stock>({
    queryKey: ["/api/stock"],
  });

  const { data: stockHistory, isLoading: historyLoading } = useQuery<StockHistory[]>({
    queryKey: ["/api/stock/history"],
  });
  
  const { 
    data: predictionData, 
    isLoading: predictionLoading,
    isError: predictionError,
    refetch: refetchPrediction
  } = useQuery<PredictionResult>({
    queryKey: ["/api/predictions/stock-usage"],
    enabled: activeTab === "ai-prediction" || activeTab === "forecast"
  });
  
  const {
    data: patternData,
    isLoading: patternLoading,
    isError: patternError,
    refetch: refetchPatterns
  } = useQuery<PatternResult>({
    queryKey: ["/api/predictions/patterns"],
    enabled: activeTab === "patterns"
  });
  
  const trainModels = async () => {
    if (isTraining) return;
    
    try {
      setIsTraining(true);
      const response = await fetch("/api/predictions/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: 90 })
      });
      
      if (!response.ok) {
        throw new Error("Failed to train models");
      }
      
      const result = await response.json();
      console.log("Training result:", result);
      
      // Refetch predictions after training
      await refetchPrediction();
      await refetchPatterns();
      
    } catch (error) {
      console.error("Error training models:", error);
    } finally {
      setIsTraining(false);
    }
  };

  if (stockLoading || historyLoading || !currentStock || !stockHistory) {
    return <StockLevelsSkeleton />;
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

  // Forecast data visualization
  const formatAIForecastData = () => {
    if (!predictionData?.full_forecast) return [];
    
    return predictionData.full_forecast.map(point => ({
      fecha: format(new Date(point.ds), "dd/MM"),
      prediccion: point.yhat,
      minimo: point.yhat_lower,
      maximo: point.yhat_upper
    }));
  };
  
  // Weekly pattern data visualization
  const formatWeeklyPatternData = () => {
    if (!patternData?.weekly_distribution) return [];
    
    const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    
    return weekDays.map(day => ({
      dia: day,
      ordenes: patternData.weekly_distribution.weekly_orders[day] || 0,
      operaciones: patternData.weekly_distribution.weekly_stock_ops[day] || 0
    }));
  };
  
  // Monthly pattern data visualization
  const formatMonthlyPatternData = () => {
    if (!patternData?.monthly_distribution) return [];
    
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    return months.map(month => ({
      mes: month,
      ordenes: patternData.monthly_distribution.monthly_orders[month] || 0,
      operaciones: patternData.monthly_distribution.monthly_stock_ops[month] || 0
    }));
  };
  
  // Hourly pattern data visualization
  const formatHourlyPatternData = () => {
    if (!patternData?.hourly_distribution) return [];
    
    return Array.from({ length: 24 }, (_, i) => ({
      hora: `${i}:00`,
      ordenes: patternData.hourly_distribution.hourly_orders[i] || 0,
      operaciones: patternData.hourly_distribution.hourly_stock_ops[i] || 0
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basic">
            <BarChart3 className="w-4 h-4 mr-2" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="ai-prediction">
            <BrainCircuit className="w-4 h-4 mr-2" />
            IA Predicción
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="w-4 h-4 mr-2" />
            Pronóstico
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <BarChart3 className="w-4 h-4 mr-2" />
            Patrones
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="mt-0">
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
        </TabsContent>
        
        <TabsContent value="ai-prediction" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={trainModels} disabled={isTraining}>
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrenando...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Entrenar Modelos
                </>
              )}
            </Button>
          </div>
          
          {predictionLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
          ) : predictionError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar las predicciones. Por favor intente de nuevo más tarde o entrene los modelos.
              </AlertDescription>
            </Alert>
          ) : predictionData ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Predicción IA</CardTitle>
                  <CardDescription>Predicción de uso de stock</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px]">
                  <img 
                    src={`/api/predictions/plots/${predictionData.plots.prophet_forecast}`} 
                    alt="Predicción de uso de stock" 
                    className="w-full h-full object-contain"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Componentes de Predicción</CardTitle>
                  <CardDescription>Análisis de factores estacionales</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px]">
                  <img 
                    src={`/api/predictions/plots/${predictionData.plots.prophet_components}`} 
                    alt="Componentes de predicción" 
                    className="w-full h-full object-contain"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Reposición IA</CardTitle>
                  <CardDescription>Estimación avanzada de necesidad de reposición</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px] flex flex-col justify-center items-center text-center">
                  <div className="text-4xl font-bold mb-4">
                    {predictionData.historical_analysis.days_until_empty.toFixed(1)} días
                  </div>
                  <p className="text-muted-foreground">
                    Tiempo estimado hasta necesitar reposición (IA)
                  </p>
                  <p className="mt-4">
                    Uso promedio diario: {predictionData.historical_analysis.avg_daily_usage.toFixed(1)} unidades
                  </p>
                  <p>
                    Stock disponible: {parseFloat(currentStock.unreservedStock).toFixed(1)} unidades
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Pronóstico</CardTitle>
                  <CardDescription>Resumen de predicciones para los próximos días</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px]">
                  <div className="space-y-6 h-full flex flex-col justify-center">
                    <div>
                      <h3 className="font-semibold">Próximos 7 días:</h3>
                      <p>Uso total: {predictionData.forecast_summary?.next_7_days?.total_usage.toFixed(1)} unidades</p>
                      <p>Uso diario promedio: {predictionData.forecast_summary?.next_7_days?.avg_daily_usage.toFixed(1)} unidades</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Próximos 14 días:</h3>
                      <p>Uso total: {predictionData.forecast_summary?.next_14_days?.total_usage.toFixed(1)} unidades</p>
                      <p>Uso diario promedio: {predictionData.forecast_summary?.next_14_days?.avg_daily_usage.toFixed(1)} unidades</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Próximos 30 días:</h3>
                      <p>Uso total: {predictionData.forecast_summary?.next_30_days?.total_usage.toFixed(1)} unidades</p>
                      <p>Uso diario promedio: {predictionData.forecast_summary?.next_30_days?.avg_daily_usage.toFixed(1)} unidades</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sin predicciones</AlertTitle>
              <AlertDescription>
                No hay datos de predicción disponibles. Por favor, entrene los modelos primero.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="forecast" className="mt-0">
          {predictionLoading ? (
            <Skeleton className="h-[600px] w-full" />
          ) : predictionError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar las predicciones. Por favor intente de nuevo más tarde o entrene los modelos.
              </AlertDescription>
            </Alert>
          ) : predictionData?.full_forecast ? (
            <Card>
              <CardHeader>
                <CardTitle>Pronóstico Detallado</CardTitle>
                <CardDescription>Predicción de uso de stock para los próximos 30 días</CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatAIForecastData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="prediccion" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Predicción" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="minimo" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.1}
                      name="Mínimo" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="maximo" 
                      stroke="#ffc658" 
                      fill="#ffc658" 
                      fillOpacity={0.1}
                      name="Máximo" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sin pronósticos</AlertTitle>
              <AlertDescription>
                No hay datos de pronóstico disponibles. Por favor, entrene los modelos primero.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="patterns" className="mt-0">
          {patternLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
          ) : patternError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar los patrones. Por favor intente de nuevo más tarde.
              </AlertDescription>
            </Alert>
          ) : patternData ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Patrón Semanal</CardTitle>
                  <CardDescription>Distribución de órdenes y operaciones por día de la semana</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatWeeklyPatternData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ordenes" fill="#8884d8" name="Órdenes" />
                      <Bar dataKey="operaciones" fill="#82ca9d" name="Operaciones de Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Patrón Mensual</CardTitle>
                  <CardDescription>Distribución de órdenes y operaciones por mes</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatMonthlyPatternData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ordenes" fill="#8884d8" name="Órdenes" />
                      <Bar dataKey="operaciones" fill="#82ca9d" name="Operaciones de Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Patrón Horario</CardTitle>
                  <CardDescription>Distribución de órdenes y operaciones por hora del día</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatHourlyPatternData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="ordenes" stroke="#8884d8" name="Órdenes" />
                      <Line type="monotone" dataKey="operaciones" stroke="#82ca9d" name="Operaciones de Stock" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Patrones</CardTitle>
                  <CardDescription>Resumen de patrones de uso y órdenes</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] min-h-[300px] flex flex-col justify-center">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Día más activo:</h3>
                      {(() => {
                        const weeklyData = formatWeeklyPatternData();
                        const mostActiveDay = weeklyData.reduce((prev, current) => 
                          (prev.ordenes > current.ordenes) ? prev : current, weeklyData[0]);
                        return (
                          <p>
                            {mostActiveDay.dia} ({mostActiveDay.ordenes.toFixed(0)} órdenes)
                          </p>
                        );
                      })()}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Hora pico:</h3>
                      {(() => {
                        const hourlyData = formatHourlyPatternData();
                        const peakHour = hourlyData.reduce((prev, current) => 
                          (prev.ordenes > current.ordenes) ? prev : current, hourlyData[0]);
                        return (
                          <p>
                            {peakHour.hora} ({peakHour.ordenes.toFixed(0)} órdenes)
                          </p>
                        );
                      })()}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Mes más activo:</h3>
                      {(() => {
                        const monthlyData = formatMonthlyPatternData();
                        const mostActiveMonth = monthlyData.reduce((prev, current) => 
                          (prev.ordenes > current.ordenes) ? prev : current, monthlyData[0]);
                        return (
                          <p>
                            {mostActiveMonth.mes} ({mostActiveMonth.ordenes.toFixed(0)} órdenes)
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sin patrones</AlertTitle>
              <AlertDescription>
                No hay datos de patrones disponibles. Por favor, entrene los modelos primero.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StockLevelsSkeleton() {
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