import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { updateBusinessHours } from "@/lib/hours-scraper";
import type { BusinessHours } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function BusinessHoursPage() {
  const [editMode, setEditMode] = useState(false);

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
    mutationFn: updateBusinessHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-hours'] });
      toast({
        title: "Sincronización completada",
        description: "Los horarios se han sincronizado con Google Business."
      });
    },
    onError: (error) => {
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Horarios</h1>
        <div className="space-x-4">
          <Button 
            onClick={() => setEditMode(!editMode)}
            variant={editMode ? "secondary" : "outline"}
          >
            {editMode ? "Cancelar Edición" : "Editar Horarios"}
          </Button>
          <Button 
            onClick={() => syncWithGoogleMutation.mutate()}
            disabled={syncWithGoogleMutation.isPending}
          >
            {syncWithGoogleMutation.isPending ? "Sincronizando..." : "Sincronizar con Google"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {hours?.map((hour) => (
          <Card key={hour.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{DAYS[hour.dayOfWeek]}</CardTitle>
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
                <span className="text-sm text-gray-500">
                  Actualización automática desde Google
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
