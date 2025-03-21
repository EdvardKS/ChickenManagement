import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertOrderSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrderFormProps {
  currentStock: number | string;
}

export default function OrderForm({ currentStock }: OrderFormProps) {
  const { toast } = useToast();

  // Convertimos la fecha a string tal como espera la API
  const today = new Date();
  
  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerDNI: "",
      customerAddress: "",
      quantity: 1,
      details: "",
      totalAmount: 0,
      pickupTime: today.toISOString(),
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({
        title: "Pedido realizado",
        description: "Tu pedido ha sido registrado correctamente",
      });
      form.reset();
    },
    onError: (error) => {
      console.error('Error al crear pedido:', error);
      
      // Intenta extraer el mensaje de error si está disponible
      let errorMessage = "No se pudo realizar el pedido. Por favor, inténtalo de nuevo.";
      
      try {
        if (typeof error === 'object' && error !== null) {
          const errorDetail = JSON.stringify(error);
          console.log('Detalles del error:', errorDetail);
          errorMessage = `Error: ${errorDetail}`;
        }
      } catch (e) {
        console.error('Error al procesar el mensaje de error:', e);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Validar stock suficiente
    if (data.quantity > Number(currentStock)) {
      toast({
        title: "Stock insuficiente",
        description: "No hay suficiente stock disponible para tu pedido",
        variant: "destructive",
      });
      return;
    }
    
    // Asegurarse de que los datos cumplen con el esquema
    try {
      // Convertir quantity a número explícitamente (para que coincida con el schema)
      // Garantizar que sea un número con decimales válidos (0.5, 1.0, etc)
      const quantity = parseFloat(data.quantity.toString());
      
      // Asegurar que la fecha esté en formato ISO
      const pickupTime = new Date(data.pickupTime);
      
      // Verificar validez de los datos
      if (isNaN(quantity)) {
        throw new Error('Cantidad inválida');
      }
      
      if (isNaN(pickupTime.getTime())) {
        throw new Error('Fecha de recogida inválida');
      }
      
      // Preparar datos según el esquema esperado
      const orderData = {
        ...data,
        quantity: quantity,
        pickupTime: pickupTime.toISOString(),
        totalAmount: quantity * 1200, // 12€ por pollo
      };
      
      console.log('Enviando pedido:', orderData);
      createOrder.mutate(orderData);
    } catch (error) {
      console.error('Error en validación del formulario:', error);
      toast({
        title: "Error en el formulario",
        description: error instanceof Error ? error.message : "Verifica los datos ingresados",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
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
                  <FormLabel>Cantidad de pollos</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0.5" 
                      max={currentStock}
                      step="0.5"
                      onChange={(e) => {
                        // Usar parseFloat para permitir decimales
                        const quantityValue = e.target.value;
                        const quantity = parseFloat(quantityValue);
                        
                        // Validar que sea un múltiplo de 0.5
                        const validQuantity = Math.round(quantity * 2) / 2;
                        
                        field.onChange(validQuantity);
                        form.setValue("totalAmount", validQuantity * 1200); // 12€ per chicken
                        
                        // Formatear el mensaje para mostrar enteros o fracciones correctamente
                        const quantityText = validQuantity === 1 
                          ? '1 pollo' 
                          : validQuantity === 0.5 
                            ? 'medio pollo'
                            : `${validQuantity} pollos`;
                            
                        form.setValue("details", quantityText);
                        
                        console.log('Cantidad seleccionada:', validQuantity);
                      }}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Hora de recogida</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date: Date | undefined) => {
                          // Convierte la fecha a ISO string al seleccionarla
                          if (date) {
                            // Asignar una hora por defecto a las 12:00
                            date.setHours(12, 0, 0, 0);
                            field.onChange(date.toISOString());
                            console.log('Fecha seleccionada:', date.toISOString());
                          }
                        }}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Procesando..." : "Realizar Pedido"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
