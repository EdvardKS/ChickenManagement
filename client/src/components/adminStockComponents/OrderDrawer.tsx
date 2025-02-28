import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";
import * as z from "zod";

const invoiceSchema = z.object({
  customerEmail: z.string().email("Email inválido").optional().nullable(),
  customerPhone: z.string().min(9, "Teléfono inválido").optional().nullable(),
  customerDNI: z.string().min(9, "DNI/NIF inválido").optional().nullable(),
  customerAddress: z.string().min(5, "Dirección inválida").optional().nullable(),
  totalAmount: z.number().min(0, "El total debe ser mayor que 0"),
});

interface OrderDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: number) => void;
  onDelete: (id: number) => void;
  onError: (id: number) => void;
  onUpdate: (order: Order) => void;
}

export function OrderDrawer({ 
  order, 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  onDelete, 
  onError,
  onUpdate 
}: OrderDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerEmail: order?.customerEmail || '',
      customerPhone: order?.customerPhone || '',
      customerDNI: order?.customerDNI || '',
      customerAddress: order?.customerAddress || '',
      totalAmount: order?.totalAmount ? parseFloat(order.totalAmount.toString()) : 0,
    }
  });

  const editForm = useForm({
    defaultValues: {
      customerName: order?.customerName || '',
      quantity: order?.quantity || '',
      details: order?.details || '',
      pickupTime: order?.pickupTime ? format(new Date(order.pickupTime), "yyyy-MM-dd'T'HH:mm") : '',
      customerPhone: order?.customerPhone || ''
    }
  });

  const generateInvoiceNumber = (id: number) => {
    return id.toString().padStart(6, '0');
  };

  const handleGenerateInvoice = async (data: any) => {
    if (!order) return;

    try {
      const response = await apiRequest("POST", `/api/orders/${order.id}/invoice`, data);
      if (!response.ok) throw new Error("Error al generar la factura");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${generateInvoiceNumber(order.id)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Factura generada",
        description: "La factura se ha generado y enviado correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsGeneratingInvoice(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la factura",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = (data: any) => {
    onUpdate({
      ...order!,
      ...data,
      pickupTime: new Date(data.pickupTime)
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsGeneratingInvoice(false);
    reset();
    editForm.reset();
  };

  if (!order) return null;

  const invoiceNumber = generateInvoiceNumber(order.id);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="min-h-[85vh] sm:min-h-[auto]">
        <DrawerHeader className="text-center border-b pb-4">
          <img 
            src="/img/corporativa/slogan-negro.png" 
            alt="Slogan" 
            className="mx-auto h-16 mb-4"
          />
          <DrawerTitle className="text-3xl">Factura #{invoiceNumber}</DrawerTitle>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {isGeneratingInvoice ? (
            <form onSubmit={handleSubmit(handleGenerateInvoice)} className="space-y-4">
              <div>
                <Label className="text-lg">Email del cliente</Label>
                <Input {...register('customerEmail')} className="mt-2" />
                {errors.customerEmail && (
                  <p className="text-red-500">{errors.customerEmail.message}</p>
                )}
              </div>
              <div>
                <Label className="text-lg">Teléfono</Label>
                <Input {...register('customerPhone')} className="mt-2" />
                {errors.customerPhone && (
                  <p className="text-red-500">{errors.customerPhone.message}</p>
                )}
              </div>
              <div>
                <Label className="text-lg">DNI/NIF</Label>
                <Input {...register('customerDNI')} className="mt-2" />
                {errors.customerDNI && (
                  <p className="text-red-500">{errors.customerDNI.message}</p>
                )}
              </div>
              <div>
                <Label className="text-lg">Dirección</Label>
                <Input {...register('customerAddress')} className="mt-2" />
                {errors.customerAddress && (
                  <p className="text-red-500">{errors.customerAddress.message}</p>
                )}
              </div>
              <div>
                <Label className="text-lg">Total (con IVA)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...register('totalAmount')} 
                  className="mt-2" 
                />
                {errors.totalAmount && (
                  <p className="text-red-500">{errors.totalAmount.message}</p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Generar y Enviar Factura
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          ) : isEditing ? (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <Label className="text-lg">Cliente</Label>
                <Input {...editForm.register('customerName')} className="mt-2" />
              </div>
              <div>
                <Label className="text-lg">Cantidad</Label>
                <Input {...editForm.register('quantity')} className="mt-2" />
              </div>
              <div>
                <Label className="text-lg">Detalles</Label>
                <Input {...editForm.register('details')} className="mt-2" />
              </div>
              <div>
                <Label className="text-lg">Fecha y hora</Label>
                <Input 
                  type="datetime-local" 
                  {...editForm.register('pickupTime')} 
                  className="mt-2" 
                />
              </div>
              <div>
                <Label className="text-lg">Teléfono</Label>
                <Input {...editForm.register('customerPhone')} className="mt-2" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Guardar
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-2">Datos del Cliente</h3>
                <p className="text-lg">Nombre: {order.customerName}</p>
                {order.customerPhone && <p className="text-lg">Teléfono: {order.customerPhone}</p>}
                {order.customerEmail && <p className="text-lg">Email: {order.customerEmail}</p>}
                {order.customerDNI && <p className="text-lg">DNI/NIF: {order.customerDNI}</p>}
                {order.customerAddress && <p className="text-lg">Dirección: {order.customerAddress}</p>}
              </div>

              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-2">Detalles del Pedido</h3>
                <p className="text-lg">Cantidad: {order.quantity} pollos</p>
                <p className="text-lg">
                  Fecha: {format(new Date(order.pickupTime), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-lg">
                  Hora: {format(new Date(order.pickupTime), "HH:mm")}
                </p>
                {order.details && (
                  <p className="text-lg">Detalles adicionales: {order.details}</p>
                )}
                {order.totalAmount && (
                  <p className="text-lg font-bold mt-2">
                    Total (IVA incluido): {parseFloat(order.totalAmount.toString()).toFixed(2)}€
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                {!order.invoicePDF && (
                  <Button
                    onClick={() => setIsGeneratingInvoice(true)}
                    className="w-full text-lg"
                    variant="outline"
                  >
                    🧾 Generar Factura
                  </Button>
                )}

                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full text-lg"
                  variant="outline"
                >
                  ✏️ Editar Pedido
                </Button>

                {order.customerPhone && (
                  <Button
                    onClick={() => {
                      const message = encodeURIComponent(
                        `Hola *${order.customerName}*, soy de [NOMBRE_NEGOCIO].\n` +
                        `Tu pedido de *${order.quantity}* pollo(s) está registrado para recogida el *${format(new Date(order.pickupTime), "d 'de' MMMM", { locale: es })}* a las *${format(new Date(order.pickupTime), "HH:mm")}*.\n` +
                        `Si necesitas modificar algo, avísanos.\n` +
                        `¡Gracias por tu compra! 🐔`
                      );
                      window.open(`https://wa.me/34${order.customerPhone}?text=${message}`, '_blank');
                    }}
                    className="w-full text-lg"
                    variant="outline"
                  >
                    💬 Enviar WhatsApp
                  </Button>
                )}

                <Button 
                  onClick={() => onConfirm(order.id)}
                  className="w-full text-lg"
                  variant="default"
                >
                  ✔️ Confirmar Pedido
                </Button>

                <Button 
                  onClick={() => onDelete(order.id)}
                  className="w-full text-lg"
                  variant="destructive"
                >
                  ❌ Eliminar Pedido
                </Button>

                <Button 
                  onClick={() => onError(order.id)}
                  className="w-full text-lg"
                  variant="outline"
                >
                  ⚠️ Marcar como Error
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}