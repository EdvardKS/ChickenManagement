import { useState, lazy, Suspense, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/adminStockComponents/OrdersTable";
import type { Order, Stock } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, debounce } from "@/lib/queryClient";

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

// Definir tipo para datos combinados
interface DashboardData {
  orders: Order[];
  stock: Stock | null;
  lastUpdated: string;
}

export default function AdminOrders() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Query optimizada que obtiene orders y stock en una sola petición
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({ 
    queryKey: ['/api/dashboard-data', lastRefreshTime],
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos en memoria
    retry: 1,
  });

  // Extraer orders y stock de los datos combinados
  const orders = useMemo(() => dashboardData?.orders || [], [dashboardData]);
  const stock = useMemo(() => dashboardData?.stock || null, [dashboardData]);

  // Debounced refresh para evitar múltiples llamadas rápidas
  const debouncedRefresh = useMemo(
    () => debounce(() => {
      setLastRefreshTime(Date.now());
    }, 300), // 300ms de delay
    []
  );

  // Use callback to prevent recreation on each render
  const handleRefresh = useCallback(() => {
    debouncedRefresh();
  }, [debouncedRefresh]);

  // Event handler optimizado para detectar interacciones importantes
  const handlePageInteraction = useCallback((event: MouseEvent) => {
    // Solo actualizamos si es una acción que puede cambiar datos
    const target = event.target as HTMLElement;
    if (target && target.closest('[data-refresh-trigger]')) {
      handleRefresh();
    }
  }, [handleRefresh]);

  // Añadimos el listener global para detectar interacciones
  useEffect(() => {
    document.addEventListener('click', handlePageInteraction);
    
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
      // Invalidar cache del dashboard al cerrar modal (posibles cambios)
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-data'] });
    }
  }, []);

  const handleStockDrawerClose = useCallback((open: boolean) => {
    setIsStockDrawerOpen(open);
    if (!open) {
      // Invalidar cache del dashboard al cerrar modal (posibles cambios)
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-data'] });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100 py-1">
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
                data-refresh-trigger
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