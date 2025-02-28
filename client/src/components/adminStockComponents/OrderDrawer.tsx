import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import type { Order } from "@shared/schema";

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
    
    const message = encodeURIComponent(
      `Hola *${order.customerName}*, soy de [NOMBRE_NEGOCIO].\n` +
      `Tu pedido de *${order.quantity}* pollo(s) está registrado para recogida el *${order.pickupDate}* a las *${order.pickupTime}*.\n` +
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
          <DrawerTitle>Detalles del Pedido</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold">Cliente</h3>
            <p>{order.customerName}</p>
          </div>
          <div>
            <h3 className="font-semibold">Cantidad</h3>
            <p>{order.quantity} pollos</p>
          </div>
          {order.details && (
            <div>
              <h3 className="font-semibold">Detalles adicionales</h3>
              <p>{order.details}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold">Hora de recogida</h3>
            <p>{order.pickupTime}</p>
          </div>
          
          <div className="flex flex-col gap-2">
            {whatsappLink && (
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full" variant="outline">
                  Enviar WhatsApp
                </Button>
              </a>
            )}
            
            <Button 
              onClick={() => onConfirm(order.id)}
              className="w-full"
              variant="default"
            >
              ✔️ Confirmar Pedido
            </Button>
            
            <Button 
              onClick={() => onDelete(order.id)}
              className="w-full"
              variant="destructive"
            >
              ❌ Eliminar Pedido
            </Button>
            
            <Button 
              onClick={() => onError(order.id)}
              className="w-full"
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
