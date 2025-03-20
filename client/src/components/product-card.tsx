import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { useFileExists } from "@/hooks/use-file-exists";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Verificar si la imagen existe
  const imagePath = product.imageUrl ? `/img/products/${product.imageUrl}` : null;
  const { exists } = useFileExists(imagePath);
  
  // Solo mostrar la imagen si existe
  const showImage = imagePath && exists;
  
  return (
    <Card>
      {showImage && (
        <img 
          src={imagePath} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      )}
      
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-xl font-bold mt-2">
          {(() => {
            try {
              return Number(product.price).toFixed(2);
            } catch (e) {
              return product.price;
            }
          })()}€
        </p>
      </CardContent>
      
      <CardFooter>
        <Link href="/encargar">
          <Button className="w-full bg-[#8B4513] hover:bg-[#6d3610] text-white border-none">Encargar</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
