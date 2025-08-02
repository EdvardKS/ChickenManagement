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
import { TimeSelector } from "@/components/ui/time-selector";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { sendWhatsAppMessage, isValidWhatsAppNumber } from "@/lib/whatsapp";
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
        <DrawerContent className="h-screen w-full max-w-none flex flex-col bg-gradient-to-br from-blue-50 to-gray-50">
        <DrawerHeader className="bg-white shadow-sm border-b p-8">
          <DrawerTitle className="text-4xl font-bold text-center text-gray-800">Nuevo Encargo</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex-grow overflow-auto p-6 space-y-4">

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <Label className="text-lg font-semibold text-gray-700">Nombre del cliente</Label>
            <Input 
              type="text" 
              placeholder="Introduce el nombre completo" 
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <Label className="text-lg font-semibold text-gray-700">Teléfono (opcional)</Label>
            <Input 
              type="tel" 
              placeholder="Número de teléfono"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <Label className="text-lg font-semibold text-gray-700">Cantidad de pollos</Label>
            <QuantitySelector
              value={parseFloat(formData.quantity) || 1}
              onChange={(quantity) => {
                setFormData({ 
                  ...formData, 
                  quantity: quantity.toString(),
                  totalAmount: quantity * 1200 // 12€ per chicken
                });
              }}
              disabled={createOrder.isPending}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <Label className="text-lg font-semibold text-gray-700 block">Fecha y hora de recogida</Label>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Fecha</Label>
                <Input 
                  type="date" 
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Hora</Label>
                <TimeSelector
                  value={formData.pickupTime}
                  onChange={(time) => setFormData({ ...formData, pickupTime: time })}
                  disabled={createOrder.isPending}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <Label className="text-lg font-semibold text-gray-700">Detalles adicionales</Label>
            <Textarea 
              placeholder="Especificaciones adicionales del pedido..." 
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full min-h-[80px] border-2 border-gray-200 focus:border-blue-500 rounded-lg p-3 resize-none"
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Creando encargo..." : "Crear Encargo"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );

}