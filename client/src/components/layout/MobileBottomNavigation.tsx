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
      // Fondo negro elegante y fino
      "bg-black/95 border-t border-white/10",
      "px-4 py-2",
      // Visible en móvil, tablet y pantallas hasta 14 pulgadas
      "xl:hidden",
      className
    )}>
      <div className="flex items-center justify-around w-full max-w-xs mx-auto">
        {/* Botón Stock - Izquierda */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onStockClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-12 w-16 p-1 hover:bg-white/5 transition-colors duration-200 disabled:opacity-50"
        >
          <Package className="h-5 w-5 mb-1 text-white/80 stroke-[1]" />
          <span className="text-[10px] font-light text-white/70">Stock</span>
        </Button>

        {/* Botón Voice Recognition - Centro */}
        <div className="relative flex flex-col items-center justify-center h-12 w-16">
          <VoiceOrderButton 
            onVoiceResult={onVoiceResult}
            onOrderCreated={onVoiceOrderCreated}
            disabled={disabled}
            className="flex flex-col items-center justify-center h-12 w-16 p-1 hover:bg-white/5 transition-colors duration-200 disabled:opacity-50"
          />
        </div>

        {/* Botón Nuevo Pedido - Derecha */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewOrderClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-12 w-16 p-1 hover:bg-white/5 transition-colors duration-200 disabled:opacity-50"
        >
          <Plus className="h-5 w-5 mb-1 text-white/80 stroke-[1]" />
          <span className="text-[10px] font-light text-white/70">Pedido</span>
        </Button>
      </div>
    </div>
  );
}