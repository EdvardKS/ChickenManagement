import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart, DonutChart, LineChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Download, TrendingUp, Users, DollarSign, ShoppingCart, Package, Clock, PercentCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AdminLayout from "./layout";
import { Progress } from "@/components/ui/progress";

// Tipos de datos para la respuesta de la API
interface BusinessIntelligenceData {
  sales_by_month: {
    month: string;
    value: number;
    growth: number;
  }[];
  sales_by_day_of_week: {
    day: string;
    value: number;
    percent: number;
  }[];
  sales_by_hour: {
    hour: string;
    value: number;
    percent: number;
  }[];
  top_products: {
    name: string;
    value: number;
    percent: number;
  }[];
  customer_retention: {
    new_customers: number;
    returning_customers: number;
    retention_rate: number;
    monthly_trend: {
      month: string;
      new: number;
      returning: number;
      rate: number;
    }[];
  };
  operational_metrics: {
    avg_preparation_time: number;
    avg_delivery_time: number;
    on_time_delivery_rate: number;
    order_accuracy: number;
    monthly_trend: {
      month: string;
      prep_time: number;
      delivery_time: number;
      on_time_rate: number;
      accuracy: number;
    }[];
  };
  stock_kpi: {
    stock_turnover_rate: number;
    avg_stock_level: number;
    out_of_stock_incidents: number;
    stock_efficiency: number;
    monthly_trend: {
      month: string;
      turnover: number;
      avg_level: number;
      incidents: number;
      efficiency: number;
    }[];
  };
  sales_prediction: {
    next_30_days: {
      total_predicted_sales: number;
      trend_percentage: number;
      confidence_interval: [number, number];
    };
    daily_forecast: {
      date: string;
      predicted: number;
      lower: number;
      upper: number;
    }[];
  };
}

