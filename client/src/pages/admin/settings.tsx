import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { data: settings } = useQuery<Settings[]>({
    queryKey: ['/api/settings']
  });

  const handleUpdate = async (id: number, key: string, value: string) => {
    try {
      await fetch(`/api/settings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configuración actualizada",
        description: "El valor ha sido guardado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  };

  const handleCreate = async () => {
    if (!newKey || !newValue) {
      toast({
        title: "Error",
        description: "La clave y el valor son requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: newValue })
      });
      setNewKey("");
      setNewValue("");
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configuración creada",
        description: "Se ha añadido una nueva configuración"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la configuración",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/settings/${id}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configuración eliminada",
        description: "El valor ha sido eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configuración del Sistema</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Configuración</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder="Clave"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <Input
            placeholder="Valor"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <Button onClick={handleCreate}>Añadir</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {settings?.map((setting) => (
          <Card key={setting.id}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Input
                defaultValue={setting.key}
                onBlur={(e) => {
                  if (e.target.value !== setting.key) {
                    handleUpdate(setting.id, e.target.value, setting.value);
                  }
                }}
              />
              <Input
                defaultValue={setting.value}
                onBlur={(e) => {
                  if (e.target.value !== setting.value) {
                    handleUpdate(setting.id, setting.key, e.target.value);
                  }
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(setting.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
