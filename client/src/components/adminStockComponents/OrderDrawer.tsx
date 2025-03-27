import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
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
  const [isPreviewingInvoice, setIsPreviewingInvoice] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerEmail: order?.customerEmail || '',
      customerPhone: order?.customerPhone || '',
      customerDNI: order?.customerDNI || '',
      customerAddress: order?.customerAddress || '',
      totalAmount: order?.totalAmount ? parseFloat(order.totalAmount.toString()) : 0,
    }
  });

  const formValues = watch();

  const editForm = useForm({
    defaultValues: {
      customerName: '',
      details: '',
      pickupTime: '',
      customerPhone: ''
    }
  });

  useEffect(() => {
    if (order) {
      console.log('Setting form values:', order);
      editForm.reset({
        customerName: order.customerName || '',
        details: order.details || '',
        pickupTime: format(new Date(order.pickupTime), "yyyy-MM-dd'T'HH:mm"),
        customerPhone: order.customerPhone || ''
      });
      setSelectedQuantity(order.quantity?.toString() || "1");
    }
  }, [order]);

  // Reset menu state when the drawer opens or when order changes
  useEffect(() => {
    if (isOpen || order) {
      setIsMenuOpen(false);
    }
  }, [isOpen, order]);

  const generateInvoiceNumber = (id: number) => {
    return id.toString().padStart(6, '0');
  };

  const handleGenerateInvoice = async (data: any) => {
    if (!order) return;

    try {
      console.log('📄 Generating invoice for order:', order.id, 'with data:', data);

      const response = await apiRequest(`/api/orders/${order.id}/invoice`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = "Error al generar la factura";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Invoice generation error details:', errorData);
        } catch (e) {
          console.error('❌ Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      console.log('✅ Invoice generated successfully, downloading PDF...');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${generateInvoiceNumber(order.id)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Actualizar el pedido con la información de la factura
      const updateResponse = await apiRequest(`/api/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          invoiceNumber: generateInvoiceNumber(order.id),
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerDNI: data.customerDNI,
          customerAddress: data.customerAddress,
          totalAmount: data.totalAmount
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast({
        title: "Factura generada",
        description: "La factura se ha generado y descargado correctamente",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsGeneratingInvoice(false);
      setIsPreviewingInvoice(false);
    } catch (error: any) {
      console.error('❌ Error handling invoice generation:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la factura",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: any) => {
    try {
      console.log('🔄 OrderDrawer - Edit Submit - Starting with data:', data);

      const pickupTime = new Date(data.pickupTime);
      if (isNaN(pickupTime.getTime())) {
        toast({
          title: "Error",
          description: "La fecha de recogida no es válida",
          variant: "destructive"
        });
        return;
      }

      // Aseguramos que usamos el objeto Date directamente, no una cadena
      // para evitar incompatibilidades de tipo

      // Creamos un nuevo objeto para la actualización, utilizando solo los campos necesarios
      // Creamos un objeto de pedido actualizado con todos los campos requeridos
      // Asegurando que los campos de estado siempre se mantengan false
      const updatedOrderData = {
        id: order!.id,
        customerName: data.customerName,
        quantity: selectedQuantity,
        details: data.details || null,
        pickupTime: pickupTime, // Usamos el objeto Date directamente
        customerPhone: data.customerPhone || null,
        customerEmail: order!.customerEmail || null,
        customerDNI: order!.customerDNI || null,
        customerAddress: order!.customerAddress || null,
        status: "pending", // Mantenemos estado pending para ediciones normales
        deleted: false,    // Siempre mantenemos deleted en false
        totalAmount: order!.totalAmount || null,
        invoicePDF: order!.invoicePDF || null,
        invoiceNumber: order!.invoiceNumber || null,
        createdAt: order!.createdAt || null,
        updatedAt: order!.updatedAt || null
      };

      console.log('📤 OrderDrawer - Edit Submit - Sending updated order:', updatedOrderData);
      await onUpdate(updatedOrderData);

      setIsEditing(false);
      toast({
        title: "Éxito",
        description: "Pedido actualizado correctamente"
      });
    } catch (error) {
      console.error('❌ OrderDrawer - Edit Submit - Error:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsGeneratingInvoice(false);
    setIsPreviewingInvoice(false);
    setIsMenuOpen(false); // Asegurarnos de que el menú está cerrado
    reset();
    editForm.reset();
    setSelectedQuantity(""); 
  };

  if (!order) return null;

  const invoiceNumber = generateInvoiceNumber(order.id);

  const renderInvoicePreview = () => (
    <div className="p-6 border rounded-lg bg-white space-y-4">
      <div className="text-center border-b pb-4">
        <img
          src="/img/corporativa/slogan-negro.png"
          alt="Slogan"
          className="mx-auto h-16 mb-4"
        />
        <h2 className="text-3xl font-bold">Factura #{invoiceNumber}</h2>
        <p className="text-gray-600">{format(new Date(), "dd/MM/yyyy")}</p>
      </div>

      <div className="border-b pb-4 space-y-2">
        <h3 className="text-xl font-semibold mb-2">Datos del Cliente</h3>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Nombre</span>
          <span className="text-lg">{order.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">DNI/NIF</span>
          <span className="text-lg">{formValues.customerDNI}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Dirección</span>
          <span className="text-lg">{formValues.customerAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Teléfono</span>
          <span className="text-lg">{formValues.customerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Email</span>
          <span className="text-lg">{formValues.customerEmail}</span>
        </div>
      </div>

      <div className="border-b pb-4 space-y-2">
        <h3 className="text-xl font-semibold mb-2">Detalles del Pedido</h3>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Cantidad</span>
          <span className="text-lg">{order.quantity} pollos</span>
        </div>
        <div className="flex justify-between">
          <span className="text-lg font-semibold">Fecha de recogida</span>
          <span className="text-lg">{format(new Date(order.pickupTime), "dd/MM/yyyy HH:mm")}</span>
        </div>
        {order.details && (
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Detalles</span>
            <span className="text-lg">{order.details}</span>
          </div>
        )}
      </div>

      <div className="text-right">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Total (IVA incluido)</span>
          <span className="text-xl font-bold">{formValues.totalAmount?.toFixed(2)}€</span>
        </div>
      </div>
    </div>
  );

  const quantityOptions = [
    "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5",
    "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10",
    "11", "11.5", "12", "12.5", "13", "13.5", "14", "14.5",
    "15", "15.5", "16", "16.5", "17", "17.5"
  ];
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="min-h-[85vh] sm:min-h-[auto] font-['Poppins']">
        <DrawerHeader className="text-center border-b pb-4">
          <div className="flex justify-between items-center px-4">
            <div className="flex-1"></div>
            <img
              src="/img/corporativa/slogan-negro.png"
              alt="Slogan"
              className="h-36"
            />
            <div className="flex-1 flex justify-end">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border border-grey p-2 rounded-md"
                  >
                    <MoreVertical className="h-12 w-12" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="text-xl">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="text-xl py-4 px-6"
                  >
                    ✏️ Editar Pedido
                  </DropdownMenuItem>
                  {!order.invoicePDF && (
                    <DropdownMenuItem
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsGeneratingInvoice(true);
                      }}
                      className="text-xl py-4 px-6"
                    >
                      🧾 Generar Factura
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setIsMenuOpen(false);
                      onError(order.id);
                    }}
                    className="text-xl py-4 px-6"
                  >
                    ⚠️ Marcar como Error
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
          <DrawerTitle className="text-3xl mt-4">Factura #{invoiceNumber}</DrawerTitle>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {isGeneratingInvoice ? (
            <>
              <form onSubmit={handleSubmit(data => {
                setIsPreviewingInvoice(true);
              })} className="space-y-4">
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
                    Vista Previa
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>

              {isPreviewingInvoice && (
                <div className="mt-8 space-y-4">
                  {renderInvoicePreview()}
                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateInvoice(formValues)} className="flex-1">
                      Generar y Enviar Factura
                    </Button>
                    <Button onClick={() => setIsPreviewingInvoice(false)} variant="outline" className="flex-1">
                      Editar
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : isEditing ? (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <Label className="text-lg">Cliente</Label>
                <Input {...editForm.register('customerName')} className="mt-2" />
              </div>
              <div>
                <Label className="text-lg">Cantidad de Pollos</Label>
                <Select
                  value={selectedQuantity}
                  onValueChange={setSelectedQuantity}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleccionar cantidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((qty) => (
                      <SelectItem key={qty} value={qty}>
                        {qty} {qty === "1" ? "pollo" : "pollos"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Guardar Cambios
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Cliente:</span>
                  <span className="text-lg">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Pollos:</span>
                  <span className="text-lg">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Fecha:</span>
                  <span className="text-lg">
                    {format(new Date(order.pickupTime), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Hora:</span>
                  <span className="text-lg">
                    {format(new Date(order.pickupTime), "HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Teléfono:</span>
                  <span className="text-lg">{order.customerPhone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Detalles:</span>
                  <span className="text-lg text-right">{order.details || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button
                  onClick={() => onConfirm(order.id)}
                  className="w-full py-6 text-lg"
                >
                  ✅ Entregado
                </Button>
                <Button
                  onClick={() => onDelete(order.id)}
                  variant="outline"
                  className="w-full py-6 text-lg border border-red-500 text-red-500 hover:bg-red-50"
                >
                  ❌ Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}