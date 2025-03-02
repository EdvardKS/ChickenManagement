import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminSeeds() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("text");
  const [newColumns, setNewColumns] = useState<Array<{name: string, type: string}>>([]);
  const [newTableName, setNewTableName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const seedFiles = [
    { value: "category", label: "Categorías (category.json)" },
    { value: "products", label: "Productos (products.json)" }
  ];

  const tableTypes = [
    { value: "category", label: "Categorías" },
    { value: "products", label: "Productos" },
    { value: "new", label: "Crear Nueva Tabla" }
  ];

  const dataTypes = [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "boolean", label: "Booleano" },
    { value: "date", label: "Fecha" }
  ];

  const handleExecuteSeed = async () => {
    if (!selectedFile || !selectedTable) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo y una tabla",
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
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
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

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar el producto');

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente"
      });

      // Refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el producto",
        variant: "destructive"
      });
    }
  };

  const handleAddColumn = () => {
    if (!newColumnName || !newColumnType) {
      toast({
        title: "Error",
        description: "Por favor ingresa nombre y tipo para la columna",
        variant: "destructive"
      });
      return;
    }

    setNewColumns([...newColumns, { name: newColumnName, type: newColumnType }]);
    setNewColumnName("");
    setNewColumnType("text");
  };

  const handleCreateTable = async () => {
    if (!newTableName || newColumns.length === 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa nombre de tabla y al menos una columna",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTableName,
          columns: newColumns
        }),
      });

      if (!response.ok) throw new Error('Error al crear la tabla');

      toast({
        title: "Éxito",
        description: "Tabla creada correctamente"
      });

      // Limpiar el formulario
      setNewTableName("");
      setNewColumns([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la tabla",
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
              value={selectedTable}
              onValueChange={setSelectedTable}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una tabla" />
              </SelectTrigger>
              <SelectContent>
                {tableTypes.map((table) => (
                  <SelectItem key={table.value} value={table.value}>
                    {table.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTable === "new" ? (
              <div className="space-y-4 border p-4 rounded-lg">
                <Input
                  placeholder="Nombre de la nueva tabla"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de columna"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                  />
                  <Select
                    value={newColumnType}
                    onValueChange={setNewColumnType}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Tipo de dato" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddColumn}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newColumns.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Columnas:</h4>
                    <ul className="list-disc pl-5">
                      {newColumns.map((col, index) => (
                        <li key={index}>
                          {col.name} ({col.type})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button onClick={handleCreateTable} className="w-full">
                  Crear Tabla
                </Button>
              </div>
            ) : (
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
            )}

            {selectedTable !== "new" && (
              <Button
                onClick={handleExecuteSeed}
                disabled={!selectedFile || !selectedTable || isLoading}
                className="w-full"
              >
                {isLoading ? "Procesando..." : "Ejecutar Operación"}
              </Button>
            )}
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

      <Card>
        <CardHeader>
          <CardTitle>Productos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.categoryId}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.id)}
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