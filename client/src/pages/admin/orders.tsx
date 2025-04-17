import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StockDrawer } from "@/components/adminStockComponents/StockDrawer";
import { NewOrderDrawer } from "@/components/adminStockComponents/NewOrderDrawer";
import { OrdersTable } from "@/components/adminStockComponents/OrdersTable";
import type { Order, Stock } from "@shared/schema";

export default function AdminOrders() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);

  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders'],
    refetchInterval: 5000 // Poll every 5 seconds
  });

  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock'],
    refetchInterval: 5000 // Poll every 5 seconds
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsStockDrawerOpen(true)}
          variant="outline"
          className="border-teal-600 text-teal-700 hover:bg-teal-50 flex items-center gap-2 font-semibold"
        >
          <img src="/img/corporativa/logo-negro.png" alt="Stock" className="h-6" />
          Stock
        </Button>

        <Button 
          onClick={() => setIsNewOrderOpen(true)} 
          className="bg-[#9333EA] hover:bg-[#7E22CE] text-white px-4 py-2 rounded-lg font-semibold"
        >
          Nuevo Encargo
        </Button>
      </div>

      <StockDrawer 
        isOpen={isStockDrawerOpen} 
        onOpenChange={setIsStockDrawerOpen} 
      />

      <NewOrderDrawer 
        isOpen={isNewOrderOpen} 
        onOpenChange={setIsNewOrderOpen} 
      />

      <OrdersTable orders={orders} />
    </div>
  );
}