import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Stock } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface NewOrderDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewOrderDrawer({ isOpen, onOpenChange }: NewOrderDrawerProps) {
  const { toast } = useToast();
  const today = new Date();
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    quantity: "0",
    pickupDate: today.toISOString().split('T')[0],
    pickupTime: "13:30",
    details: "",
    totalAmount: 0, // Added totalAmount field
  });

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: data.customerName,
          customerPhone: data.customerPhone || null,
          quantity: parseFloat(data.quantity),
          pickupTime: new Date(`${data.pickupDate}T${data.pickupTime}:00`),
          details: data.details,
          totalAmount: 0,
          is_manual_entry: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Encargo creado",
        description: "El encargo se ha creado correctamente",
      });
      setFormData({
        customerName: "",
        customerPhone: "",
        quantity: "0",
        pickupDate: today.toISOString().split('T')[0],
        pickupTime: "13:30",
        details: "",
        totalAmount: 0,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear el encargo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.pickupDate || !formData.pickupTime) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const quantity = formData.quantity ? parseFloat(formData.quantity) : 0;

    createOrder.mutate({ ...formData, quantity });
  };


  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-screen md:h-auto max-h-screen w-full md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="text-3xl md:text-4xl lg:text-5xl text-center">Nuevo Encargo</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="p-4 md:p-6 my-2 md:my-4 space-y-4 md:space-y-6 flex-grow overflow-auto text-base md:text-xl lg:text-2xl">

          <div>
            <Label className="text-base md:text-xl lg:text-2xl">Nombre</Label>
            <Input 
              type="text" 
              placeholder=" " 
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl"
            />
          </div>

          <div>
            <Label className="text-base md:text-xl lg:text-2xl">Teléfono (opcional)</Label>
            <Input 
              type="tel" 
              placeholder=" "
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl"
            />
          </div>

          <div>
            <Label className="text-base md:text-xl lg:text-2xl">Pollos</Label>
            <Select
              value={formData.quantity}
              onValueChange={(value) => setFormData({ ...formData, quantity: value })}
            >
              <SelectTrigger className="w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl">
                <SelectValue placeholder="Selecciona la cantidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" className="text-base md:text-xl lg:text-2xl">0 pollos</SelectItem>
                {Array.from({ length: 20 }, (_, i) => {
                  const value = (i + 1) / 2;
                  return (
                    <SelectItem key={value} value={value.toString()} className="text-base md:text-xl lg:text-2xl">
                      {value === 1 ? "1 pollo" : `${value} pollos`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base md:text-xl lg:text-2xl">Fecha</Label>
              <Input 
                type="date" 
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl"
              />
            </div>

            <div>
              <Label className="text-base md:text-xl lg:text-2xl">Hora</Label>
              <Input 
                type="time" 
                value={formData.pickupTime}
                onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                className="w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-base md:text-xl lg:text-2xl">Detalles del pedido</Label>
            <Textarea 
              placeholder="¿Algo más?..." 
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl"
            />
          </div>

          <Button 
            type="submit"
            className="text-white w-full p-3 md:p-4 lg:p-6 my-2 md:my-3 lg:my-4 text-base md:text-xl lg:text-2xl"
            style={{ backgroundColor: "#67A4E0", borderColor: "#67A4E0" }}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? "Creando..." : "Crear Encargo"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );

}