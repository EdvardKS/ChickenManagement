import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewOrderDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewOrderDrawer({ isOpen, onOpenChange }: NewOrderDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-[74%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Nuevo Encargo</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 flex-grow overflow-auto">
          <Label>Nombre del Cliente</Label>
          <Input type="text" placeholder="Ej. Juan Pérez" />

          <Label>Cantidad de Pollos</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la cantidad" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => {
                const value = (i + 1) / 2;
                return (
                  <SelectItem key={value} value={value.toString()}>
                    {value === 1 ? "1 pollo" : `${value} pollos`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Label>Fecha de Recogida</Label>
          <Input type="date" />

          <Label>Hora de Recogida</Label>
          <Input type="time" />

          <Label>Detalles del pedido</Label>
          <Textarea placeholder="¿Algo más?..." />

          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white w-full">
            Crear Encargo
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
