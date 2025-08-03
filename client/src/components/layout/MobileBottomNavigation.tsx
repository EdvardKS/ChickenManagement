import { Package, Mic, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  onStockClick: () => void;
  onNewOrderClick: () => void;
  onVoiceResult: () => void;
  disabled?: boolean;
  className?: string;
}

export function MobileBottomNavigation({
  onStockClick,
  onNewOrderClick,
  onVoiceResult,
  disabled,
  className,
}: MobileBottomNavigationProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full bg-black",
        "border-t border-white/10 px-6  xl:hidden",
        className
      )}
    >
      <div className="relative flex items-center justify-center h-16">
        {/* Barra inferior - botones laterales */}
        <div className="absolute inset-0 flex items-end justify-between px-6 pb-2">
          <RoundedSideButton
            icon={<Package className="w-4 h-4 me-2" />}
            label="Stock"
            onClick={onStockClick}
            disabled={disabled}
          />
          <RoundedSideButton
            icon={<Plus className="w-4 h-4 me-2" />}
            label="Pedido"
            onClick={onNewOrderClick}
            disabled={disabled}
          />
        </div>

        {/* Botón central - más elevado */}
        <button
          onClick={onVoiceResult}
          disabled={disabled}
          className={cn(
            "z-10 rounded-full w-14 h-14 -translate-y-4 ",
            "bg-blue-600 hover:bg-blue-500 transition-colors duration-200",
            "shadow-md border-4 border-black flex items-center justify-center",
            disabled && "opacity-40"
          )}
        >
          <Mic className="w-5 h-5 text-white" />
        </button>
      </div>
    </nav>
  );
}

interface SideButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function RoundedSideButton({
  icon,
  label,
  onClick,
  disabled,
}: SideButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-row items-center justify-center px-4 py-2",
        "rounded-full bg-white/5 hover:bg-blue-500/30 transition-colors",
        "text-white text-xs font-light w-24 h-12",
        disabled && "opacity-40"
      )}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
}
