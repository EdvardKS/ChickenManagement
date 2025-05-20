import { useState, lazy, Suspense, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/adminStockComponents/OrdersTable";
import type { Order, Stock } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

// Lazy load components to improve initial page load time
const StockDrawer = lazy(() => import("@/components/adminStockComponents/StockDrawer").then(mod => ({ default: mod.StockDrawer })));
const NewOrderDrawer = lazy(() => import("@/components/adminStockComponents/NewOrderDrawer").then(mod => ({ default: mod.NewOrderDrawer })));

// Cache for logo image
const logoCacheKey = 'logoCache';
if (!window.localStorage.getItem(logoCacheKey)) {
  const img = new Image();
  img.src = "/img/corporativa/logo-negro.png";
  img.onload = () => {
    window.localStorage.setItem(logoCacheKey, 'cached');
  };
}

export default function AdminOrders() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Optimized queries - only fetch when needed instead of constant polling
  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders', lastRefreshTime],
    refetchOnWindowFocus: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });
 
  const { data: stock } = useQuery<Stock>({ 
    queryKey: ['/api/stock', lastRefreshTime],
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Use callback to prevent recreation on each render
  const handleRefresh = useCallback(() => {
    setLastRefreshTime(Date.now());
  }, []);

  // Callbacks wrapped in useCallback to prevent recreating functions on each render
  const handleOpenNewOrder = useCallback(() => {
    setIsNewOrderOpen(true);
    // Ensure data is fresh when opening the drawer
    handleRefresh();
  }, [handleRefresh]);

  const handleOpenStockDrawer = useCallback(() => {
    setIsStockDrawerOpen(true);
    // Ensure data is fresh when opening the drawer
    handleRefresh();
  }, [handleRefresh]);

  const handleNewOrderClose = useCallback((open: boolean) => {
    setIsNewOrderOpen(open);
    if (!open) {
      // Refresh data when drawer closes to reflect any changes
      handleRefresh();
    }
  }, [handleRefresh]);

  const handleStockDrawerClose = useCallback((open: boolean) => {
    setIsStockDrawerOpen(open);
    if (!open) {
      // Refresh data when drawer closes to reflect any changes
      handleRefresh();
    }
  }, [handleRefresh]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button 
          onClick={handleOpenStockDrawer}
          variant="outline"
          className="btn-outline-brown flex items-center gap-2"
        >
          <img src="/img/corporativa/logo-negro.png" alt="Stock" className="h-6" />
          Stock
        </Button>

        <Button 
          onClick={handleOpenNewOrder} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Nuevo Encargo
        </Button>

        <Button
          onClick={handleRefresh}
          variant="ghost"
          className="ml-2"
        >
          🔄 Actualizar
        </Button>
      </div>

      {/* Only load these components when they're needed */}
      {isStockDrawerOpen && (
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <StockDrawer 
            isOpen={isStockDrawerOpen} 
            onOpenChange={handleStockDrawerClose} 
          />
        </Suspense>
      )}

      {isNewOrderOpen && (
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <NewOrderDrawer 
            isOpen={isNewOrderOpen} 
            onOpenChange={handleNewOrderClose} 
          />
        </Suspense>
      )}

      <OrdersTable orders={orders} onDataChanged={handleRefresh} />
    </div>
  );
}