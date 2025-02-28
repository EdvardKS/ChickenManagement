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
    quantity: "",
    pickupDate: today.toISOString().split('T')[0],
    pickupTime: "13:30",
    details: "",
    totalAmount: 0, // Added totalAmount field
  });

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/orders", {
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        quantity: parseFloat(data.quantity),
        pickupTime: new Date(`${data.pickupDate}T${data.pickupTime}:00`),
        details: data.details,
        totalAmount: 0, // Required field, set to 0 for now
        is_manual_entry: true,
      });
      return res.json();
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
        quantity: "",
        pickupDate: today.toISOString().split('T')[0],
        pickupTime: "13:30",
        details: "",
        totalAmount: 0, // Added totalAmount field
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el encargo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.quantity || !formData.pickupDate || !formData.pickupTime) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    createOrder.mutate(formData);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-screen w-[74%] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Nuevo Encargo</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-grow overflow-auto">
          <div>
            <Label>Nombre del Cliente</Label>
            <Input 
              type="text" 
              placeholder="Ej. Juan Pérez" 
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>

          <div>
            <Label>Teléfono (opcional)</Label>
            <Input 
              type="tel" 
              placeholder="Ej. 666555444"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>

          <div>
            <Label>Cantidad de Pollos</Label>
            <Select
              value={formData.quantity}
              onValueChange={(value) => setFormData({ ...formData, quantity: value })}
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
          </div>

          <div>
            <Label>Fecha de Recogida</Label>
            <Input 
              type="date" 
              value={formData.pickupDate}
              onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
            />
          </div>

          <div>
            <Label>Hora de Recogida</Label>
            <Input 
              type="time" 
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
            />
          </div>

          <div>
            <Label>Detalles del pedido</Label>
            <Textarea 
              placeholder="¿Algo más?..." 
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>

          <Button 
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? "Creando..." : "Crear Encargo"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}