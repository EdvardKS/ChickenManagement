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

  const { data: orders } = useQuery<Order[]>({ queryKey: ['/api/orders'] });
  const { data: stock } = useQuery<Stock>({ queryKey: ['/api/stock'] });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsStockDrawerOpen(true)}
          variant="outline"
          className="btn-outline-brown flex items-center gap-2"
        >
          <img src="/img/corporativa/logo-negro.png" alt="Stock" className="h-6" />
          Stock
        </Button>

        <Button 
          onClick={() => setIsNewOrderOpen(true)} 
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
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