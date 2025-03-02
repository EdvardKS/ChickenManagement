import { useState, useEffect } from "react";
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
import { Pencil, Plus, Trash2, RefreshCcw, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import fs from 'fs-extra';
import path from 'path';

export default function AdminSeeds() {
  // Estados para la gestión de semillas
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState("");

  // Estados para la creación de tablas
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("text");
  const [newColumns, setNewColumns] = useState<Array<{name: string, type: string}>>([]);
  const [newTableName, setNewTableName] = useState("");

  // Estados para el CRUD
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", description: "", image: "" });
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    description: "", 
    price: 0,
    imageUrl: "",
    categoryId: 0
  });
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultas
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // Efecto para cargar archivos de semillas
  const [availableSeeds, setAvailableSeeds] = useState<Array<{value: string, label: string}>>([]);

  useEffect(() => {
    const loadSeedFiles = async () => {
      try {
        const response = await fetch('/api/admin/seeds/list');
        if (response.ok) {
          const files = await response.json();
          setAvailableSeeds(files.map((file: string) => ({
            value: file,
            label: `${file.charAt(0).toUpperCase() + file.slice(1)} (${file}.json)`
          })));
        }
      } catch (error) {
        console.error('Error loading seed files:', error);
      }
    };
    loadSeedFiles();
  }, []);

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

  // Funciones CRUD para Categorías
  const handleCategoryEdit = async (id: number, field: string, value: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) throw new Error('Error al actualizar la categoría');

      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la categoría",
        variant: "destructive"
      });
    }
  };

  const handleCategoryCreate = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (!response.ok) throw new Error('Error al crear la categoría');

      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setShowNewCategoryModal(false);
      setNewCategory({ name: "", description: "", image: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la categoría",
        variant: "destructive"
      });
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar la categoría');

      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la categoría",
        variant: "destructive"
      });
    }
  };

  const handleCategoryRestore = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}/restore`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Error al restaurar la categoría');

      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Éxito",
        description: "Categoría restaurada correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al restaurar la categoría",
        variant: "destructive"
      });
    }
  };

  // Funciones CRUD para Productos
  const handleProductEdit = async (id: number, field: string, value: any) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) throw new Error('Error al actualizar el producto');

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el producto",
        variant: "destructive"
      });
    }
  };

  const handleProductCreate = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (!response.ok) throw new Error('Error al crear el producto');

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowNewProductModal(false);
      setNewProduct({ name: "", description: "", price: 0, imageUrl: "", categoryId: 0 });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el producto",
        variant: "destructive"
      });
    }
  };

  const handleProductDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar el producto');

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el producto",
        variant: "destructive"
      });
    }
  };

  const handleProductRestore = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}/restore`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Error al restaurar el producto');

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Éxito",
        description: "Producto restaurado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al restaurar el producto",
        variant: "destructive"
      });
    }
  };


  // Resto del código para manejo de semillas...
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

      const response = await fetch(`/api/admin/seeds/${selectedFile}/execute`, {
        method: "POST"
      });

      if (!response.ok) throw new Error("Error al ejecutar la siembra");

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Se procesaron ${data.count} registros correctamente`,
      });

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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestión de Semillas</h1>

      {/* Card para inserción de datos */}
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
                  <Button onClick={() => {
                    setNewColumns([...newColumns, { name: newColumnName, type: newColumnType }]);
                    setNewColumnName("");
                  }}>
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
                  {availableSeeds.map((file) => (
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

      {/* Card para Categorías */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorías</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar categorías..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-64"
            />
            <Button
              variant="outline"
              onClick={() => setShowDeleted(!showDeleted)}
            >
              {showDeleted ? "Mostrar Activos" : "Mostrar Eliminados"}
            </Button>
            <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Categoría</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nombre"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                  <Input
                    placeholder="Descripción"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  />
                  <Input
                    placeholder="URL de imagen"
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                  />
                  <Button onClick={handleCategoryCreate} className="w-full">
                    Crear Categoría
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.filter(category => 
                category.name.toLowerCase().includes(searchCategory.toLowerCase()) &&
                category.deleted === showDeleted
              ).map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    {editingCategory === category.id ? (
                      <Input
                        defaultValue={category.name}
                        onBlur={(e) => handleCategoryEdit(category.id, 'name', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {category.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCategory(category.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCategory === category.id ? (
                      <Input
                        defaultValue={category.description}
                        onBlur={(e) => handleCategoryEdit(category.id, 'description', e.target.value)}
                      />
                    ) : (
                      category.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCategory === category.id ? (
                      <Input
                        defaultValue={category.image}
                        onBlur={(e) => handleCategoryEdit(category.id, 'image', e.target.value)}
                      />
                    ) : (
                      category.image
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {showDeleted ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCategoryRestore(category.id)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCategoryDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Card para Productos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar productos..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-64"
            />
            <Button
              variant="outline"
              onClick={() => setShowDeleted(!showDeleted)}
            >
              {showDeleted ? "Mostrar Activos" : "Mostrar Eliminados"}
            </Button>
            <Dialog open={showNewProductModal} onOpenChange={setShowNewProductModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nombre"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                  <Input
                    placeholder="Descripción"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                  <Input
                    placeholder="URL de imagen"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  />
                  <Select
                    value={newProduct.categoryId.toString()}
                    onValueChange={(value) => setNewProduct({...newProduct, categoryId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleProductCreate} className="w-full">
                    Crear Producto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.filter(product => 
                product.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
                product.deleted === showDeleted
              ).map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        defaultValue={product.name}
                        onBlur={(e) => handleProductEdit(product.id, 'name', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {product.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        defaultValue={product.description}
                        onBlur={(e) => handleProductEdit(product.id, 'description', e.target.value)}
                      />
                    ) : (
                      product.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        type="number"
                        defaultValue={product.price}
                        onBlur={(e) => handleProductEdit(product.id, 'price', parseFloat(e.target.value))}
                      />
                    ) : (
                      product.price
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Input
                        defaultValue={product.imageUrl}
                        onBlur={(e) => handleProductEdit(product.id, 'imageUrl', e.target.value)}
                      />
                    ) : (
                      product.imageUrl
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct === product.id ? (
                      <Select
                        defaultValue={product.categoryId.toString()}
                        onValueChange={(value) => handleProductEdit(product.id, 'categoryId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      categories?.find(c => c.id === product.categoryId)?.name
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {showDeleted ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleProductRestore(product.id)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleProductDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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