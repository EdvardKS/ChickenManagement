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
      // Fondo negro sólido como Movistar+ (sin degradado ni blur)
      "bg-black",
      "px-6 py-4 pb-6",
      // Visible en móvil, tablet y pantallas hasta 14 pulgadas
      "xl:hidden",
      className
    )}>
      <div className="flex items-center justify-around w-full max-w-lg mx-auto">
        {/* Botón Stock - Izquierda */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onStockClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-20 w-20 p-3 hover:bg-white/5 active:bg-white/10 transition-colors duration-150 disabled:opacity-50"
        >
          <Package className="h-6 w-6 mb-2 text-white stroke-[1.5]" />
          <span className="text-xs font-normal text-white tracking-wide">Stock</span>
        </Button>

        {/* Botón Voice Recognition - Centro (integrado, sin flotante) */}
        <div className="relative flex flex-col items-center justify-center h-20 w-20">
          <VoiceOrderButton 
            onVoiceResult={onVoiceResult}
            onOrderCreated={onVoiceOrderCreated}
            disabled={disabled}
          />
        </div>

        {/* Botón Nuevo Pedido - Derecha */}
        <Button
          variant="ghost"
          size="lg"
          onClick={onNewOrderClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center h-20 w-20 p-3 hover:bg-white/5 active:bg-white/10 transition-colors duration-150 disabled:opacity-50"
        >
          <Plus className="h-6 w-6 mb-2 text-white stroke-[1.5]" />
          <span className="text-xs font-normal text-white tracking-wide">Pedido</span>
        </Button>
      </div>
    </div>
  );
}