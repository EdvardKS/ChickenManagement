import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/product-card";
import type { Category, Product } from "@shared/schema";

export default function Products() {
  const { data: categories } = useQuery<Category[]>({ 
    queryKey: ['/api/categories'] 
  });
  
  const { data: products } = useQuery<Product[]>({ 
    queryKey: ['/api/products'] 
  });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Nuestros Productos</h1>
      
      <Tabs defaultValue={categories?.[0]?.id.toString()}>
        <TabsList className="w-full justify-start">
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
