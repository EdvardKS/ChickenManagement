import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AdminSeeds() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener categorías
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const seedFiles = [
    { value: "category", label: "Categorías (category.json)" },
    { value: "products", label: "Productos (products.json)" }
  ];

  const handleExecuteSeed = async () => {
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
      // Primero hacemos la comprobación
      const previewResponse = await fetch(`/api/admin/seeds/${selectedFile}/preview`);
      if (!previewResponse.ok) throw new Error("Error al obtener vista previa");

      const previewData = await previewResponse.json();
      const shouldProceed = window.confirm(
        `Se insertarán ${previewData.count} registros. ¿Deseas continuar?`
      );

      if (!shouldProceed) {
        setIsLoading(false);
        return;
      }

      // Si el usuario confirma, procedemos con la inserción
      const response = await fetch(`/api/admin/seeds/${selectedFile}/execute`, {
        method: "POST"
      });

      if (!response.ok) throw new Error("Error al ejecutar la siembra");

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Se procesaron ${data.count} registros correctamente`,
      });

      // Refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la operación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar la categoría');

      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente"
      });

      // Refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la categoría",
        variant: "destructive"
      });
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

            <Button
              onClick={handleExecuteSeed}
              disabled={!selectedFile || isLoading}
              className="w-full"
            >
              {isLoading ? "Procesando..." : "Ejecutar Operación"}
            </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Categorías Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
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