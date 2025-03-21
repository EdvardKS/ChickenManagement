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
      console.log('🚀 API REQUEST - Iniciando solicitud al servidor para crear pedido:', data);
      console.log('🚀 API REQUEST - URL:', "/api/orders");
      console.log('🚀 API REQUEST - Método:', "POST");
      console.log('🚀 API REQUEST - Cuerpo:', JSON.stringify(data, null, 2));
      
      try {
        console.log('🚀 API REQUEST - Headers:', {
          'Content-Type': 'application/json'
        });
        
        // Verificar los valores esperados por el esquema
        console.log('🔍 API REQUEST - Verificación de datos enviados:');
        console.log(' - customerName:', typeof data.customerName, data.customerName);
        console.log(' - quantity:', typeof data.quantity, data.quantity);
        console.log(' - pickupTime:', typeof data.pickupTime, data.pickupTime);
        console.log(' - customerPhone:', typeof data.customerPhone, data.customerPhone);
        console.log(' - customerEmail:', typeof data.customerEmail, data.customerEmail);
        console.log(' - customerDNI:', typeof data.customerDNI, data.customerDNI);
        console.log(' - customerAddress:', typeof data.customerAddress, data.customerAddress);
        console.log(' - details:', typeof data.details, data.details);
        console.log(' - totalAmount:', typeof data.totalAmount, data.totalAmount);
        
        const result = await apiRequest("/api/orders", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        console.log('✅ API REQUEST - Respuesta exitosa del servidor:', result);
        return result;
      } catch (error) {
        console.error('❌ API REQUEST - Error en la solicitud:', error);
        console.error('❌ API REQUEST - Tipo de error:', Object.prototype.toString.call(error));
        
        if (error instanceof Error) {
          console.error('❌ API REQUEST - Mensaje de error:', error.message);
          console.error('❌ API REQUEST - Stack trace:', error.stack);
        }
        
        // Intentar extraer más información del error
        try {
          // @ts-ignore
          if (error.status) console.error('❌ API REQUEST - Status:', error.status);
          // @ts-ignore
          if (error.statusText) console.error('❌ API REQUEST - Status text:', error.statusText);
          // @ts-ignore
          if (error.data) console.error('❌ API REQUEST - Datos de error:', error.data);
        } catch (e) {
          console.error('❌ API REQUEST - No se pudieron extraer más detalles del error');
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ MUTATION SUCCESS - Pedido creado exitosamente:', data);
      
      console.log('🔄 MUTATION SUCCESS - Invalidando consultas para actualizar UI');
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      
      console.log('🔔 MUTATION SUCCESS - Mostrando notificación de éxito');
      toast({
        title: "Pedido realizado",
        description: "Tu pedido ha sido registrado correctamente",
      });
      
      console.log('🧹 MUTATION SUCCESS - Limpiando formulario');
      form.reset();
    },
    onError: (error: any) => {
      console.error('❌ MUTATION ERROR - Error al crear pedido:', error);
      
      // Mostrar todos los detalles del error en la consola para depuración
      console.error('❌ MUTATION ERROR - Objeto de error completo:', error);
      
      // Extraer y formatear los detalles del error para mostrarlos al usuario
      let errorTitle = "Error al crear el pedido";
      let errorMessage = "No se pudo realizar el pedido. Por favor, inténtalo de nuevo.";
      
      try {
        console.log('🔍 MUTATION ERROR - Analizando estructura del error...');
        
        // Si hay un mensaje amigable ya definido por el manejador de errores global
        if (error.friendlyMessage) {
          console.log('🔍 MUTATION ERROR - Usando mensaje amigable predefinido:', error.friendlyMessage);
          
          if (error.status === 401) {
            errorTitle = "Sesión requerida";
            errorMessage = error.friendlyMessage + "\n\nSerás redirigido a la página de inicio de sesión en unos momentos.";
          } else if (error.status === 403) {
            errorTitle = "Permiso denegado";
            errorMessage = error.friendlyMessage + "\n\nContacta con un administrador si crees que esto es un error.";
          } else {
            errorTitle = "Error en la aplicación";
            errorMessage = error.friendlyMessage;
          }
        }
        // Si no hay mensaje amigable, intentar extraer información útil
        else if (typeof error === 'object' && error !== null) {
          // Priorizar los detalles sobre el mensaje general si están disponibles
          if (error.details) {
            console.log('🔍 MUTATION ERROR - Usando detalles del error:', error.details);
            errorMessage = typeof error.details === 'string' 
              ? error.details 
              : JSON.stringify(error.details);
          }
          // Siguiente prioridad: mensaje del error
          else if (error.message) {
            console.log('🔍 MUTATION ERROR - Usando mensaje del error:', error.message);
            errorTitle = "Error: " + error.message.substring(0, 50);
            
            // Para errores de autenticación/autorización, personalizar mensaje
            if (error.status === 401) {
              errorTitle = "No has iniciado sesión";
              errorMessage = "Debes iniciar sesión para realizar esta acción.\n\nSerás redirigido automáticamente.";
            } else if (error.status === 403) {
              errorTitle = "No tienes permisos";
              errorMessage = "Tu usuario no tiene permisos para crear pedidos.\n\nContacta con un administrador.";
            }
          } 
          // Si hay una respuesta del servidor
          else if (error.response) {
            console.log('🔍 MUTATION ERROR - Usando respuesta del servidor:', error.response);
            const respMessage = error.response.message || error.response.error;
            if (respMessage) {
              errorMessage = typeof respMessage === 'string' 
                ? respMessage
                : JSON.stringify(respMessage);
            }
          }
          
          // Añadir código de estado si está disponible (para debugging)
          if (error.status) {
            console.log('🔍 MUTATION ERROR - Añadiendo código de estado:', error.status);
            if (process.env.NODE_ENV !== 'production') {
              errorMessage += `\n\n(Código de error: ${error.status})`;
            }
          }
        }
      } catch (e) {
        console.error('❌ MUTATION ERROR - Error al procesar mensaje de error:', e);
      }
      
      // Limitar la longitud del mensaje para que sea legible en el toast
      if (errorMessage.length > 200) {
        errorMessage = errorMessage.substring(0, 197) + '...';
      }
      
      console.log('🔔 MUTATION ERROR - Mensaje final a mostrar:', {
        title: errorTitle,
        description: errorMessage
      });
      
      // Mostrar el toast con la información de error
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 6000, // Más tiempo para leer mensajes de error
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('🧩 FORM SUBMIT - Datos recibidos del formulario:', data);
    console.log('🧩 FORM SUBMIT - Stock actual:', currentStock);
    
    // Validar stock suficiente
    if (data.quantity > Number(currentStock)) {
      console.error('❌ FORM SUBMIT - Stock insuficiente:', { 
        requested: data.quantity, 
        available: currentStock 
      });
      toast({
        title: "Stock insuficiente",
        description: `Has solicitado ${data.quantity} pollos, pero solo hay disponibles ${currentStock}`,
        variant: "destructive",
      });
      return;
    }
    
    // Asegurarse de que los datos cumplen con el esquema
    try {
      console.log('🧩 FORM SUBMIT - Procesando datos antes de envío...');
      
      // Convertir quantity a número explícitamente (para que coincida con el schema)
      // Garantizar que sea un número con decimales válidos (0.5, 1.0, etc)
      const quantityRaw = data.quantity.toString();
      console.log('🧩 FORM SUBMIT - Valor de cantidad antes de conversión:', quantityRaw, typeof quantityRaw);
      
      const quantity = parseFloat(quantityRaw);
      console.log('🧩 FORM SUBMIT - Valor de cantidad después de conversión:', quantity, typeof quantity);
      
      // Asegurar que la fecha esté en formato ISO
      console.log('🧩 FORM SUBMIT - Valor de fecha antes de conversión:', data.pickupTime, typeof data.pickupTime);
      const pickupTime = new Date(data.pickupTime);
      console.log('🧩 FORM SUBMIT - Valor de fecha después de conversión:', pickupTime, 'ISO:', pickupTime.toISOString());
      
      // Verificar validez de los datos
      if (isNaN(quantity)) {
        console.error('❌ FORM SUBMIT - Cantidad inválida:', data.quantity);
        throw new Error(`Cantidad inválida: "${data.quantity}"`);
      }
      
      if (quantity <= 0) {
        console.error('❌ FORM SUBMIT - Cantidad debe ser mayor que cero:', quantity);
        throw new Error('La cantidad debe ser mayor que cero');
      }
      
      if (isNaN(pickupTime.getTime())) {
        console.error('❌ FORM SUBMIT - Fecha de recogida inválida:', data.pickupTime);
        throw new Error(`Fecha de recogida inválida: "${data.pickupTime}"`);
      }
      
      // Preparar datos según el esquema esperado
      const orderData = {
        ...data,
        quantity: quantity,
        pickupTime: pickupTime.toISOString(),
        totalAmount: quantity * 1200, // 12€ por pollo
      };
      
      console.log('✅ FORM SUBMIT - Datos finales del pedido:', JSON.stringify(orderData, null, 2));
      
      // Realizar la mutación para crear el pedido
      console.log('🚀 FORM SUBMIT - Enviando pedido al servidor...');
      createOrder.mutate(orderData);
    } catch (error) {
      console.error('❌ FORM SUBMIT - Error en validación del formulario:', error);
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
