import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      {product.imageUrl && (
      <img 
        src={`/img/products/${product.imageUrl}`} 
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
          {(product.price / 100).toFixed(2)}€
        </p>
      </CardContent>
      
      <CardFooter>
        <Link href="/order">
          <Button className="w-full">Encargar</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
