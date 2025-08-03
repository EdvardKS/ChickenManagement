import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Mic, Plus } from "lucide-react";
import { VoiceOrderButton } from "@/components/voice/VoiceOrderButton";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  onStockClick: () => void;
  onNewOrderClick: () => void;
  onVoiceResult: (result: string) => void;
  onVoiceOrderCreated: () => void;
  disabled?: boolean;
  className?: string;
}

export function MobileBottomNavigation({ 
  onStockClick, 
  onNewOrderClick, 
  onVoiceResult,
  onVoiceOrderCreated,
  disabled,
  className 
}: MobileBottomNavigationProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      // Fondo negro semitransparente como Movistar+
      "bg-black/80 backdrop-blur-md",
      "px-8 py-4 pb-6",
      // Visible en móvil, tablet y pantallas hasta 14 pulgadas (aproximadamente 1366px)
      "xl:hidden", // Ocultar solo en pantallas extra grandes (>1280px)
      className
    )}>
      <div className="flex items-center justify-around w-full max-w-md mx-auto">
        {/* Botón Stock - Izquierda */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onStockClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-16 w-16 p-2 hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
        >
          <Package className="h-6 w-6 mb-1 text-white" />
          <span className="text-xs font-medium text-white">Stock</span>
        </Button>

        {/* Botón Voice Recognition - Centro (destacado como Movistar+) */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <VoiceOrderButton 
              onVoiceResult={onVoiceResult}
              onOrderCreated={onVoiceOrderCreated}
              disabled={disabled}
              className="h-16 w-16 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg transition-all duration-200 border-2 border-white/20" 
            />
          </div>
          <span className="text-xs font-medium text-white mt-1">Voz</span>
        </div>

        {/* Botón Nuevo Pedido - Derecha */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onNewOrderClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-16 w-16 p-2 hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="h-6 w-6 mb-1 text-white" />
          <span className="text-xs font-medium text-white">Pedido</span>
        </Button>
      </div>
    </div>
  );
}