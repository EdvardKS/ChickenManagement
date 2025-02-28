import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import type { Order } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrderDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: number) => void;
  onDelete: (id: number) => void;
  onError: (id: number) => void;
}

export function OrderDrawer({ order, isOpen, onOpenChange, onConfirm, onDelete, onError }: OrderDrawerProps) {
  const generateWhatsAppLink = (order: Order) => {
    if (!order.customerPhone) return null;

    const formattedDate = format(new Date(order.pickupTime), "d 'de' MMMM", { locale: es });
    const formattedTime = format(new Date(order.pickupTime), "HH:mm");

    const message = encodeURIComponent(
      `Hola *${order.customerName}*, soy de [NOMBRE_NEGOCIO].\n` +
      `Tu pedido de *${order.quantity}* pollo(s) está registrado para recogida el *${formattedDate}* a las *${formattedTime}*.\n` +
      `Si necesitas modificar algo, avísanos.\n` +
      `¡Gracias por tu compra! 🐔`
    );

    return `https://wa.me/34${order.customerPhone}?text=${message}`;
  };

  if (!order) return null;

  const whatsappLink = generateWhatsAppLink(order);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl">Detalles del Pedido</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Cliente</h3>
            <p className="text-lg">{order.customerName}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Cantidad</h3>
            <p className="text-lg">{order.quantity} pollos</p>
          </div>
          {order.details && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Detalles adicionales</h3>
              <p className="text-lg">{order.details}</p>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold mb-2">Fecha y hora de recogida</h3>
            <p className="text-lg">
              {format(new Date(order.pickupTime), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {whatsappLink && (
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full text-lg" variant="outline">
                  Enviar WhatsApp
                </Button>
              </a>
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
        </div>
      </DrawerContent>
    </Drawer>
  );
}