import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { updateBusinessHours } from "@/lib/hours-scraper";
import type { BusinessHours } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Reordenar los días empezando por Lunes
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_MAP = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
  'Domingo': 0
};

export default function BusinessHoursPage() {
  const [editMode, setEditMode] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState("");

  // Inicializar datos al cargar el componente
  useEffect(() => {
    fetch('/api/admin/initialize', { method: 'POST' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to initialize');
        queryClient.invalidateQueries({ queryKey: ['/api/business-hours'] });
      })
      .catch(error => {
        console.error('Error initializing:', error);
      });
  }, []);

  const { data: hours, isLoading } = useQuery<BusinessHours[]>({
    queryKey: ['/api/business-hours']
  });

  const updateHoursMutation = useMutation({
    mutationFn: async (hours: BusinessHours) => {
      const response = await fetch(`/api/business-hours/${hours.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours)
      });
      if (!response.ok) throw new Error('Failed to update hours');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-hours'] });
      toast({
        title: "Horario actualizado",
        description: "Los cambios se han guardado correctamente."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. " + error.message,
        variant: "destructive"
      });
    }
  });

  const syncWithGoogleMutation = useMutation({
    mutationFn: async () => {
      setSyncProgress(10);
      setSyncStatus("Iniciando sincronización con Google...");

      // Primera fase: Iniciar el scraping
      setSyncProgress(30);
      setSyncStatus("Buscando información de horarios en Google...");

      const response = await fetch('/api/business-hours/sync');
      if (!response.ok) throw new Error('Failed to sync with Google');

      setSyncProgress(60);
      setSyncStatus("Procesando horarios encontrados...");

      const data = await response.json();

      setSyncProgress(90);
      setSyncStatus("Actualizando horarios en el sistema...");

      return data;
    },
    onSuccess: () => {
      setSyncProgress(100);
      setSyncStatus("¡Sincronización completada!");
      queryClient.invalidateQueries({ queryKey: ['/api/business-hours'] });
      toast({
        title: "Sincronización completada",
        description: "Los horarios se han sincronizado correctamente con Google Business."
      });

      // Resetear el progreso después de un momento
      setTimeout(() => {
        setSyncProgress(0);
        setSyncStatus("");
      }, 2000);
    },
    onError: (error) => {
      setSyncProgress(0);
      setSyncStatus("");
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar con Google Business. " + error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div>Cargando horarios...</div>;
  }

  // Ordenar los horarios según el orden de los días definido
  const sortedHours = [...(hours || [])].sort((a, b) => {
    const dayA = DAY_MAP[DAYS[a.dayOfWeek]];
    const dayB = DAY_MAP[DAYS[b.dayOfWeek]];
    return dayA - dayB;
  });

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Horarios</h1>
          <div className="space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? "secondary" : "outline"}
                >
                  {editMode ? "✏️ Guardando cambios..." : "✏️ Editar Horarios"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{editMode ? 
                  "Haz clic para terminar de editar los horarios" : 
                  "Haz clic para modificar los horarios manualmente"}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => syncWithGoogleMutation.mutate()}
                  disabled={syncWithGoogleMutation.isPending}
                >
                  {syncWithGoogleMutation.isPending ? "🔄 Sincronizando..." : "🔄 Sincronizar con Google"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Obtiene automáticamente los horarios desde la página de Google Business</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Barra de progreso y estado */}
        {(syncWithGoogleMutation.isPending || syncProgress > 0) && (
          <div className="mb-6 space-y-2">
            <Progress value={syncProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">{syncStatus}</p>
          </div>
        )}

        <div className="grid gap-6">
          {sortedHours?.map((hour) => (
            <Card key={hour.id} className={`${hour.isOpen ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border-2`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  {DAYS[DAY_MAP[hour.dayOfWeek]]}
                  <span className={`text-sm font-normal ${hour.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {hour.isOpen ? '(Abierto)' : '(Cerrado)'}
                  </span>
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Switch
                      checked={hour.isOpen}
                      onCheckedChange={(checked) => {
                        if (editMode) {
                          updateHoursMutation.mutate({
                            ...hour,
                            isOpen: checked
                          });
                        }
                      }}
                      disabled={!editMode}
                      className={hour.isOpen ? 'bg-green-500' : 'bg-red-500'}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hour.isOpen ? "Abierto" : "Cerrado"}</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                {hour.isOpen ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hora de apertura</label>
                        <Input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) => {
                            if (editMode) {
                              updateHoursMutation.mutate({
                                ...hour,
                                openTime: e.target.value
                              });
                            }
                          }}
                          disabled={!editMode}
                          className={editMode ? 'border-green-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hora de cierre</label>
                        <Input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) => {
                            if (editMode) {
                              updateHoursMutation.mutate({
                                ...hour,
                                closeTime: e.target.value
                              });
                            }
                          }}
                          disabled={!editMode}
                          className={editMode ? 'border-green-500' : ''}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Switch
                            checked={hour.autoUpdate}
                            onCheckedChange={(checked) => {
                              if (editMode) {
                                updateHoursMutation.mutate({
                                  ...hour,
                                  autoUpdate: checked
                                });
                              }
                            }}
                            disabled={!editMode}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Permite que este horario se actualice automáticamente cuando se sincroniza con Google</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm text-gray-500">
                        Actualización automática desde Google
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500 italic">
                    Cerrado
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}