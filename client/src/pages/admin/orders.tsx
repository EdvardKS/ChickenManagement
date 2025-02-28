import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, Stock } from "@shared/schema";

function getDefaultPickupTime() {
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour >= 15) {
    return setMinutes(setHours(addDays(now, 1), 13), 0);
  } else if (currentHour === 13) {
    return setMinutes(setHours(now, 14), 30);
  } else if (currentHour === 14) {
    return setMinutes(setHours(now, 15), 0);
  } else {
    return setMinutes(setHours(now, 13), 30);
  }
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);

  const { data: orders } = useQuery<Order[]>({ queryKey: ['/api/orders'] });
  const { data: stock } = useQuery<Stock>({ queryKey: ['/api/stock'] });

  const handleStartDay = () => {
    if (window.confirm("¿Estás seguro de que deseas iniciar un nuevo día? Esta acción no se puede deshacer.")) {
      toast({
        title: "Día iniciado",
        description: "El nuevo día ha sido registrado correctamente."
      });
      // Aquí puedes agregar la lógica para registrar el inicio del día en el backend
    }
  };

  return (
    <div className="space-y-8">
      {/* Botones alineados: Stock a la izquierda, Nuevo Encargo a la derecha */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsStockDrawerOpen(true)}
          variant="outline"
          className="btn-outline-brown flex items-center gap-2"
        >
          <img src="/img/corporativa/logo-negro.png" alt="Stock" className="h-6" />
          Stock
        </Button>

        <Button 
          onClick={() => setIsNewOrderOpen(true)} 
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
        >
          Nuevo Encargo
        </Button>
      </div>

      {/* Drawer para gestión de Stock */}
      <Drawer open={isStockDrawerOpen} onOpenChange={setIsStockDrawerOpen} side="right">
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

      {/* Drawer para Nuevo Encargo */}
      <Drawer open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen} side="right">
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

      
      {/* Tabla de pedidos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Pedidos Pendientes</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.customerPhone}</TableCell>
                    <TableCell>{order.items?.join(", ") || "Sin items"}</TableCell>
                    <TableCell>{(order.totalAmount / 100).toFixed(2)}€</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="space-x-2">
                      <Button>Completar</Button>
                      <Button variant="destructive">Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
    </div>
    
  );
}
