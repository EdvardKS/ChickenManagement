import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare } from "lucide-react"; 
import type { Order, InsertOrder, Stock } from "@shared/schema";
import { insertOrderSchema } from "@shared/schema";

function getDefaultPickupTime() {
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour >= 15) {
    return { date: format(now, 'yyyy-MM-dd'), time: "13:00" };
  } else if (currentHour === 13) {
    return { date: format(now, 'yyyy-MM-dd'), time: "14:30" };
  } else if (currentHour === 14) {
    return { date: format(now, 'yyyy-MM-dd'), time: "15:00" };
  } else {
    return { date: format(now, 'yyyy-MM-dd'), time: "13:30" };
  }
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isStockDrawerOpen, setIsStockDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    select: (data) => data.filter((order) => !order.delivered && !order.cancelled),
  });
  const { data: stock } = useQuery<Stock>({ queryKey: ["/api/stock"] });

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      quantity: 1,
      pickupDate: getDefaultPickupTime().date,
      pickupTime: getDefaultPickupTime().time,
      details: "",
      isHoliday: false,
      holidayName: "",
      createdFromPanel: true,
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      setIsNewOrderOpen(false);
      form.reset();
      toast({
        title: "Pedido creado",
        description: "El pedido se ha creado correctamente",
      });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Order> }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      setShowOrderDialog(false);
      setSelectedOrder(null);
    },
  });

  const handleOrderAction = (action: "deliver" | "cancel" | "error") => {
    if (!selectedOrder) return;

    const updates: Partial<Order> = {
      delivered: action === "deliver",
      cancelled: action === "cancel" || action === "error",
    };

    updateOrder.mutate({ id: selectedOrder.id, data: updates });

    toast({
      title:
        action === "deliver"
          ? "Pedido entregado"
          : action === "cancel"
          ? "Pedido cancelado"
          : "Pedido marcado como error",
      description: "El estado del pedido se ha actualizado correctamente",
    });
  };

  const handleWhatsApp = (phone: string) => {
    const message = encodeURIComponent(
      `¡Hola! Tu pedido está confirmado.\n` +
        `Cantidad: ${selectedOrder?.quantity} pollos\n` +
        `Fecha de recogida: ${format(
          new Date(selectedOrder?.pickupDate || new Date()),
          "dd/MM/yyyy",
          { locale: es }
        )}\n` +
        `Hora: ${selectedOrder?.pickupTime}\n` +
        (selectedOrder?.details ? `Notas: ${selectedOrder.details}\n` : "")
    );
    window.open(
      `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <Button
          onClick={() => setIsNewOrderOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Nuevo Encargo
        </Button>
      </div>

      {/* Tabla de pedidos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Fecha Recogida</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {order.customerPhone}
                    {order.customerPhone && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleWhatsApp(order.customerPhone || "")}
                      >
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  {format(new Date(order.pickupDate), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>{order.pickupTime}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDialog(true);
                    }}
                  >
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Drawer para Nuevo Encargo */}
      <Drawer open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DrawerContent className="h-screen flex flex-col max-w-2xl mx-auto">
          <DrawerHeader>
            <DrawerTitle>Nuevo Encargo</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 flex-grow overflow-auto">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createOrder.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de Pollos</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseFloat(value))}
                        value={field.value?.toString()}
                      >
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Recogida</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Recogida</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                            value={field.value || ""} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detalles del pedido (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHoliday"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Es día festivo</FormLabel>
                    </FormItem>
                  )}
                />

                {form.watch("isHoliday") && (
                  <FormField
                    control={form.control}
                    name="holidayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del festivo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Creando..." : "Crear Encargo"}
                </Button>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Diálogo de Detalles del Pedido */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cliente</Label>
                  <div className="col-span-3">{selectedOrder.customerName}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cantidad</Label>
                  <div className="col-span-3">
                    {selectedOrder.quantity} pollos
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Recogida</Label>
                  <div className="col-span-3">
                    {format(
                      new Date(selectedOrder.pickupDate),
                      "dd/MM/yyyy",
                      { locale: es }
                    )}{" "}
                    a las {selectedOrder.pickupTime}
                  </div>
                </div>
                {selectedOrder.details && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Detalles</Label>
                    <div className="col-span-3">{selectedOrder.details}</div>
                  </div>
                )}
                {selectedOrder.isHoliday && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Festivo</Label>
                    <div className="col-span-3">{selectedOrder.holidayName}</div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    variant="default"
                    onClick={() => handleOrderAction("deliver")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Marcar Entregado
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleOrderAction("cancel")}
                  >
                    Cancelar Pedido
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleOrderAction("error")}
                  >
                    Marcar Error
                  </Button>
                </div>
                {selectedOrder.customerPhone && (
                  <Button
                    variant="outline"
                    onClick={() => handleWhatsApp(selectedOrder.customerPhone || "")}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Enviar WhatsApp
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Drawer para gestión de Stock */}
      <Drawer
        open={isStockDrawerOpen}
        onOpenChange={setIsStockDrawerOpen}
        side="right"
      >
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
    </div>
  );
}

const handleStartDay = () => {
  if (
    window.confirm(
      "¿Estás seguro de que deseas iniciar un nuevo día? Esta acción no se puede deshacer."
    )
  ) {
    toast({
      title: "Día iniciado",
      description: "El nuevo día ha sido registrado correctamente.",
    });
    // Aquí puedes agregar la lógica para registrar el inicio del día en el backend
  }
};