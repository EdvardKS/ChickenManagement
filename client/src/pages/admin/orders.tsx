import { useState, lazy, Suspense, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/adminStockComponents/OrdersTable";
import type { Order, Stock } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, debounce } from "@/lib/queryClient";
import { VoiceOrderButton } from "@/components/voice/VoiceOrderButton";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Query optimizada con polling para sincronización automática
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({ 
    queryKey: ['/api/dashboard-data'],
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Polling cada 30 segundos para sincronización entre dispositivos
    staleTime: 10000, // 10 segundos considera datos frescos
    gcTime: 5 * 60 * 1000, // 5 minutos en memoria
    retry: 1,
    refetchIntervalInBackground: true, // Continúa polling en background
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

  // Event handler optimizado - removido para evitar refetch innecesarios
  // Las actualizaciones optimistas manejan los cambios de estado individual

  // Listener removido - usando actualizaciones optimistas en lugar de refetch global

  // Callbacks wrapped in useCallback to prevent recreating functions on each render
  const handleOpenNewOrder = useCallback(() => {
    setIsNewOrderOpen(true);
  }, []);

  const handleOpenStockDrawer = useCallback(() => {
    setIsStockDrawerOpen(true);
  }, []);

  // Handler para resultados de reconocimiento de voz
  const handleVoiceResult = useCallback((result: string) => {
    console.log('Voice result:', result);
    
    // El sistema ya procesa automáticamente los comandos de voz y crea pedidos
    // Solo mostramos una confirmación sin abrir el drawer
    toast({
      title: "Comando de voz procesado",
      description: `"${result}"`,
    });

    // No abrimos el drawer - el reconocimiento de voz ya maneja la creación automática
    // setIsNewOrderOpen(true); // Comentado para evitar apertura automática
  }, [toast]);

  // Handler para cuando se crea un pedido por voz - actualización optimista
  const handleVoiceOrderCreated = useCallback((newOrder: Order) => {
    console.log('New order created via voice:', newOrder);
    
    // Actualización optimista: agregar el nuevo pedido inmediatamente a la cache
    queryClient.setQueryData(['/api/dashboard-data'], (oldData: DashboardData | undefined) => {
      if (!oldData) return oldData;
      
      // Agregar el nuevo pedido al inicio de la lista
      const updatedOrders = [newOrder, ...oldData.orders];
      
      return {
        ...oldData,
        orders: updatedOrders,
        lastUpdated: new Date().toISOString()
      };
    });
    
    toast({
      title: "¡Pedido creado exitosamente!",
      description: `Pedido para ${newOrder.customerName} agregado a la tabla`,
    });
  }, [toast]);

  const handleNewOrderClose = useCallback((open: boolean) => {
    setIsNewOrderOpen(open);
    if (!open) {
      // Refetch inmediato para ver nuevos pedidos creados
      queryClient.invalidateQueries({ 
        queryKey: ['/api/dashboard-data'],
        refetchType: 'active' // Refetch inmediato
      });
    }
  }, []);

  const handleStockDrawerClose = useCallback((open: boolean) => {
    setIsStockDrawerOpen(open);
    if (!open) {
      // Refetch inmediato para ver cambios de stock
      queryClient.invalidateQueries({ 
        queryKey: ['/api/dashboard-data'],
        refetchType: 'active' // Refetch inmediato
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-24 xl:pb-0">
      
      {/* Header Section - Hidden on mobile and tablets to save space */}
      <div className="bg-white shadow-sm border-b border-gray-100 py-1 hidden xl:block">
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

      {/* Mobile Header - Compact version for mobile */}
      <div className="bg-white shadow-sm border-b border-gray-100 py-2 md:hidden">
        <div className="px-4">
          <div className="flex items-center justify-center">
            <img 
              src="/img/corporativa/logo-negro.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain mr-2"
            />
            <h1 className="text-lg font-bold text-gray-800">Pedidos</h1>
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

      {/* Desktop Voice Order Button - Fixed position at bottom center */}
      <div className="hidden md:block">
        <VoiceOrderButton 
          onVoiceResult={handleVoiceResult}
          onOrderCreated={handleVoiceOrderCreated}
          disabled={isNewOrderOpen || isStockDrawerOpen}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        onStockClick={handleOpenStockDrawer}
        onNewOrderClick={handleOpenNewOrder}
        onVoiceResult={handleVoiceResult}
        onVoiceOrderCreated={handleVoiceOrderCreated}
        disabled={isNewOrderOpen || isStockDrawerOpen}
      />
    </div>
  );
}