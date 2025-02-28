import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import debounce from "lodash/debounce";
import { useToast } from "@/hooks/use-toast";

type Setting = {
  key: string;
  value: string;
};

const defaultSettings = [
  { key: "dias_abierto", value: "['V','S','D']" },
  { key: "horario_abertura", value: "10:00" },
  { key: "horario_cerrar", value: "16:00" },
  { key: "smtp_host", value: "" },
  { key: "smtp_port", value: "587" },
  { key: "smtp_user", value: "" },
  { key: "smtp_pass", value: "" },
  { key: "smtp_from", value: "" },
  { key: "max_pedidos_dia", value: "50" },
  { key: "tiempo_preparacion", value: "30" },
  { key: "aviso_stock_bajo", value: "10" },
];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const updateSetting = debounce(async (key: string, value: string) => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        description: "Configuración actualizada correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al actualizar la configuración",
      });
    }
  }, 500);

  const deleteSetting = async (key: string) => {
    try {
      await fetch(`/api/settings/${key}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        description: "Configuración eliminada correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al eliminar la configuración",
      });
    }
  };

  const addNewSetting = async () => {
    if (!newKey || !newValue) return;
    try {
      await updateSetting(newKey, newValue);
      setNewKey("");
      setNewValue("");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al añadir la configuración",
      });
    }
  };

  // Initialize default settings if they don't exist
  useEffect(() => {
    const initializeDefaults = async () => {
      for (const setting of defaultSettings) {
        const exists = settings.some(s => s.key === setting.key);
        if (!exists) {
          await updateSetting(setting.key, setting.value);
        }
      }
    };
    initializeDefaults();
  }, [settings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración global del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Actuales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="flex items-center gap-4">
              <Input
                value={setting.key}
                readOnly
                className="w-1/3"
              />
              <Input
                defaultValue={setting.value}
                className="flex-1"
                onBlur={(e) => {
                  if (e.target.value !== setting.value) {
                    updateSetting(setting.key, e.target.value);
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSetting(setting.key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-4 pt-4 border-t">
            <Input
              placeholder="Nueva clave"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-1/3"
            />
            <Input
              placeholder="Valor"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addNewSetting}>
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}