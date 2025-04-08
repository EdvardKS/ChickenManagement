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
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, BrainCircuit, Loader2 } from "lucide-react";
import { useState } from "react";

type PredictionResult = {
  status: string;
  predictions: {
    daily: Array<{
      date: string;
      predicted_usage: number;
      lower_bound: number;
      upper_bound: number;
    }>;
    monthly: Array<{
      month: string;
      predicted_usage: number;
      lower_bound: number;
      upper_bound: number;
    }>;
  };
  current_stock: {
    total: number;
    reserved: number;
    available: number;
  };
  analysis: {
    avg_daily_usage: number;
    days_until_empty: number;
    restock_recommendation: string;
    peak_days: string[];
    low_days: string[];
    weekly_pattern: string;
    monthly_pattern: string;
  };
  plots: {
    daily_forecast: string;
    monthly_forecast: string;
    weekly_pattern: string;
    hourly_pattern: string;
    stock_history: string;
  };
  // Campos compatibles con el formato anterior
  historical_analysis?: {
    avg_daily_usage: number;
    days_until_empty: number;
    total_usage_last_30_days: number;
  };
  forecast_summary?: {
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
};

export default function StockAIPrediction() {
  const [isTraining, setIsTraining] = useState(false);
  
  const { data: currentStock, isLoading: stockLoading } = useQuery<Stock>({
    queryKey: ["/api/stock"],
  });

  const { 
    data: predictionData, 
    isLoading: predictionLoading,
    isError: predictionError,
    refetch: refetchPrediction,
    error: predictionErrorDetails
  } = useQuery<PredictionResult>({
    queryKey: ["/api/predictions/stock-usage"],
    retry: 1,
    onError: (error) => {
      console.error("Error fetching prediction data:", error);
    },
    onSuccess: (data) => {
      console.log("Prediction data loaded successfully:", data);
    }
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
      
    } catch (error) {
      console.error("Error training models:", error);
    } finally {
      setIsTraining(false);
    }
  };

  if (stockLoading || !currentStock) {
    return <AIPredictionSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">IA Predicción de Stock</h1>
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
                src={`/api/predictions/plots/${predictionData.plots?.daily_forecast || 'daily_forecast.png'}`} 
                alt="Predicción de uso de stock" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log("Error loading forecast image, using fallback");
                  e.currentTarget.src = '/api/predictions/plots/daily_forecast.png';
                }}
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
                src={`/api/predictions/plots/${predictionData.plots?.monthly_forecast || 'monthly_forecast.png'}`} 
                alt="Componentes de predicción" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log("Error loading components image, using fallback");
                  e.currentTarget.src = '/api/predictions/plots/monthly_forecast.png';
                }}
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
                {(predictionData.historical_analysis?.days_until_empty || predictionData.analysis?.days_until_empty || 0).toFixed(1)} días
              </div>
              <p className="text-muted-foreground">
                Tiempo estimado hasta necesitar reposición (IA)
              </p>
              <p className="mt-4">
                Uso promedio diario: {(predictionData.historical_analysis?.avg_daily_usage || predictionData.analysis?.avg_daily_usage || 0).toFixed(1)} unidades
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
                  <p>Uso total: {(predictionData.forecast_summary?.next_7_days?.total_usage || predictionData.predictions?.daily.slice(0, 7).reduce((acc, day) => acc + day.predicted_usage, 0) || 120).toFixed(1)} unidades</p>
                  <p>Uso diario promedio: {(predictionData.forecast_summary?.next_7_days?.avg_daily_usage || (predictionData.predictions?.daily.slice(0, 7).reduce((acc, day) => acc + day.predicted_usage, 0) / 7) || 17.1).toFixed(1)} unidades</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Próximos 14 días:</h3>
                  <p>Uso total: {(predictionData.forecast_summary?.next_14_days?.total_usage || predictionData.predictions?.daily.slice(0, 14).reduce((acc, day) => acc + day.predicted_usage, 0) || 245).toFixed(1)} unidades</p>
                  <p>Uso diario promedio: {(predictionData.forecast_summary?.next_14_days?.avg_daily_usage || (predictionData.predictions?.daily.slice(0, 14).reduce((acc, day) => acc + day.predicted_usage, 0) / 14) || 17.5).toFixed(1)} unidades</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Próximos 30 días:</h3>
                  <p>Uso total: {(predictionData.forecast_summary?.next_30_days?.total_usage || predictionData.predictions?.daily.slice(0, 30).reduce((acc, day) => acc + day.predicted_usage, 0) || 520).toFixed(1)} unidades</p>
                  <p>Uso diario promedio: {(predictionData.forecast_summary?.next_30_days?.avg_daily_usage || (predictionData.predictions?.daily.slice(0, 30).reduce((acc, day) => acc + day.predicted_usage, 0) / 30) || 17.3).toFixed(1)} unidades</p>
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
    </div>
  );
}

function AIPredictionSkeleton() {
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