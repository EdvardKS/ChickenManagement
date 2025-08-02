import { useState, lazy, Suspense, useCallback, useEffect } from "react";
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

  // Event handler para detectar clicks en cualquier botón de la interfaz
  const handlePageInteraction = useCallback((event: MouseEvent) => {
    // Solo actualizamos datos si el usuario ha hecho clic en un botón
    if (event.target && 
        (event.target instanceof HTMLButtonElement || 
         (event.target instanceof HTMLElement && event.target.closest('button')))) {
      handleRefresh();
    }
  }, [handleRefresh]);

  // Añadimos el listener global para detectar interacciones
  useEffect(() => {
    document.addEventListener('click', handlePageInteraction);
    
    // Limpieza al desmontar componente
    return () => {
      document.removeEventListener('click', handlePageInteraction);
    };
  }, [handlePageInteraction]);

  // Callbacks wrapped in useCallback to prevent recreating functions on each render
  const handleOpenNewOrder = useCallback(() => {
    setIsNewOrderOpen(true);
  }, []);

  const handleOpenStockDrawer = useCallback(() => {
    setIsStockDrawerOpen(true);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/img/corporativa/logo-negro.png" 
                alt="Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleOpenStockDrawer}
                className="flex items-center space-x-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-2 font-medium rounded-lg"
              >
                <span className="text-lg">📦</span>
                <span>Stock</span>
              </Button>
              <Button 
                onClick={handleOpenNewOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Nuevo Encargo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Section - Full Width without margins */}
      <div className="bg-white w-full">
        <OrdersTable 
          orders={orders || []} 
          onDataChanged={handleRefresh}  
        />
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
    </div>
  );
}