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
      "bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg",
      "px-6 py-3 pb-4",
      "md:hidden", // Solo visible en móvil y tablet
      className
    )}>
      <div className="flex items-center justify-between w-full max-w-sm mx-auto">
        {/* Botón Stock - Izquierda */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onStockClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-16 w-16 p-1 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 rounded-xl"
        >
          <Package className="h-7 w-7 mb-1 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">Stock</span>
        </Button>

        {/* Botón Voice Recognition - Centro (destacado) */}
        <div className="relative flex flex-col items-center">
          <VoiceOrderButton 
            onVoiceResult={onVoiceResult}
            onOrderCreated={onVoiceOrderCreated}
            disabled={disabled}
            className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-white" 
          />
          <span className="text-xs font-medium text-gray-700 mt-1">Voz</span>
        </div>

        {/* Botón Nuevo Pedido - Derecha */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onNewOrderClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-16 w-16 p-1 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 rounded-xl"
        >
          <Plus className="h-7 w-7 mb-1 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">Pedido</span>
        </Button>
      </div>
    </div>
  );
}