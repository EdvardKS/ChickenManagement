import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Terminal } from "@/components/ui/terminal";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Database, Download, Upload } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export default function DatabaseAdmin() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data: tables, isLoading: isLoadingTables } = useQuery<string[]>({
    queryKey: ['/api/admin/database/tables'],
  });

  const { data: tableData, isLoading: isLoadingTable } = useQuery({
    queryKey: ['/api/admin/database/table', selectedTable, page, limit],
    queryFn: () => selectedTable ? apiRequest("GET", `/api/admin/database/table/${selectedTable}?page=${page}&limit=${limit}`) : null,
    enabled: !!selectedTable,
  });

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const exportMutation = useMutation({
    mutationFn: () => {
      return fetch('/api/admin/database/export', {
        method: 'POST',
      }).then(response => {
        if (!response.ok) throw new Error('Error en la exportación');
        return response.blob();
      }).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database_export_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
    },
    onSuccess: () => {
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
          accept=".sql,.gz"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {isLoadingTables ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {tables?.map((table) => (
            <Button
              key={table}
              variant={selectedTable === table ? "secondary" : "outline"}
              className={`justify-start gap-2 ${
                selectedTable === table ? "bg-muted hover:bg-muted" : ""
              }`}
              onClick={() => {
                setSelectedTable(table);
                setPage(1);
              }}
            >
              <Database className="h-4 w-4" />
              {table}
            </Button>
          ))}
        </div>
      )}

      {selectedTable && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Datos de {selectedTable}</h2>
          {isLoadingTable ? (
            <Loader />
          ) : tableData ? (
            <DataTable
              data={tableData.data}
              pagination={tableData.pagination}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Log de Ejecución</h2>
        <Terminal logs={logs} />
      </div>
    </div>
  );
}