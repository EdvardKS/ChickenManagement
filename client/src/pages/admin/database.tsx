import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Terminal } from "@/components/ui/terminal";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DatabaseAdmin() {
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runMigrationsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/run-migrations"),
    onSuccess: () => {
      addLog("Migraciones completadas con éxito");
      toast({
        title: "Éxito",
        description: "Las migraciones de la base de datos se completaron correctamente",
      });
    },
    onError: (error) => {
      addLog(`Error al ejecutar las migraciones: ${error.message}`);
      toast({
        title: "Error",
        description: "Error al ejecutar las migraciones",
        variant: "destructive",
      });
    },
  });

  const runSeedersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/run-seeders"),
    onSuccess: () => {
      addLog("Seeders completados con éxito");
      toast({
        title: "Éxito",
        description: "Los seeders de la base de datos se completaron correctamente",
      });
    },
    onError: (error) => {
      addLog(`Error al ejecutar los seeders: ${error.message}`);
      toast({
        title: "Error",
        description: "Error al ejecutar los seeders",
        variant: "destructive",
      });
    },
  });

  const isLoading = runMigrationsMutation.isPending || runSeedersMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Base de Datos</h1>
        {isLoading && <Loader />}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            addLog("Iniciando migraciones...");
            runMigrationsMutation.mutate();
          }}
          disabled={isLoading}
        >
          Ejecutar Migraciones
        </Button>
        <Button
          onClick={() => {
            addLog("Iniciando seeders...");
            runSeedersMutation.mutate();
          }}
          disabled={isLoading}
        >
          Ejecutar Seeders
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Log de Ejecución</h2>
        <Terminal logs={logs} />
      </div>
    </div>
  );
}