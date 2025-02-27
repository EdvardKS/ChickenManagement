import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category, InsertProduct } from "@shared/schema";

export default function AdminProducts() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: products } = useQuery<Product[]>({ 
    queryKey: ['/api/products'] 
  });
  
  const { data: categories } = useQuery<Category[]>({ 
    queryKey: ['/api/categories'] 
  });

  const createProduct = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", product);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsOpen(false);
      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente"
      });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente"
      });
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Nuevo Producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await createProduct.mutateAsync({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                price: parseInt(formData.get("price") as string),
                categoryId: parseInt(formData.get("categoryId") as string),
                imageUrl: formData.get("imageUrl") as string
              });
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="price">Precio (en céntimos)</Label>
                <Input id="price" name="price" type="number" required />
              </div>
              <div>
                <Label htmlFor="categoryId">Categoría</Label>
                <select name="categoryId" className="w-full border rounded p-2">
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="imageUrl">URL de la imagen</Label>
                <Input id="imageUrl" name="imageUrl" />
              </div>
              <Button type="submit">Crear</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {categories?.find(c => c.id === product.categoryId)?.name}
              </TableCell>
              <TableCell>{(product.price / 100).toFixed(2)}€</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteProduct.mutate(product.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
