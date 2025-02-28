import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";

interface StockDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockDrawer({ isOpen, onOpenChange }: StockDrawerProps) {
  const { toast } = useToast();

  const handleStartDay = () => {
    if (window.confirm("¿Estás seguro de que deseas iniciar un nuevo día? Esta acción no se puede deshacer.")) {
      toast({
        title: "Día iniciado",
        description: "El nuevo día ha sido registrado correctamente."
      });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-[74%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Stock Actual 🐔</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 flex-grow overflow-auto">
          <div className="border p-3 rounded-lg">
            <Label>Total de pollos Montado:</Label>
            <div className="flex justify-between items-center">
              <Button variant="outline">-1</Button>
              <span className="text-xl font-bold">0</span>
              <Button variant="outline">+1</Button>
            </div>
            <div className="flex justify-between mt-2">
              <Button variant="outline">-6</Button>
              <Button variant="outline">+6</Button>
            </div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Total de pollos Actual:</Label>
            <div className="text-xl font-bold">-0.5</div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Con Encargos:</Label>
            <div className="text-xl font-bold">0</div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Sin Encargo:</Label>
            <div className="text-xl font-bold">-0.5</div>
          </div>

          <div className="border p-3 rounded-lg">
            <Label>Venta de SIN encargo:</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-black text-white">-0.5</Button>
              <Button className="bg-black text-white">+0.5</Button>
              <Button className="bg-blue-500 text-white">-1</Button>
              <Button variant="outline">+1</Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button 
            variant="destructive" 
            className="w-full text-sm py-2" 
            onClick={handleStartDay}
          >
            Iniciar Día
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
