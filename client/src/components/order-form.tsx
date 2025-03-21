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
  currentStock: number;
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
      toast({
        title: "Error",
        description: "No se pudo realizar el pedido. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (data.quantity > currentStock) {
      toast({
        title: "Stock insuficiente",
        description: "No hay suficiente stock disponible para tu pedido",
        variant: "destructive",
      });
      return;
    }
    createOrder.mutate(data);
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
                      min="1" 
                      max={currentStock}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value);
                        field.onChange(quantity);
                        form.setValue("totalAmount", quantity * 1200); // 12€ per chicken
                        form.setValue("details", `${quantity} pollo(s)`);
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
                        selected={new Date(field.value)}
                        onSelect={(date: Date | undefined) => {
                          // Convierte la fecha a ISO string al seleccionarla
                          if (date) {
                            field.onChange(date.toISOString());
                          }
                        }}
                        disabled={(date) =>
                          date < new Date() || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        }
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
