import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/components/auth/auth-provider';
import { Loader } from '@/components/ui/loader';

interface Order {
  id: number;
  customerName: string;
  pickupTime: Date;
  quantity: string;
  status: string;
  details: string | null;
}

export default function FesteroPage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Establecer el rango para mostrar solo septiembre
  const from = new Date(new Date().getFullYear(), 8, 3); // 3 de septiembre
  const to = new Date(new Date().getFullYear(), 8, 10); // 10 de septiembre

  // Esta consulta se podría modificar para obtener solo pedidos del festero actual
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    retry: false
  });

  // Función para filtrar pedidos por fecha
  const getOrdersByDate = (selectedDate: Date | undefined) => {
    if (!selectedDate || !orders) return [];
    
    const formatted = selectedDate.toISOString().split('T')[0];
    
    return orders.filter((order: any) => {
      const orderDate = new Date(order.pickupTime).toISOString().split('T')[0];
      return orderDate === formatted;
    });
  };

  // Filtrar pedidos para la fecha seleccionada
  const selectedDateOrders = getOrdersByDate(date);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Portal de Fiestas - {user?.comparsaName || user?.name || user?.username}</h2>
        <p className="text-muted-foreground">
          Visualiza y gestiona pedidos durante las fiestas de Moros y Cristianos (3-10 septiembre).
        </p>
      </div>

      <Tabs defaultValue="calendario" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario">Calendario de Pedidos</TabsTrigger>
          <TabsTrigger value="historial">Mis Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendario" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Septiembre {new Date().getFullYear()}</CardTitle>
                <CardDescription>
                  Selecciona una fecha para ver los pedidos programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  fromDate={from}
                  toDate={to}
                  initialFocus
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Pedidos para el {date?.toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader size="md" />
                  </div>
                ) : selectedDateOrders.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateOrders.map((order: Order) => (
                      <div key={order.id} className="border rounded-md p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{order.customerName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Cantidad: {order.quantity}
                            </p>
                          </div>
                          <div>
                            <span className="inline-block rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-800">
                              {order.status}
                            </span>
                          </div>
                        </div>
                        {order.details && (
                          <p className="text-sm mt-2">{order.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Hora de recogida: {new Date(order.pickupTime).toLocaleTimeString('es-ES')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay pedidos programados para esta fecha.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="historial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Pedidos</CardTitle>
              <CardDescription>
                Historial de todos tus pedidos para las fiestas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader size="md" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          <th className="p-2 font-medium">Fecha</th>
                          <th className="p-2 font-medium">Cliente</th>
                          <th className="p-2 font-medium">Cantidad</th>
                          <th className="p-2 font-medium">Estado</th>
                          <th className="p-2 font-medium">Detalles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: Order) => (
                          <tr key={order.id} className="border-t hover:bg-muted/50">
                            <td className="p-2">
                              {new Date(order.pickupTime).toLocaleDateString('es-ES')}
                            </td>
                            <td className="p-2">{order.customerName}</td>
                            <td className="p-2">{order.quantity}</td>
                            <td className="p-2">
                              <span className="rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-800">
                                {order.status}
                              </span>
                            </td>
                            <td className="p-2">{order.details || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No tienes pedidos registrados en el sistema.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}