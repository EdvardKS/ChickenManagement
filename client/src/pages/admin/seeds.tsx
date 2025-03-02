import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function AdminSeeds() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState("");
  const { toast } = useToast();

  const seedFiles = [
    { value: "category", label: "Categorías (category.json)" },
    { value: "products", label: "Productos (products.json)" }
  ];

  const handleSeedSelection = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo para sembrar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/admin/seeds/${selectedFile}/preview`);
      if (!response.ok) throw new Error("Error al obtener vista previa");
      
      const data = await response.json();
      toast({
        title: "Vista Previa",
        description: `Se insertarán ${data.count} registros`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al obtener vista previa",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSeed = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/admin/seeds/${selectedFile}/execute`, {
        method: "POST"
      });

      if (!response.ok) throw new Error("Error al ejecutar la siembra");

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Se insertaron ${data.count} registros correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al ejecutar la siembra",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestión de Semillas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Insertar Datos desde Archivos JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Select
              value={selectedFile}
              onValueChange={setSelectedFile}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un archivo para sembrar" />
              </SelectTrigger>
              <SelectContent>
                {seedFiles.map((file) => (
                  <SelectItem key={file.value} value={file.value}>
                    {file.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-4">
              <Button
                onClick={handleSeedSelection}
                disabled={!selectedFile || isLoading}
              >
                Comprobar Archivo
              </Button>
              <Button
                onClick={handleExecuteSeed}
                disabled={!selectedFile || isLoading}
                variant="default"
              >
                Ejecutar Inserción
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Procesando: {currentItem}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
