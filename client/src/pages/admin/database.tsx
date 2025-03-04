import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Terminal } from "@/components/ui/terminal";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Database, Table, Download, Upload } from "lucide-react";

export default function DatabaseAdmin() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: tables } = useQuery<string[]>({
    queryKey: ['/api/admin/database/tables'],
  });

  const { data: tableData } = useQuery({
    queryKey: ['/api/admin/database/table', selectedTable],
    enabled: !!selectedTable,
  });

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const exportMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/database/export"),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addLog("Base de datos exportada correctamente");
      toast({
        title: "Éxito",
        description: "Base de datos exportada correctamente",
      });
    },
    onError: (error) => {
      addLog(`Error al exportar la base de datos: ${error.message}`);
      toast({
        title: "Error",
        description: "Error al exportar la base de datos",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest("POST", "/api/admin/database/import", formData);
    },
    onSuccess: () => {
      addLog("Base de datos importada correctamente");
      toast({
        title: "Éxito",
        description: "Base de datos importada correctamente",
      });
    },
    onError: (error) => {
      addLog(`Error al importar la base de datos: ${error.message}`);
      toast({
        title: "Error",
        description: "Error al importar la base de datos",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const isLoading = exportMutation.isPending || importMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Base de Datos</h1>
        {isLoading && <Loader />}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => exportMutation.mutate()}
          disabled={isLoading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Base de Datos
        </Button>
        <Button
          onClick={() => document.getElementById('fileInput')?.click()}
          disabled={isLoading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar Base de Datos
        </Button>
        <input
          type="file"
          id="fileInput"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid grid-cols-4 gap-6">
        {tables?.map((table) => (
          <Button
            key={table}
            variant={selectedTable === table ? "secondary" : "outline"}
            className={`justify-start gap-2 ${
              selectedTable === table ? "bg-muted hover:bg-muted" : ""
            }`}
            onClick={() => setSelectedTable(table)}
          >
            <Database className="h-4 w-4" />
            {table}
          </Button>
        ))}
      </div>

      {selectedTable && tableData && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Datos de {selectedTable}</h2>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {Object.keys(tableData[0] || {}).map((column) => (
                    <th key={column} className="p-2 text-left font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="p-2">
                        {JSON.stringify(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Log de Ejecución</h2>
        <Terminal logs={logs} />
      </div>
    </div>
  );
}