export default function BusinessIntelligencePage() {
  const [activeTab, setActiveTab] = useState("ventas");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/predictions/business-intelligence"],
    onError: (error: any) => {
      console.error("Error al obtener datos de Business Intelligence:", error);
    },
    onSuccess: (data) => {
      console.log("Business Intelligence data:", data);
    },
  });
  
  const handleExportData = () => {
    if (!data) return;
    
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `business_intelligence_${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 p-8">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-[400px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los datos de Business Intelligence. Por favor intente nuevamente más tarde.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }
  
  if (!data) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No hay datos</AlertTitle>
            <AlertDescription>
              No hay datos de Business Intelligence disponibles en este momento.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }
  
  const businessData: BusinessIntelligenceData = data as BusinessIntelligenceData;
  
  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" /> Exportar Datos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Predicción de Ventas (30 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <div className="text-2xl font-bold">
                  €{businessData.sales_prediction.next_30_days.total_predicted_sales.toLocaleString()}
                </div>
                <div className={`flex items-center ${
                  businessData.sales_prediction.next_30_days.trend_percentage >= 0 
                    ? "text-green-500" 
                    : "text-red-500"
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{businessData.sales_prediction.next_30_days.trend_percentage}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Intervalo de confianza: €{businessData.sales_prediction.next_30_days.confidence_interval[0].toLocaleString()} - 
                €{businessData.sales_prediction.next_30_days.confidence_interval[1].toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Retención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <div className="text-2xl font-bold">
                  {businessData.customer_retention.retention_rate.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-sm">
                  <span className="font-medium">{businessData.customer_retention.returning_customers}</span> de <span className="font-medium">{businessData.customer_retention.new_customers + businessData.customer_retention.returning_customers}</span>
                </div>
              </div>
              <Progress 
                value={businessData.customer_retention.retention_rate} 
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Eficiencia de Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <div className="text-2xl font-bold">
                  {businessData.stock_kpi.stock_efficiency.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-sm">
                  Rotación: {businessData.stock_kpi.stock_turnover_rate.toFixed(1)}x
                </div>
              </div>
              <Progress 
                value={businessData.stock_kpi.stock_efficiency} 
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Precisión de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-baseline">
                <div className="text-2xl font-bold">
                  {businessData.operational_metrics.order_accuracy.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-sm">
                  A tiempo: {businessData.operational_metrics.on_time_delivery_rate.toFixed(1)}%
                </div>
              </div>
              <Progress 
                value={businessData.operational_metrics.order_accuracy} 
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="ventas" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="ventas">Análisis de Ventas</TabsTrigger>
            <TabsTrigger value="clientes">Análisis de Clientes</TabsTrigger>
            <TabsTrigger value="operaciones">Métricas Operativas</TabsTrigger>
            <TabsTrigger value="stock">Métricas de Stock</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ventas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Mes</CardTitle>
                  <CardDescription>Evolución mensual de ventas</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <AreaChart 
                    data={businessData.sales_by_month.map(item => ({
                      name: item.month, 
                      total: item.value
                    }))} 
                    categories={["total"]} 
                    index="name"
                    colors={["blue"]}
                    valueFormatter={(value: number) => `€${value.toLocaleString()}`}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Día de la Semana</CardTitle>
                  <CardDescription>Distribución de ventas por día</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <BarChart 
                    data={businessData.sales_by_day_of_week.map(item => ({
                      name: item.day, 
                      total: item.value
                    }))} 
                    categories={["total"]} 
                    index="name"
                    colors={["blue"]}
                    valueFormatter={(value: number) => `€${value.toLocaleString()}`}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Hora</CardTitle>
                  <CardDescription>Distribución de ventas por hora del día</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <BarChart 
                    data={businessData.sales_by_hour.map(item => ({
                      name: item.hour, 
                      total: item.value
                    }))} 
                    categories={["total"]} 
                    index="name"
                    colors={["blue"]}
                    valueFormatter={(value: number) => `€${value.toLocaleString()}`}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                  <CardDescription>Distribución de ventas por producto</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DonutChart 
                    data={businessData.top_products.map(item => ({
                      name: item.name, 
                      value: item.value
                    }))} 
                    category="value"
                    index="name"
                    valueFormatter={(value: number) => `€${value.toLocaleString()}`}
                    colors={["blue", "indigo", "violet", "purple", "fuchsia", "pink"]}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="clientes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Retención de Clientes</CardTitle>
                  <CardDescription>Nuevos vs. Recurrentes</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <DonutChart 
                    data={[
                      { name: "Nuevos", value: businessData.customer_retention.new_customers },
                      { name: "Recurrentes", value: businessData.customer_retention.returning_customers }
                    ]} 
                    category="value"
                    index="name"
                    valueFormatter={(value: number) => `${value} clientes`}
                    colors={["blue", "green"]}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Retención Mensual</CardTitle>
                  <CardDescription>Tasa de retención por mes</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart 
                    data={businessData.customer_retention.monthly_trend.map(item => ({
                      month: item.month,
                      rate: item.rate
                    }))} 
                    categories={["rate"]} 
                    index="month"
                    colors={["green"]}
                    valueFormatter={(value: number) => `${value.toFixed(1)}%`}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Clientes Nuevos vs. Recurrentes</CardTitle>
                <CardDescription>Evolución mensual</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={businessData.customer_retention.monthly_trend.map(item => ({
                    month: item.month,
                    Nuevos: item.new,
                    Recurrentes: item.returning
                  }))} 
                  categories={["Nuevos", "Recurrentes"]} 
                  index="month"
                  colors={["blue", "green"]}
                  valueFormatter={(value: number) => `${value} clientes`}
                  stack
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="operaciones" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tiempos de Preparación y Entrega</CardTitle>
                  <CardDescription>Evolución mensual</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart 
                    data={businessData.operational_metrics.monthly_trend.map(item => ({
                      month: item.month,
                      "Preparación": item.prep_time,
                      "Entrega": item.delivery_time
                    }))} 
                    categories={["Preparación", "Entrega"]} 
                    index="month"
                    colors={["blue", "orange"]}
                    valueFormatter={(value: number) => `${value.toFixed(1)} min`}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Entrega a Tiempo y Precisión</CardTitle>
                  <CardDescription>Evolución mensual</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart 
                    data={businessData.operational_metrics.monthly_trend.map(item => ({
                      month: item.month,
                      "A Tiempo": item.on_time_rate,
                      "Precisión": item.accuracy
                    }))} 
                    categories={["A Tiempo", "Precisión"]} 
                    index="month"
                    colors={["green", "purple"]}
                    valueFormatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Tiempo Preparación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.operational_metrics.avg_preparation_time} min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promedio de tiempo de preparación
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Tiempo Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.operational_metrics.avg_delivery_time} min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promedio de tiempo de entrega
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <PercentCircle className="h-4 w-4 mr-2" />
                    Entrega a Tiempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.operational_metrics.on_time_delivery_rate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tasa de entrega a tiempo
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <PercentCircle className="h-4 w-4 mr-2" />
                    Precisión de Pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.operational_metrics.order_accuracy}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Precisión de los pedidos
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rotación de Stock Mensual</CardTitle>
                  <CardDescription>Tendencia mensual</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart 
                    data={businessData.stock_kpi.monthly_trend.map(item => ({
                      month: item.month,
                      turnover: item.turnover
                    }))} 
                    categories={["turnover"]} 
                    index="month"
                    colors={["blue"]}
                    valueFormatter={(value: number) => `${value.toFixed(1)}x`}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Nivel Promedio de Stock</CardTitle>
                  <CardDescription>Tendencia mensual</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart 
                    data={businessData.stock_kpi.monthly_trend.map(item => ({
                      month: item.month,
                      "Nivel Promedio": item.avg_level,
                      "Eficiencia (%)": item.efficiency
                    }))} 
                    categories={["Nivel Promedio", "Eficiencia (%)"]} 
                    index="month"
                    colors={["orange", "green"]}
                    valueFormatter={(value: number, category) => 
                      category === "Eficiencia (%)" ? `${value.toFixed(1)}%` : value.toFixed(0)
                    }
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Tasa de Rotación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.stock_kpi.stock_turnover_rate.toFixed(1)}x
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Veces que rota el stock mensualmente
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Nivel Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.stock_kpi.avg_stock_level.toFixed(0)} unidades
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nivel promedio de stock
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Fuera de Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData.stock_kpi.out_of_stock_incidents} incidentes
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Incidentes de falta de stock
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Stock Mensual</CardTitle>
                <CardDescription>Tendencia mensual de eficiencia</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={businessData.stock_kpi.monthly_trend.map(item => ({
                    month: item.month,
                    efficiency: item.efficiency,
                    incidents: item.incidents * 5 // Escalar para visualización
                  }))} 
                  categories={["efficiency", "incidents"]} 
                  index="month"
                  colors={["green", "red"]}
                  valueFormatter={(value: number, category) => 
                    category === "efficiency" 
                      ? `${value.toFixed(1)}%` 
                      : `${value / 5} incidentes`
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Próximos 7 Días - Previsión de Ventas</CardTitle>
            <CardDescription>Basado en el modelo de predicción de ventas</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <AreaChart 
              data={businessData.sales_prediction.daily_forecast.map(item => ({
                date: format(new Date(item.date), "EEE dd/MM", { locale: es }),
                prediccion: item.predicted,
                minimo: item.lower,
                maximo: item.upper
              }))} 
              categories={["prediccion", "minimo", "maximo"]} 
              index="date"
              colors={["blue", "gray", "gray"]}
              valueFormatter={(value: number) => `€${value.toLocaleString()}`}
              showLegend={true}
              showAnimation={true}
              showGradient={true}
              curveType="monotone"
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}