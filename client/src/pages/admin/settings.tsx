import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  // Inicializar configuraciones por defecto al montar el componente
  useEffect(() => {
    fetch('/api/settings/initialize', { method: 'POST' })
      .then(response => response.json())
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      })
      .catch(error => {
        console.error('Error initializing settings:', error);
      });
  }, [queryClient]);

  const handleUpdate = async (key: string, value: string) => {
    try {
      await fetch(`/api/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
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

  const handleDelete = async (key: string) => {
    try {
      await fetch(`/api/settings/${key}`, { method: 'DELETE' });
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

      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clave</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings?.map((setting) => (
                <TableRow key={setting.key}>
                  <TableCell>{setting.key}</TableCell>
                  <TableCell>
                    <Input
                      defaultValue={setting.value}
                      onBlur={(e) => {
                        if (e.target.value !== setting.value) {
                          handleUpdate(setting.key, e.target.value);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(setting.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}