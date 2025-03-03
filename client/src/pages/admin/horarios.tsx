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

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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
          {hours?.map((hour) => (
            <Card key={hour.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{DAYS[hour.dayOfWeek]}</CardTitle>
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
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hour.isOpen ? "Abierto" : "Cerrado"}</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
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
                      disabled={!editMode || !hour.isOpen}
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
                      disabled={!editMode || !hour.isOpen}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}