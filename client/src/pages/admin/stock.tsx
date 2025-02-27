import { useQuery } from "@tanstack/react-query";
import StockControl from "@/components/stock-control";
import type { Stock } from "@shared/schema";

export default function AdminStock() {
  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock'] 
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Control de Stock</h1>
      
      <StockControl currentStock={stock} />
    </div>
  );
}
