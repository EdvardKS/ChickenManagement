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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StockDrawer } from "@/components/ui/stock-drawer";
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
import { Separator } from "@/components/ui/separator";

function getDefaultPickupTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  if (currentHour >= 15) {
    // Si es después de las 15:00, programar para mañana a las 13:00
    return setMinutes(setHours(addDays(now, 1), 13), 0);
  } else if (currentHour === 13) {
    // Si son las 13:00, programar para las 14:30
    return setMinutes(setHours(now, 14), 30);
  } else if (currentHour === 14) {
    // Si son las 14:00, programar para las 15:00
    return setMinutes(setHours(now, 15), 0);
  } else {
    // Por defecto, programar para las 13:30
    return setMinutes(setHours(now, 13), 30);
  }
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);

  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders'] 
  });

  const { data: stock } = useQuery<Stock>({
    queryKey: ['/api/stock']
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido actualizado",
        description: "El estado del pedido se ha actualizado correctamente"
      });
    }
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente"
      });
    }
  });

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      setIsNewOrderOpen(false);
      toast({
        title: "Pedido creado",
        description: "El nuevo pedido se ha creado correctamente"
      });
    }
  });

  const chickenOptions = Array.from({ length: 20 }, (_, i) => {
    const value = (i + 1) / 2;
    return {
      value: value.toString(),
      label: value === 1 ? "1 pollo" : `${value} pollos`
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsStockDrawerOpen(true)}>
            <img
              src="/img/corporativa/logo-negro.png"
              alt="Gestionar Stock"
              className="h-6"
            />
          </Button>
          <Button onClick={() => setIsNewOrderOpen(true)}>
            Nuevo Encargo
          </Button>
        </div>
      </div>

      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Encargo</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createOrder.mutate({
              customerName: formData.get("customerName"),
              customerPhone: formData.get("customerPhone"),
              items: [`${formData.get("chickenQuantity")} pollos`],
              totalAmount: parseInt(formData.get("chickenQuantity") as string) * 1500,
              pickupTime: new Date(formData.get("pickupDate") as string).toISOString(),
              details: formData.get("details")
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre</Label>
              <Input
                id="customerName"
                name="customerName"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chickenQuantity">Cantidad de Pollos</Label>
              <Select name="chickenQuantity" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la cantidad" />
                </SelectTrigger>
                <SelectContent>
                  {chickenOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupDate">Fecha y Hora de Recogida</Label>
              <Input
                id="pickupDate"
                name="pickupDate"
                type="datetime-local"
                required
                defaultValue={format(getDefaultPickupTime(), "yyyy-MM-dd'T'HH:mm")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Detalles del pedido</Label>
              <Textarea
                id="details"
                name="details"
                placeholder="¿Algo más?..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={createOrder.isPending}>
              {createOrder.isPending ? "Creando..." : "Crear Encargo"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <StockDrawer 
        open={isStockDrawerOpen} 
        onOpenChange={setIsStockDrawerOpen} 
      />

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
                    {order.status === "pending" && (
                      <Button
                        onClick={() => updateOrder.mutate({ 
                          id: order.id, 
                          status: "completed" 
                        })}
                        disabled={updateOrder.isPending}
                      >
                        Completar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => deleteOrder.mutate(order.id)}
                      disabled={deleteOrder.isPending}
                    >
                      Eliminar
                    </Button>
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