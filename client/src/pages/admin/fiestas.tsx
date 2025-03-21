import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

// Componente de gestión de usuarios festeros
function UsuariosTab() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);

  // Datos de ejemplo para usuarios
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/auth/users'],
    retry: false
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-deleted" 
            checked={showDeleted} 
            onCheckedChange={setShowDeleted} 
          />
          <Label htmlFor="show-deleted">Mostrar usuarios eliminados</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-admins" 
            checked={showAdmins} 
            onCheckedChange={setShowAdmins} 
          />
          <Label htmlFor="show-admins">Mostrar administradores (haykakan)</Label>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-2 font-medium">Usuario</th>
              <th className="p-2 font-medium">Rol</th>
              <th className="p-2 font-medium">Comparsa</th>
              <th className="p-2 font-medium">Email</th>
              <th className="p-2 font-medium">Teléfono</th>
              <th className="p-2 font-medium">Estado</th>
              <th className="p-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">Cargando usuarios...</td>
              </tr>
            ) : users && users.length > 0 ? (
              users
                .filter(user => 
                  // Filtrar según el estado de los switches
                  (showAdmins || user.role === 'festero') && 
                  (showDeleted || user.active)
                )
                .map(user => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.role === 'haykakan' ? 'Administrador' : 'Festero'}</td>
                    <td className="p-2">{user.comparsaName || 'N/A'}</td>
                    <td className="p-2">{user.email || 'N/A'}</td>
                    <td className="p-2">{user.phone || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">Editar</button>
                        <button className="text-red-600 hover:text-red-800">
                          {user.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center">No hay usuarios disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente para mostrar el calendario de pedidos
function CalendarioTab() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendario de Fiestas</h1>
      <p className="text-muted-foreground">
        Visualiza los pedidos programados durante las fiestas (del 3 al 10 de septiembre).
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Septiembre 2025</CardTitle>
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
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function FiestasPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Fiestas</h2>
        <p className="text-muted-foreground">
          Administra usuarios festeros y visualiza pedidos durante las fiestas de Moros y Cristianos.
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usuarios">Usuarios Festeros</TabsTrigger>
          <TabsTrigger value="calendario">Calendario de Pedidos</TabsTrigger>
        </TabsList>
        <TabsContent value="usuarios" className="mt-6">
          <UsuariosTab />
        </TabsContent>
        <TabsContent value="calendario" className="mt-6">
          <CalendarioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}