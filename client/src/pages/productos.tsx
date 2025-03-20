import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/product-card";
import type { Category, Product } from "@shared/schema";
import { useEffect, useState } from "react";

export default function Productos() {
  const [defaultCategory, setDefaultCategory] = useState<string | null>(null);
  
  const { data: categories } = useQuery<Category[]>({ 
    queryKey: ['/api/categories'] 
  });
  
  const { data: products } = useQuery<Product[]>({ 
    queryKey: ['/api/products'] 
  });

  // Encontrar la categoría "Menús" (o similar) por defecto
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Buscar categoría con nombre "Menús" o similar
      const menuCategory = categories.find(cat => 
        cat.name.toLowerCase().includes("menú") || 
        cat.name.toLowerCase().includes("menu")
      );
      
      if (menuCategory) {
        setDefaultCategory(menuCategory.id.toString());
      } else {
        // Si no hay categoría de menús, usar la primera
        setDefaultCategory(categories[0].id.toString());
      }
    }
  }, [categories]);

  if (!defaultCategory) {
    return <div className="p-8 text-center">Cargando productos...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Nuestros Productos</h1>
      
      <Tabs defaultValue={defaultCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories?.map(category => (
            <TabsTrigger key={category.id} value={category.id.toString()}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories?.map(category => (
          <TabsContent key={category.id} value={category.id.toString()}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                ?.filter(product => product.categoryId === category.id)
                .map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}