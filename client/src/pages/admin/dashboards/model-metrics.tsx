import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "./layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Tipos para los datos de métricas
interface ModelMetric {
  name: string;
  type: string;
  metrics: {
    mae: number;
    mse: number;
    rmse: number;
    mape: number;
    training_time: number;
    cross_validation_scores: Array<{
      fold: number;
      mae: number;
      mse: number;
    }>;
    training_parameters: Record<string, any>;
  };
  feature_importance: Array<{
    feature: string;
    importance: number;
  }> | null;
  hyperparameter_tuning: Array<{
    [key: string]: any;
    mae: number;
  }>;
}

interface ModelComparison {
  horizon: string;
  models: Array<{
    name: string;
    mae: number;
    rmse: number;
    training_time: number;
  }>;
}

interface ScenarioAnalysis {
  scenario: string;
  models: Array<{
    name: string;
    accuracy: number;
  }>;
}

interface MetricsData {
  model_training: {
    last_trained: string;
    models: ModelMetric[];
  };
  prediction_performance: {
    accuracy_over_time: Array<{
      date: string;
      accuracy: number;
      mae: number;
    }>;
    real_vs_predicted: Array<{
      date: string;
      real: number;
      predicted: number;
      error: number;
    }>;
    error_distribution: {
      histogram: Array<{
        range: string;
        count: number;
      }>;
      statistics: {
        mean_error: number;
        median_error: number;
        std_error: number;
        min_error: number;
        max_error: number;
      };
    };
  };
  model_comparisons: {
    time_horizons: ModelComparison[];
    scenario_analysis: ScenarioAnalysis[];
  };
  ensemble_model: {
    weights: Array<{
      model: string;
      weight: number;
    }>;
    performance: {
      mae: number;
      mse: number;
      rmse: number;
      mape: number;
    };
    improvement_over_best: {
      mae_improvement: string;
      rmse_improvement: string;
      mape_improvement: string;
    };
  };
  feature_engineering: {
    original_features: string[];
    engineered_features: Array<{
      name: string;
      description: string;
      importance: number;
    }>;
    improvement_with_engineering: {
      mae_improvement: string;
      feature_importance_gain: string;
    };
  };
  anomaly_detection: {
    detected_anomalies: Array<{
      date: string;
      expected: number;
      actual: number;
      z_score: number;
      cause: string;
    }>;
    sensitivity_analysis: {
      threshold_values: Array<{
        z_score: number;
        detection_rate: number;
        false_positives: number;
      }>;
      recommended_threshold: number;
    };
  };
  seasonal_decomposition: {
    components: Array<{
      name: string;
      description: string;
      strength: number;
      pattern: string;
    }>;
    visualization_data: {
      trend: Array<{
        date: string;
        value: number;
      }>;
      weekly_seasonality: Array<{
        day: string;
        effect: number;
      }>;
      monthly_seasonality: Array<{
        day: number;
        effect: number;
      }>;
    };
  };
}

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function ModelMetrics() {
  const [activeModel, setActiveModel] = useState("");
  const { toast } = useToast();
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['/api/predictions/model-metrics'],
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudieron cargar las métricas del modelo: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (data?.model_training?.models && data.model_training.models.length > 0) {
      setActiveModel(data.model_training.models[0].name);
    }
  }, [data]);

  const handleTrainModels = async () => {
    try {
      const response = await fetch('/api/predictions/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al entrenar los modelos');
      }
      
      toast({
        title: "Entrenamiento iniciado",
        description: "Se ha iniciado el entrenamiento de los modelos. Este proceso puede tomar unos minutos.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento de los modelos",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando métricas de modelos...</span>
        </div>
      </Layout>
    );
  }

  const metricsData = data as MetricsData;
  
  // Encontrar el modelo actualmente seleccionado
  const selectedModel = metricsData?.model_training?.models.find(model => model.name === activeModel);

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Métricas de Modelos de IA</h1>
            <p className="text-muted-foreground">
              Análisis detallado del rendimiento y entrenamiento de los modelos de predicción
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleTrainModels}>
            <span className="font-medium">Entrenar Modelos</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visión General de Modelos</CardTitle>
            <CardDescription>
              Última actualización: {new Date(metricsData?.model_training?.last_trained).toLocaleString()} 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparacion">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="comparacion">Comparativa</TabsTrigger>
                <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
                <TabsTrigger value="horizon">Horizontes</TabsTrigger>
                <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparacion">
                <div className="flex flex-col space-y-6">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metricsData?.model_training?.models}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Error (MAE)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Tiempo (s)', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(value, name) => [value, name === 'mae' ? 'Error MAE' : 'Tiempo de Entrenamiento (s)']} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar yAxisId="left" dataKey="metrics.mae" name="Error MAE" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="metrics.training_time" name="Tiempo de Entrenamiento (s)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {metricsData?.model_training?.models.map((model, index) => (
                      <Button 
                        key={model.name} 
                        variant={activeModel === model.name ? "default" : "outline"}
                        onClick={() => setActiveModel(model.name)}
                        className="flex-1"
                      >
                        {model.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rendimiento">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metricsData?.prediction_performance?.accuracy_over_time}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" domain={[85, 100]} orientation="left" stroke="#8884d8" label={{ value: 'Precisión (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'MAE', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Precisión (%)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="mae" name="MAE" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="horizon">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricsData?.model_comparisons?.time_horizons.flatMap(horizon => 
                        horizon.models.map(model => ({
                          name: model.name,
                          horizonte: horizon.horizon,
                          mae: model.mae,
                          rmse: model.rmse
                        }))
                      )}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="mae" name="MAE" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rmse" name="RMSE" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="scenarios">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      outerRadius={150} 
                      width={800} 
                      height={400} 
                      data={metricsData?.model_comparisons?.scenario_analysis?.flatMap(scenario => ({
                        scenario: scenario.scenario,
                        ...Object.fromEntries(scenario.models.map(model => [model.name, model.accuracy]))
                      }))}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="scenario" />
                      <PolarRadiusAxis domain={[80, 100]} />
                      {metricsData?.model_training?.models.map((model, index) => (
                        <Radar 
                          key={model.name}
                          name={model.name} 
                          dataKey={model.name} 
                          stroke={COLORS[index % COLORS.length]} 
                          fill={COLORS[index % COLORS.length]} 
                          fillOpacity={0.6} 
                        />
                      ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {selectedModel && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de {selectedModel.name}</CardTitle>
                <CardDescription>Modelo tipo: {selectedModel.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Error Absoluto Medio (MAE)</p>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - (selectedModel.metrics.mae / 20) * 100} className="h-2" />
                        <span className="text-lg font-bold">{selectedModel.metrics.mae.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">RMSE</p>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - (selectedModel.metrics.rmse / 30) * 100} className="h-2" />
                        <span className="text-lg font-bold">{selectedModel.metrics.rmse.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">MAPE (%)</p>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - (selectedModel.metrics.mape / 15) * 100} className="h-2" />
                        <span className="text-lg font-bold">{selectedModel.metrics.mape.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tiempo de Entrenamiento</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(selectedModel.metrics.training_time / 30) * 100} className="h-2" />
                        <span className="text-lg font-bold">{selectedModel.metrics.training_time.toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="text-md font-medium mb-3">Parámetros de Entrenamiento</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedModel.metrics.training_parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                          <span className="text-sm font-medium">{key}</span>
                          <Badge variant="outline">{value.toString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="text-md font-medium mb-3">Validación Cruzada</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fold</TableHead>
                          <TableHead>MAE</TableHead>
                          <TableHead>MSE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedModel.metrics.cross_validation_scores.map((fold) => (
                          <TableRow key={fold.fold}>
                            <TableCell>{fold.fold}</TableCell>
                            <TableCell>{fold.mae.toFixed(2)}</TableCell>
                            <TableCell>{fold.mse.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ajuste de Hiperparámetros</CardTitle>
                <CardDescription>Resultados de diferentes configuraciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedModel.hyperparameter_tuning}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={Object.keys(selectedModel.hyperparameter_tuning[0]).find(k => k !== 'mae')} />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="mae" name="MAE" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {selectedModel.feature_importance && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="text-md font-medium mb-3">Importancia de Características</h3>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={selectedModel.feature_importance}
                              layout="vertical"
                              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 'dataMax + 0.1']} />
                              <YAxis type="category" dataKey="feature" />
                              <Tooltip formatter={(value) => [(value * 100).toFixed(1) + '%', 'Importancia']} />
                              <Bar dataKey="importance" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {selectedModel.feature_importance.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Modelo de Ensamble</CardTitle>
            <CardDescription>
              Combinación ponderada de modelos individuales para mejorar la precisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricsData?.ensemble_model?.weights}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="weight"
                        nameKey="model"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {metricsData?.ensemble_model?.weights.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [(value * 100).toFixed(1) + '%', 'Peso']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-3">Rendimiento del Ensamble</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">MAE</p>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - (metricsData?.ensemble_model?.performance.mae / 20) * 100} className="h-2" />
                        <span className="text-lg font-bold">{metricsData?.ensemble_model?.performance.mae.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">RMSE</p>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - (metricsData?.ensemble_model?.performance.rmse / 30) * 100} className="h-2" />
                        <span className="text-lg font-bold">{metricsData?.ensemble_model?.performance.rmse.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">MAPE (%)</p>
                      <div className="flex items-center gap-2">
                        <Progress value={100 - (metricsData?.ensemble_model?.performance.mape / 15) * 100} className="h-2" />
                        <span className="text-lg font-bold">{metricsData?.ensemble_model?.performance.mape.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-md font-medium mb-3">Mejora sobre Mejor Modelo Individual</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                      <span className="text-sm font-medium">Mejora en MAE</span>
                      <Badge variant="default" className="bg-green-600">{metricsData?.ensemble_model?.improvement_over_best.mae_improvement}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                      <span className="text-sm font-medium">Mejora en RMSE</span>
                      <Badge variant="default" className="bg-green-600">{metricsData?.ensemble_model?.improvement_over_best.rmse_improvement}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                      <span className="text-sm font-medium">Mejora en MAPE</span>
                      <Badge variant="default" className="bg-green-600">{metricsData?.ensemble_model?.improvement_over_best.mape_improvement}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predicciones vs Valores Reales</CardTitle>
            <CardDescription>
              Comparación de predicciones con valores reales observados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metricsData?.prediction_performance?.real_vs_predicted}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="real" name="Real" stroke="#8884d8" />
                  <Line type="monotone" dataKey="predicted" name="Predicción" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="error" name="Error" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Errores</CardTitle>
              <CardDescription>
                Histograma de errores de predicción y estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsData?.prediction_performance?.error_distribution.histogram}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Frecuencia" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-md">
                  <span className="text-sm font-medium">Error Medio</span>
                  <span className="text-lg font-bold">{metricsData?.prediction_performance?.error_distribution.statistics.mean_error.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-md">
                  <span className="text-sm font-medium">Error Mediano</span>
                  <span className="text-lg font-bold">{metricsData?.prediction_performance?.error_distribution.statistics.median_error.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-md">
                  <span className="text-sm font-medium">Desviación Estándar</span>
                  <span className="text-lg font-bold">{metricsData?.prediction_performance?.error_distribution.statistics.std_error.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-md">
                  <span className="text-sm font-medium">Error Mínimo</span>
                  <span className="text-lg font-bold">{metricsData?.prediction_performance?.error_distribution.statistics.min_error.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-md">
                  <span className="text-sm font-medium">Error Máximo</span>
                  <span className="text-lg font-bold">{metricsData?.prediction_performance?.error_distribution.statistics.max_error.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingeniería de Características</CardTitle>
              <CardDescription>
                Impacto de características originales y diseñadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsData?.feature_engineering?.engineered_features}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 'dataMax + 0.1']} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => [(value * 100).toFixed(1) + '%', 'Importancia']} />
                    <Bar dataKey="importance" name="Importancia" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      {metricsData?.feature_engineering?.engineered_features.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-3">Características Originales</h3>
                  <div className="flex flex-wrap gap-2">
                    {metricsData?.feature_engineering?.original_features.map((feature) => (
                      <Badge key={feature} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Mejora con Ingeniería de Características</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                      <span className="text-sm font-medium">Mejora en MAE</span>
                      <Badge variant="default" className="bg-green-600">{metricsData?.feature_engineering?.improvement_with_engineering.mae_improvement}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                      <span className="text-sm font-medium">Ganancia en Importancia</span>
                      <Badge variant="default" className="bg-green-600">{metricsData?.feature_engineering?.improvement_with_engineering.feature_importance_gain}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detección de Anomalías</CardTitle>
            <CardDescription>
              Identificación de valores atípicos en los datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Valor Esperado</TableHead>
                  <TableHead>Valor Real</TableHead>
                  <TableHead>Z-Score</TableHead>
                  <TableHead>Causa Potencial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricsData?.anomaly_detection?.detected_anomalies.map((anomaly, index) => (
                  <TableRow key={index}>
                    <TableCell>{anomaly.date}</TableCell>
                    <TableCell>{anomaly.expected}</TableCell>
                    <TableCell className="font-medium">{anomaly.actual}</TableCell>
                    <TableCell>
                      <Badge variant={anomaly.z_score > 3 ? "destructive" : anomaly.z_score > 2.5 ? "default" : "secondary"}>
                        {anomaly.z_score.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{anomaly.cause}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-3">Análisis de Sensibilidad</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metricsData?.anomaly_detection?.sensitivity_analysis.threshold_values}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="z_score" />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => [(value * 100).toFixed(1) + '%']} />
                      <Legend />
                      <Line type="monotone" dataKey="detection_rate" name="Tasa de Detección" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="false_positives" name="Falsos Positivos" stroke="#ff7300" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-3">Umbral Recomendado</h3>
                <div className="flex flex-col items-center p-6 bg-secondary/50 rounded-md h-72 justify-center">
                  <span className="text-lg font-medium mb-2">Z-Score Óptimo</span>
                  <span className="text-6xl font-bold mb-4">{metricsData?.anomaly_detection?.sensitivity_analysis.recommended_threshold.toFixed(1)}</span>
                  <div className="grid grid-cols-2 gap-4 w-full mt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">Tasa de Detección</span>
                      <span className="text-lg font-semibold">
                        {(metricsData?.anomaly_detection?.sensitivity_analysis.threshold_values.find(
                          t => t.z_score === metricsData?.anomaly_detection?.sensitivity_analysis.recommended_threshold
                        )?.detection_rate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">Falsos Positivos</span>
                      <span className="text-lg font-semibold">
                        {(metricsData?.anomaly_detection?.sensitivity_analysis.threshold_values.find(
                          t => t.z_score === metricsData?.anomaly_detection?.sensitivity_analysis.recommended_threshold
                        )?.false_positives * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descomposición Estacional</CardTitle>
            <CardDescription>
              Análisis de componentes de la serie temporal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-md font-medium mb-3">Componentes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Componente</TableHead>
                      <TableHead>Fuerza</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metricsData?.seasonal_decomposition?.components.map((component, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{component.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={component.strength * 100} className="h-2 w-24" />
                            <span>{(component.strength * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={component.description}>
                          {component.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-3">Tendencia</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metricsData?.seasonal_decomposition?.visualization_data.trend}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" name="Valor de Tendencia" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-3">Estacionalidad Semanal</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricsData?.seasonal_decomposition?.visualization_data.weekly_seasonality}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="effect" name="Efecto" fill="#8884d8" radius={[4, 4, 0, 0]}>
                        {metricsData?.seasonal_decomposition?.visualization_data.weekly_seasonality.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.effect > 0 ? "#00C49F" : "#FF8042"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-3">Estacionalidad Mensual</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metricsData?.seasonal_decomposition?.visualization_data.monthly_seasonality}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="effect" name="Efecto" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}